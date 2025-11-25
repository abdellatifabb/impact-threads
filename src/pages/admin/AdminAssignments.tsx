import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, LogOut, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DonorAssignment {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  donor_profiles: {
    profiles: { name: string };
  };
  families: {
    name: string;
  };
}

interface CaseManagerAssignment {
  id: string;
  start_date: string;
  end_date: string | null;
  case_manager_profiles: {
    profiles: { name: string };
  };
  families: {
    name: string;
  };
}

const AdminAssignments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donorAssignments, setDonorAssignments] = useState<DonorAssignment[]>([]);
  const [cmAssignments, setCmAssignments] = useState<CaseManagerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDonorDialogOpen, setIsDonorDialogOpen] = useState(false);
  const [isCmDialogOpen, setIsCmDialogOpen] = useState(false);

  const [donors, setDonors] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [caseManagers, setCaseManagers] = useState<any[]>([]);

  const [selectedDonor, setSelectedDonor] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedCaseManager, setSelectedCaseManager] = useState("");
  const [selectedFamilyForCm, setSelectedFamilyForCm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadDonorAssignments(),
      loadCmAssignments(),
      loadDropdownData()
    ]);
    setLoading(false);
  };

  const loadDonorAssignments = async () => {
    const { data, error } = await supabase
      .from('donor_family_assignments')
      .select(`
        *,
        donor_profiles!inner(
          profiles!inner(name)
        ),
        families!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading donor assignments", description: error.message, variant: "destructive" });
    } else {
      setDonorAssignments(data || []);
    }
  };

  const loadCmAssignments = async () => {
    const { data, error } = await supabase
      .from('case_manager_family_assignments')
      .select(`
        *,
        case_manager_profiles!inner(
          profiles!inner(name)
        ),
        families!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading case manager assignments", description: error.message, variant: "destructive" });
    } else {
      setCmAssignments(data || []);
    }
  };

  const loadDropdownData = async () => {
    const [donorsRes, familiesRes, cmRes] = await Promise.all([
      supabase.from('donor_profiles').select('id, profiles!inner(name)'),
      supabase.from('families').select('id, name').eq('status', 'active'),
      supabase.from('case_manager_profiles').select('id, profiles!inner(name)')
    ]);

    if (donorsRes.data) setDonors(donorsRes.data);
    if (familiesRes.data) setFamilies(familiesRes.data);
    if (cmRes.data) setCaseManagers(cmRes.data);
  };

  const handleCreateDonorAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('donor_family_assignments')
        .insert({
          donor_id: selectedDonor,
          family_id: selectedFamily,
          status: 'active'
        });

      if (error) throw error;

      toast({ title: "Success", description: "Donor assigned to family" });
      setIsDonorDialogOpen(false);
      setSelectedDonor("");
      setSelectedFamily("");
      loadDonorAssignments();
    } catch (error: any) {
      toast({ title: "Error creating assignment", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateCmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('case_manager_family_assignments')
        .insert({
          case_manager_id: selectedCaseManager,
          family_id: selectedFamilyForCm
        });

      if (error) throw error;

      toast({ title: "Success", description: "Case manager assigned to family" });
      setIsCmDialogOpen(false);
      setSelectedCaseManager("");
      setSelectedFamilyForCm("");
      loadCmAssignments();
    } catch (error: any) {
      toast({ title: "Error creating assignment", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteDonorAssignment = async (id: string) => {
    if (!confirm("Remove this assignment?")) return;

    try {
      const { error } = await supabase
        .from('donor_family_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Assignment removed" });
      loadDonorAssignments();
    } catch (error: any) {
      toast({ title: "Error deleting assignment", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCmAssignment = async (id: string) => {
    if (!confirm("Remove this assignment?")) return;

    try {
      const { error } = await supabase
        .from('case_manager_family_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Assignment removed" });
      loadCmAssignments();
    } catch (error: any) {
      toast({ title: "Error deleting assignment", description: error.message, variant: "destructive" });
    }
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
                <span className="font-serif text-xl font-semibold">Manage Assignments</span>
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
        <Tabs defaultValue="donors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="donors">Donor Assignments</TabsTrigger>
            <TabsTrigger value="case-managers">Case Manager Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="donors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Donor-Family Assignments</CardTitle>
                <Dialog open={isDonorDialogOpen} onOpenChange={setIsDonorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Donor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Donor to Family</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDonorAssignment} className="space-y-4">
                      <div>
                        <Label>Donor</Label>
                        <Select value={selectedDonor} onValueChange={setSelectedDonor} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select donor" />
                          </SelectTrigger>
                          <SelectContent>
                            {donors.map((donor) => (
                              <SelectItem key={donor.id} value={donor.id}>
                                {donor.profiles.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Family</Label>
                        <Select value={selectedFamily} onValueChange={setSelectedFamily} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select family" />
                          </SelectTrigger>
                          <SelectContent>
                            {families.map((family) => (
                              <SelectItem key={family.id} value={family.id}>
                                {family.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">Create Assignment</Button>
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
                        <TableHead>Donor</TableHead>
                        <TableHead>Family</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donorAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.donor_profiles.profiles.name}</TableCell>
                          <TableCell>{assignment.families.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                              assignment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(assignment.start_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDonorAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {donorAssignments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No donor assignments yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="case-managers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Case Manager-Family Assignments</CardTitle>
                <Dialog open={isCmDialogOpen} onOpenChange={setIsCmDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Case Manager
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Case Manager to Family</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCmAssignment} className="space-y-4">
                      <div>
                        <Label>Case Manager</Label>
                        <Select value={selectedCaseManager} onValueChange={setSelectedCaseManager} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select case manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {caseManagers.map((cm) => (
                              <SelectItem key={cm.id} value={cm.id}>
                                {cm.profiles.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Family</Label>
                        <Select value={selectedFamilyForCm} onValueChange={setSelectedFamilyForCm} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select family" />
                          </SelectTrigger>
                          <SelectContent>
                            {families.map((family) => (
                              <SelectItem key={family.id} value={family.id}>
                                {family.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">Create Assignment</Button>
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
                        <TableHead>Case Manager</TableHead>
                        <TableHead>Family</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cmAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.case_manager_profiles.profiles.name}</TableCell>
                          <TableCell>{assignment.families.name}</TableCell>
                          <TableCell>{new Date(assignment.start_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCmAssignment(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {cmAssignments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No case manager assignments yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAssignments;
