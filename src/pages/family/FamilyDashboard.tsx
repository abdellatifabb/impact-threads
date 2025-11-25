import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Plus, Image as ImageIcon, X, LogOut, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  } | null;
}

interface MessageThread {
  id: string;
  family_id: string;
  donor_id: string;
  unread_count?: number;
  donor_profiles: {
    user_id: string;
    profiles: {
      name: string;
    } | null;
  } | null;
}

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const [family, setFamily] = useState<Family | null>(null);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
          async (payload) => {
            // Fetch the complete message with profile data
            const { data: newMessage } = await supabase
              .from('messages')
              .select(`
                *,
                profiles (name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (newMessage) {
              setMessages(prev => [...prev, newMessage as Message]);
              
              // Increment unread count if message is from someone else
              const { data: { user } } = await supabase.auth.getUser();
              if (user && newMessage.sender_user_id !== user.id) {
                setThreads(prev => prev.map(t => 
                  t.id === selectedThread ? { ...t, unread_count: (t.unread_count || 0) + 1 } : t
                ));
              }
            }
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

        // Get unread counts for each thread
        if (threadsData) {
          const threadsWithUnread = await Promise.all(
            threadsData.map(async (thread) => {
              const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', thread.id)
                .neq('sender_user_id', user.id)
                .is('read_at', null);

              return { ...thread, unread_count: count || 0 };
            })
          );
          setThreads(threadsWithUnread);
        }
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

    // Mark messages as read
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .neq('sender_user_id', user.id)
        .is('read_at', null);

      // Update unread count for this thread
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, unread_count: 0 } : t
      ));
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Only image files are supported",
        variant: "destructive",
      });
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, 5)); // Max 5 images
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  async function createPost() {
    if (!newPostBody.trim() || !family) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create the post first
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          family_id: family.id,
          created_by_user_id: user.id,
          title: newPostTitle.trim() || null,
          body: newPostBody.trim(),
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload images if any
      if (selectedFiles.length > 0 && postData) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${postData.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('family-posts')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('family-posts')
            .getPublicUrl(fileName);

          // Insert into post_media
          const { error: mediaError } = await supabase
            .from('post_media')
            .insert({
              post_id: postData.id,
              file_url: publicUrl,
              media_type: 'image',
            });

          if (mediaError) throw mediaError;
        });

        await Promise.all(uploadPromises);
      }

      setNewPostTitle("");
      setNewPostBody("");
      setSelectedFiles([]);
      toast({
        title: "Success",
        description: selectedFiles.length > 0 
          ? `Update posted successfully with ${selectedFiles.length} photo(s)`
          : "Update posted successfully",
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
    <div className="min-h-screen">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">{family.name}</span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
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
                        className="w-full justify-between"
                        onClick={() => setSelectedThread(thread.id)}
                      >
                        <span>{thread.donor_profiles?.profiles?.name || 'Unknown Donor'}</span>
                        {thread.unread_count! > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {thread.unread_count}
                          </Badge>
                        )}
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
                                  {msg.profiles?.name || 'Unknown'}
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
              
              <div>
                <label className="text-sm font-medium mb-2 block">Photos (Optional)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      disabled={selectedFiles.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={selectedFiles.length >= 5}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Photos ({selectedFiles.length}/5)
                    </Button>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
    </div>
  );
}
