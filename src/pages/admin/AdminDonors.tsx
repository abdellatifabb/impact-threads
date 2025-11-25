import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Heart, LogOut, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Donor {
  id: string;
  user_id: string;
  preferred_name: string | null;
  bio: string | null;
  profiles: {
    name: string;
    email?: string;
  };
}

const AdminDonors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('donor_profiles')
      .select(`
        *,
        profiles!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading donors", description: error.message, variant: "destructive" });
    } else {
      setDonors(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call edge function to create user and send invitation
      const { data, error } = await supabase.functions.invoke('create-user-with-invitation', {
        body: {
          email,
          name,
          role: 'donor',
          roleData: {
            preferred_name: preferredName || null,
            bio: bio || null
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error("User creation failed");

      toast({ 
        title: "Success", 
        description: "Donor created and invitation email sent successfully" 
      });
      setIsCreateOpen(false);
      resetForm();
      loadDonors();
    } catch (error: any) {
      toast({ 
        title: "Error creating donor", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;

    try {
      // Update profile name
      const { error: nameError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', selectedDonor.user_id);

      if (nameError) throw nameError;

      // Update donor profile
      const { error: donorError } = await supabase
        .from('donor_profiles')
        .update({
          preferred_name: preferredName || null,
          bio: bio || null
        })
        .eq('id', selectedDonor.id);

      if (donorError) throw donorError;

      toast({ title: "Success", description: "Donor updated successfully" });
      setIsEditOpen(false);
      setSelectedDonor(null);
      resetForm();
      loadDonors();
    } catch (error: any) {
      toast({ title: "Error updating donor", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (donor: Donor) => {
    if (!confirm(`Delete donor ${donor.profiles.name}?`)) return;

    try {
      const { error } = await supabase
        .from('donor_profiles')
        .delete()
        .eq('id', donor.id);

      if (error) throw error;

      toast({ title: "Success", description: "Donor deleted successfully" });
      loadDonors();
    } catch (error: any) {
      toast({ title: "Error deleting donor", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (donor: Donor) => {
    setSelectedDonor(donor);
    setName(donor.profiles.name);
    setPreferredName(donor.preferred_name || "");
    setBio(donor.bio || "");
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPreferredName("");
    setBio("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="font-serif text-xl font-semibold">Manage Donors</span>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Donors</CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Donor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Donor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      An invitation email will be sent to set up their password
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="preferredName">Preferred Name</Label>
                    <Input
                      id="preferredName"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Donor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Preferred Name</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">{donor.profiles.name}</TableCell>
                      <TableCell>{donor.preferred_name || "-"}</TableCell>
                      <TableCell className="max-w-md truncate">{donor.bio || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(donor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(donor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {donors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No donors yet. Create your first donor to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-preferredName">Preferred Name</Label>
              <Input
                id="edit-preferredName"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">Update Donor</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDonors;
