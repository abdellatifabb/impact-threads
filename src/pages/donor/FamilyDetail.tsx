import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Heart, MapPin, Users, MessageCircle, Send, ArrowLeft, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Family {
  id: string;
  name: string;
  location_city: string;
  location_country: string;
  story: string;
  banner_image_url: string | null;
}

interface Child {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  school: string | null;
  photo_url: string | null;
  notes: string | null;
}

interface Post {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
  created_by_user_id: string;
  profiles: {
    name: string;
  } | null;
  post_media: {
    file_url: string;
    caption: string | null;
  }[];
}

interface Message {
  id: string;
  body: string;
  created_at: string;
  sender_user_id: string;
  profiles: {
    name: string;
    role: string;
  } | null;
}

const FamilyDetail = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, [familyId]);

  const loadFamilyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      // Load family details
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (familyError) throw familyError;
      setFamily(familyData);

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId)
        .order('age', { ascending: false });

      setChildren(childrenData || []);

      // Load posts with media and author
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_created_by_user_id_fkey(name),
          post_media(file_url, caption)
        `)
        .eq('family_id', familyId)
        .eq('visibility', 'visible')
        .order('created_at', { ascending: false });

      setPosts(postsData || []);

      // Get donor profile
      const { data: donorProfile } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (donorProfile) {
        // Get or create message thread
        let { data: thread } = await supabase
          .from('message_threads')
          .select('id')
          .eq('donor_id', donorProfile.id)
          .eq('family_id', familyId)
          .single();

        if (!thread) {
          // Create thread if doesn't exist
          const { data: newThread } = await supabase
            .from('message_threads')
            .insert({
              donor_id: donorProfile.id,
              family_id: familyId,
            })
            .select('id')
            .single();

          thread = newThread;
        }

        if (thread) {
          setThreadId(thread.id);

          // Load messages
          const { data: messagesData } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!messages_sender_user_id_fkey(name, role)
            `)
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: true });

          setMessages(messagesData || []);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading family data",
        description: error.message,
        variant: "destructive",
      });
      navigate('/donor');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !threadId) return;

    setSendingMessage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_user_id: user.id,
          body: messageText.trim(),
        })
        .select(`
          *,
          profiles!messages_sender_user_id_fkey(name, role)
        `)
        .single();

      if (error) throw error;

      setMessages([...messages, newMessage]);
      setMessageText("");
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the case manager.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRequestUpdate = async () => {
    if (!requestText.trim()) return;

    setSubmittingRequest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: donorProfile } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!donorProfile) throw new Error('Donor profile not found');

      const { error } = await supabase
        .from('update_requests')
        .insert({
          donor_id: donorProfile.id,
          family_id: familyId,
          request_text: requestText.trim(),
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Update request sent",
        description: "The case manager will respond to your request soon.",
      });

      setRequestText("");
      setRequestDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="font-serif text-2xl mb-2">Family not found</h2>
          <Link to="/donor">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/donor" className="flex items-center gap-2 hover:opacity-70 transition">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">Family Stories</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-64 md:h-80">
        {family.banner_image_url ? (
          <img 
            src={family.banner_image_url} 
            alt={family.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Users className="h-24 w-24 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">{family.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {family.location_city && family.location_country
                  ? `${family.location_city}, ${family.location_country}`
                  : family.location_country || 'Location not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8">
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Bell className="h-4 w-4 mr-2" />
                Request Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Request an Update</DialogTitle>
                <DialogDescription>
                  Ask the family or case manager for a specific update about the children or family situation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="request">What would you like to know?</Label>
                  <Textarea
                    id="request"
                    placeholder="For example: How is Amina doing in school this semester?"
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRequestUpdate} 
                  disabled={!requestText.trim() || submittingRequest}
                  className="rounded-full"
                >
                  {submittingRequest ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="story" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Story Tab */}
          <TabsContent value="story">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Family Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {family.story || "No story available yet."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children">
            <div className="grid md:grid-cols-2 gap-6">
              {children.length === 0 ? (
                <Card className="shadow-soft col-span-2">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No children information available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                children.map((child) => (
                  <Card key={child.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={child.photo_url || undefined} alt={child.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {child.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="font-serif text-xl">{child.name}</CardTitle>
                          <CardDescription>
                            {child.age && `Age ${child.age}`}
                            {child.age && child.gender && " • "}
                            {child.gender}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {child.school && (
                        <div>
                          <span className="text-sm font-medium">School:</span>
                          <p className="text-muted-foreground">{child.school}</p>
                        </div>
                      )}
                      {child.notes && (
                        <div>
                          <span className="text-sm font-medium">Notes:</span>
                          <p className="text-muted-foreground">{child.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-serif text-xl mb-2">No updates yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Check back soon for updates from the family!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="shadow-soft">
                    <CardHeader>
                      {post.title && (
                        <CardTitle className="font-serif text-xl mb-2">{post.title}</CardTitle>
                      )}
                      <CardDescription>
                        Posted by {post.profiles?.name || 'Unknown'} •{" "}
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.body}</p>
                      
                      {post.post_media.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {post.post_media.map((media, index) => (
                            <div key={index} className="space-y-2">
                              <img
                                src={media.file_url}
                                alt={media.caption || "Update photo"}
                                className="w-full rounded-lg object-cover aspect-video"
                              />
                              {media.caption && (
                                <p className="text-sm text-muted-foreground">{media.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-serif">Messages</CardTitle>
                <CardDescription>
                  Send messages to the family's case manager
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((message) => {
                      const isFromDonor = message.profiles?.role === 'donor';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromDonor ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              isFromDonor
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border'
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">{message.profiles?.name || 'Unknown'}</p>
                            <p className="whitespace-pre-wrap">{message.body}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sendingMessage}
                  />
                  <Button 
                    type="submit" 
                    disabled={!messageText.trim() || sendingMessage}
                    className="rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FamilyDetail;
