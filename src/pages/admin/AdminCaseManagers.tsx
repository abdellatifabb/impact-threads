import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, LogOut, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaseManager {
  id: string;
  user_id: string;
  title: string | null;
  region: string | null;
  phone: string | null;
  profiles: {
    name: string;
  };
}

const AdminCaseManagers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseManagers, setCaseManagers] = useState<CaseManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCaseManager, setSelectedCaseManager] = useState<CaseManager | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadCaseManagers();
  }, []);

  const loadCaseManagers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('case_manager_profiles')
      .select(`
        *,
        profiles!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading case managers", description: error.message, variant: "destructive" });
    } else {
      setCaseManagers(data || []);
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
          role: 'case_manager',
          roleData: {
            title: title || null,
            region: region || null,
            phone: phone || null
          }
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error("User creation failed");

      toast({ 
        title: "Success", 
        description: "Case manager created and invitation email sent successfully" 
      });
      setIsCreateOpen(false);
      resetForm();
      loadCaseManagers();
    } catch (error: any) {
      toast({ 
        title: "Error creating case manager", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseManager) return;

    try {
      // Update profile name
      const { error: nameError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', selectedCaseManager.user_id);

      if (nameError) throw nameError;

      // Update case manager profile
      const { error: cmError } = await supabase
        .from('case_manager_profiles')
        .update({
          title: title || null,
          region: region || null,
          phone: phone || null
        })
        .eq('id', selectedCaseManager.id);

      if (cmError) throw cmError;

      toast({ title: "Success", description: "Case manager updated successfully" });
      setIsEditOpen(false);
      setSelectedCaseManager(null);
      resetForm();
      loadCaseManagers();
    } catch (error: any) {
      toast({ title: "Error updating case manager", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (caseManager: CaseManager) => {
    if (!confirm(`Delete case manager ${caseManager.profiles.name}?`)) return;

    try {
      const { error } = await supabase
        .from('case_manager_profiles')
        .delete()
        .eq('id', caseManager.id);

      if (error) throw error;

      toast({ title: "Success", description: "Case manager deleted successfully" });
      loadCaseManagers();
    } catch (error: any) {
      toast({ title: "Error deleting case manager", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (caseManager: CaseManager) => {
    setSelectedCaseManager(caseManager);
    setName(caseManager.profiles.name);
    setTitle(caseManager.title || "");
    setRegion(caseManager.region || "");
    setPhone(caseManager.phone || "");
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setTitle("");
    setRegion("");
    setPhone("");
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
                <span className="font-serif text-xl font-semibold">Manage Case Managers</span>
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
            <CardTitle>Case Managers</CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Case Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Case Manager</DialogTitle>
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
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Senior Case Manager"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., North Region"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Case Manager</Button>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseManagers.map((cm) => (
                    <TableRow key={cm.id}>
                      <TableCell className="font-medium">{cm.profiles.name}</TableCell>
                      <TableCell>{cm.title || "-"}</TableCell>
                      <TableCell>{cm.region || "-"}</TableCell>
                      <TableCell>{cm.phone || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(cm)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cm)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {caseManagers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No case managers yet. Create your first case manager to get started.
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
            <DialogTitle>Edit Case Manager</DialogTitle>
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
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-region">Region</Label>
              <Input
                id="edit-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Update Case Manager</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCaseManagers;
