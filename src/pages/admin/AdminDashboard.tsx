import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, LogOut, Users, UserCog, Home as HomeIcon, MessageCircle } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalFamilies: 0,
    totalCaseManagers: 0,
    totalPosts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [donors, families, caseManagers, posts] = await Promise.all([
      supabase.from('donor_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('families').select('id', { count: 'exact', head: true }),
      supabase.from('case_manager_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalDonors: donors.count || 0,
      totalFamilies: families.count || 0,
      totalCaseManagers: caseManagers.count || 0,
      totalPosts: posts.count || 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">Admin Dashboard</span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage donors, families, case managers, and platform content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.totalDonors}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Families</CardTitle>
              <HomeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.totalFamilies}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Case Managers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.totalCaseManagers}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.totalPosts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Manage Donors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                View, create, edit, and manage donor profiles and their family assignments.
              </p>
              <Link to="/admin/donors">
                <Button className="w-full rounded-full">View Donors</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-primary" />
                Manage Families
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create and edit family profiles, manage children information, and view all updates.
              </p>
              <Link to="/admin/families">
                <Button className="w-full rounded-full">View Families</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Manage Case Managers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Add and manage case manager accounts and their family assignments.
              </p>
              <Link to="/admin/case-managers">
                <Button className="w-full rounded-full">View Case Managers</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Manage Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Assign donors to families and families to case managers.
              </p>
              <Link to="/admin/assignments">
                <Button className="w-full rounded-full">Manage Assignments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
