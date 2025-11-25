import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user's role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // Redirect based on role
          if (profile?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (profile?.role === 'case_manager') {
            navigate('/case-manager', { replace: true });
          } else if (profile?.role === 'donor') {
            navigate('/donor', { replace: true });
          } else if (profile?.role === 'family') {
            navigate('/family', { replace: true });
          }
        } else {
          // Not logged in, redirect to login
          navigate('/auth/login', { replace: true });
        }
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/auth/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
};

export default Index;
