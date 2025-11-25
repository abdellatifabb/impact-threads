import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, LogOut, Users, Bell, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Family {
  id: string;
  name: string;
  location_city: string;
  location_country: string;
  banner_image_url: string | null;
}

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.name || 'Donor');

      // Get donor profile
      const { data: donorProfile } = await supabase
        .from('donor_profiles')
        .select('id, preferred_name')
        .eq('user_id', user.id)
        .single();

      if (donorProfile) {
        setUserName(donorProfile.preferred_name || profile?.name || 'Donor');

        // Get assigned families
        const { data: assignments } = await supabase
          .from('donor_family_assignments')
          .select(`
            family_id,
            families (
              id,
              name,
              location_city,
              location_country,
              banner_image_url
            )
          `)
          .eq('donor_id', donorProfile.id)
          .eq('status', 'active');

        if (assignments) {
          setFamilies(assignments.map((a: any) => a.families).filter(Boolean));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">Family Stories</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground text-lg">
            Check out the latest updates from the families you're supporting
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Families Supported</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{families.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Updates</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">3</div>
              <p className="text-xs text-muted-foreground">New stories to read</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">1</div>
              <p className="text-xs text-muted-foreground">Pending responses</p>
            </CardContent>
          </Card>
        </div>

        {/* Your Families */}
        <div>
          <h2 className="font-serif text-2xl mb-4">Your Families</h2>
          
          {families.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl mb-2">No Families Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't been matched with any families yet. Our team will connect you with families soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <Card key={family.id} className="shadow-soft hover:shadow-warm transition-shadow cursor-pointer overflow-hidden">
                  <Link to={`/donor/family/${family.id}`}>
                    {family.banner_image_url ? (
                      <div className="aspect-video w-full bg-muted overflow-hidden">
                        <img 
                          src={family.banner_image_url} 
                          alt={family.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Users className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="font-serif">{family.name}</CardTitle>
                      <CardDescription>
                        {family.location_city && family.location_country
                          ? `${family.location_city}, ${family.location_country}`
                          : family.location_country || 'Location not specified'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full rounded-full" variant="outline">
                        View Family
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
