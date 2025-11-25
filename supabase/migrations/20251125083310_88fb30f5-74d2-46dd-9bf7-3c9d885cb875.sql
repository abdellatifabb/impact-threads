-- Enable realtime for messages table so families and donors can see new messages instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;