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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, LogOut, Plus, Pencil, Trash2, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Family {
  id: string;
  name: string;
  location_city: string | null;
  location_country: string | null;
  story: string | null;
  status: string;
  children: { count: number }[];
}

interface Child {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  school: string | null;
  notes: string | null;
}

const AdminFamilies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChildrenOpen, setIsChildrenOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [isChildFormOpen, setIsChildFormOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Family form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [story, setStory] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "graduated">("active");

  // Child form states
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childGender, setChildGender] = useState("");
  const [childSchool, setChildSchool] = useState("");
  const [childNotes, setChildNotes] = useState("");

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('families')
      .select(`
        *,
        children(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error loading families", description: error.message, variant: "destructive" });
    } else {
      setFamilies(data || []);
    }
    setLoading(false);
  };

  const loadChildren = async (familyId: string) => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .order('name');

    if (error) {
      toast({ title: "Error loading children", description: error.message, variant: "destructive" });
    } else {
      setChildren(data || []);
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('families')
        .insert({
          name,
          location_city: city || null,
          location_country: country || null,
          story: story || null,
          status
        });

      if (error) throw error;

      toast({ title: "Success", description: "Family created successfully" });
      setIsCreateOpen(false);
      resetFamilyForm();
      loadFamilies();
    } catch (error: any) {
      toast({ title: "Error creating family", description: error.message, variant: "destructive" });
    }
  };

  const handleEditFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) return;

    try {
      const { error } = await supabase
        .from('families')
        .update({
          name,
          location_city: city || null,
          location_country: country || null,
          story: story || null,
          status
        })
        .eq('id', selectedFamily.id);

      if (error) throw error;

      toast({ title: "Success", description: "Family updated successfully" });
      setIsEditOpen(false);
      setSelectedFamily(null);
      resetFamilyForm();
      loadFamilies();
    } catch (error: any) {
      toast({ title: "Error updating family", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteFamily = async (family: Family) => {
    if (!confirm(`Delete family "${family.name}"? This will also delete all children records.`)) return;

    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', family.id);

      if (error) throw error;

      toast({ title: "Success", description: "Family deleted successfully" });
      loadFamilies();
    } catch (error: any) {
      toast({ title: "Error deleting family", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) return;

    try {
      const childData = {
        family_id: selectedFamily.id,
        name: childName,
        age: childAge ? parseInt(childAge) : null,
        gender: childGender || null,
        school: childSchool || null,
        notes: childNotes || null
      };

      if (editingChild) {
        const { error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', editingChild.id);
        if (error) throw error;
        toast({ title: "Success", description: "Child updated successfully" });
      } else {
        const { error } = await supabase
          .from('children')
          .insert(childData);
        if (error) throw error;
        toast({ title: "Success", description: "Child added successfully" });
      }

      setIsChildFormOpen(false);
      resetChildForm();
      loadChildren(selectedFamily.id);
    } catch (error: any) {
      toast({ title: "Error saving child", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm("Delete this child?")) return;

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      toast({ title: "Success", description: "Child deleted successfully" });
      if (selectedFamily) loadChildren(selectedFamily.id);
    } catch (error: any) {
      toast({ title: "Error deleting child", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (family: Family) => {
    setSelectedFamily(family);
    setName(family.name);
    setCity(family.location_city || "");
    setCountry(family.location_country || "");
    setStory(family.story || "");
    setStatus(family.status as any);
    setIsEditOpen(true);
  };

  const openChildrenDialog = async (family: Family) => {
    setSelectedFamily(family);
    await loadChildren(family.id);
    setIsChildrenOpen(true);
  };

  const openChildForm = (child?: Child) => {
    if (child) {
      setEditingChild(child);
      setChildName(child.name);
      setChildAge(child.age?.toString() || "");
      setChildGender(child.gender || "");
      setChildSchool(child.school || "");
      setChildNotes(child.notes || "");
    }
    setIsChildFormOpen(true);
  };

  const resetFamilyForm = () => {
    setName("");
    setCity("");
    setCountry("");
    setStory("");
    setStatus("active");
  };

  const resetChildForm = () => {
    setEditingChild(null);
    setChildName("");
    setChildAge("");
    setChildGender("");
    setChildSchool("");
    setChildNotes("");
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
                <span className="font-serif text-xl font-semibold">Manage Families</span>
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
            <CardTitle>Families</CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Family
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Family</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFamily} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Family Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="story">Family Story</Label>
                    <Textarea
                      id="story"
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Family</Button>
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
                    <TableHead>Family Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Children</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {families.map((family) => (
                    <TableRow key={family.id}>
                      <TableCell className="font-medium">{family.name}</TableCell>
                      <TableCell>
                        {[family.location_city, family.location_country].filter(Boolean).join(', ') || '-'}
                      </TableCell>
                      <TableCell>{family.children[0]?.count || 0}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          family.status === 'active' ? 'bg-green-100 text-green-800' :
                          family.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {family.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openChildrenDialog(family)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(family)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFamily(family)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {families.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No families yet. Create your first family to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Family Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Family</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFamily} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Family Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-story">Family Story</Label>
              <Textarea
                id="edit-story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full">Update Family</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Children Management Dialog */}
      <Dialog open={isChildrenOpen} onOpenChange={setIsChildrenOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Children - {selectedFamily?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={() => openChildForm()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>{child.name}</TableCell>
                    <TableCell>{child.age || '-'}</TableCell>
                    <TableCell>{child.gender || '-'}</TableCell>
                    <TableCell>{child.school || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openChildForm(child)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChild(child.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {children.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No children added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Child Form Dialog */}
      <Dialog open={isChildFormOpen} onOpenChange={(open) => {
        setIsChildFormOpen(open);
        if (!open) resetChildForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChild ? 'Edit' : 'Add'} Child</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveChild} className="space-y-4">
            <div>
              <Label htmlFor="child-name">Name *</Label>
              <Input
                id="child-name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="child-age">Age</Label>
                <Input
                  id="child-age"
                  type="number"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="child-gender">Gender</Label>
                <Input
                  id="child-gender"
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="child-school">School</Label>
              <Input
                id="child-school"
                value={childSchool}
                onChange={(e) => setChildSchool(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="child-notes">Notes</Label>
              <Textarea
                id="child-notes"
                value={childNotes}
                onChange={(e) => setChildNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              {editingChild ? 'Update' : 'Add'} Child
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFamilies;
