import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, LogOut, Users, Bell, FileText } from "lucide-react";

const CaseManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assignedFamilies: 0,
    activeDonors: 0,
    pendingRequests: 0,
  });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    setUserName(profile?.name || 'Case Manager');

    // Get case manager profile
    const { data: cmProfile } = await supabase
      .from('case_manager_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cmProfile) {
      // Count assigned families
      const { count: familyCount } = await supabase
        .from('case_manager_family_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('case_manager_id', cmProfile.id);

      // Count pending update requests for assigned families
      const { data: assignments } = await supabase
        .from('case_manager_family_assignments')
        .select('family_id')
        .eq('case_manager_id', cmProfile.id);

      if (assignments) {
        const familyIds = assignments.map(a => a.family_id);
        
        const { count: requestCount } = await supabase
          .from('update_requests')
          .select('*', { count: 'exact', head: true })
          .in('family_id', familyIds)
          .eq('status', 'pending');

        // Count unique donors assigned to these families
        const { data: donorAssignments } = await supabase
          .from('donor_family_assignments')
          .select('donor_id')
          .in('family_id', familyIds)
          .eq('status', 'active');

        const uniqueDonors = new Set(donorAssignments?.map(d => d.donor_id) || []);

        setStats({
          assignedFamilies: familyCount || 0,
          activeDonors: uniqueDonors.size,
          pendingRequests: requestCount || 0,
        });
      }
    }
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
              <span className="font-serif text-xl font-semibold">Case Manager Portal</span>
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
          <h1 className="font-serif text-4xl mb-2">Welcome, {userName}</h1>
          <p className="text-muted-foreground text-lg">
            Manage your assigned families and respond to donor requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Families</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.assignedFamilies}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.activeDonors}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Need your attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                My Families
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                View and manage all families assigned to you, create updates, and track progress.
              </p>
              <Link to="/case-manager/families">
                <Button className="w-full rounded-full">View Families</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Update Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Review and respond to update requests from donors. {stats.pendingRequests > 0 && `${stats.pendingRequests} pending.`}
              </p>
              <Link to="/case-manager/requests">
                <Button className="w-full rounded-full">
                  View Requests
                  {stats.pendingRequests > 0 && (
                    <span className="ml-2 bg-primary-foreground text-primary px-2 py-0.5 rounded-full text-xs">
                      {stats.pendingRequests}
                    </span>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseManagerDashboard;
