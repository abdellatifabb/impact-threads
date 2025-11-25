import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Plus } from "lucide-react";

interface Family {
  id: string;
  name: string;
  story: string;
  location_city: string;
  location_country: string;
}

interface Message {
  id: string;
  body: string;
  created_at: string;
  sender_user_id: string;
  profiles: {
    name: string;
  };
}

interface MessageThread {
  id: string;
  family_id: string;
  donor_id: string;
  donor_profiles: {
    user_id: string;
    profiles: {
      name: string;
    };
  };
}

export default function FamilyDashboard() {
  const [family, setFamily] = useState<Family | null>(null);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFamilyData();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages-${selectedThread}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `thread_id=eq.${selectedThread}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedThread]);

  async function loadFamilyData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get family profile
      const { data: familyData } = await supabase
        .from('families')
        .select('*')
        .eq('family_user_id', user.id)
        .single();

      if (familyData) {
        setFamily(familyData);

        // Get message threads
        const { data: threadsData } = await supabase
          .from('message_threads')
          .select(`
            *,
            donor_profiles (
              user_id,
              profiles (name)
            )
          `)
          .eq('family_id', familyData.id);

        setThreads(threadsData || []);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
      toast({
        title: "Error",
        description: "Failed to load family data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(threadId: string) {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (name)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedThread) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThread,
          sender_user_id: user.id,
          body: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Success",
        description: "Message sent",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  async function createPost() {
    if (!newPostBody.trim() || !family) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('posts')
        .insert({
          family_id: family.id,
          created_by_user_id: user.id,
          title: newPostTitle.trim() || null,
          body: newPostBody.trim(),
        });

      if (error) throw error;

      setNewPostTitle("");
      setNewPostBody("");
      toast({
        title: "Success",
        description: "Update posted successfully",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to post update",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>No Family Profile</CardTitle>
            <CardDescription>
              You don't have a family profile associated with your account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{family.name}</h1>
        <p className="text-muted-foreground">
          {family.location_city}, {family.location_country}
        </p>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="post">Post Update</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages with Donors</CardTitle>
              <CardDescription>
                Communicate with your donors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threads.length === 0 ? (
                <p className="text-muted-foreground">No message threads yet</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    {threads.map((thread) => (
                      <Button
                        key={thread.id}
                        variant={selectedThread === thread.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedThread(thread.id)}
                      >
                        {thread.donor_profiles.profiles.name}
                      </Button>
                    ))}
                  </div>

                  <div className="md:col-span-2">
                    {selectedThread ? (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 h-[400px] overflow-y-auto space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {msg.profiles.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{msg.body}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                          >
                            {sending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                        Select a conversation to view messages
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="post" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post an Update</CardTitle>
              <CardDescription>
                Share updates with your donors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title (Optional)</label>
                <Input
                  placeholder="Update title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="What would you like to share?"
                  value={newPostBody}
                  onChange={(e) => setNewPostBody(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <Button
                onClick={createPost}
                disabled={sending || !newPostBody.trim()}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Post Update
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
