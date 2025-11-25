import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("EMAIL_HOST") ?? "",
    port: Number(Deno.env.get("EMAIL_PORT")) ?? 465,
    tls: true,
    auth: {
      username: Deno.env.get("EMAIL_USER") ?? "",
      password: Deno.env.get("EMAIL_PASS") ?? "",
    },
  },
});

interface CreateUserRequest {
  email: string;
  name: string;
  role: 'donor' | 'case_manager';
  roleData?: {
    preferred_name?: string;
    bio?: string;
    title?: string;
    region?: string;
    phone?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, name, role, roleData }: CreateUserRequest = await req.json();

    // Generate a random password for the user
    const tempPassword = crypto.randomUUID();

    // Create user using Admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        name,
        role,
      },
    });

    if (userError) {
      console.error("Error creating user:", userError);
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userData.user.id,
        name,
        role,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Rollback user creation
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to create profile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create role-specific profile
    if (role === "donor") {
      const { error: donorError } = await supabaseAdmin
        .from("donor_profiles")
        .insert({
          user_id: userData.user.id,
          preferred_name: roleData?.preferred_name || null,
          bio: roleData?.bio || null,
        });

      if (donorError) {
        console.error("Error creating donor profile:", donorError);
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to create donor profile" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (role === "case_manager") {
      const { error: cmError } = await supabaseAdmin
        .from("case_manager_profiles")
        .insert({
          user_id: userData.user.id,
          title: roleData?.title || null,
          region: roleData?.region || null,
          phone: roleData?.phone || null,
        });

      if (cmError) {
        console.error("Error creating case manager profile:", cmError);
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to create case manager profile" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate password reset link (invitation link)
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
    }

    // Send invitation email
    const roleName = role === 'donor' ? 'Donor' : 'Case Manager';
    const inviteLink = resetData?.properties?.action_link || `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify`;

    await smtpClient.send({
      from: Deno.env.get("EMAIL_SENDER") ?? "",
      to: email,
      subject: `Welcome to the Family Support Platform - ${roleName} Invitation`,
      content: "auto",
      html: `
        <h1>Welcome ${name}!</h1>
        <p>You have been invited to join the Family Support Platform as a ${roleName}.</p>
        <p>Click the link below to set up your account and create a password:</p>
        <p><a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Set Up Your Account</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${inviteLink}</p>
        <p>Best regards,<br>The Family Support Team</p>
      `,
    });

    await smtpClient.close();

    return new Response(
      JSON.stringify({ success: true, user: userData.user }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in create-user-with-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
