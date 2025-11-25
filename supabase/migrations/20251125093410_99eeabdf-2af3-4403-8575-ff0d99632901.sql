-- Add translation fields to messages table
ALTER TABLE messages 
ADD COLUMN body_en TEXT,
ADD COLUMN body_ar TEXT,
ADD COLUMN original_language TEXT CHECK (original_language IN ('en', 'ar'));

-- Update existing messages to set English as default
UPDATE messages SET body_en = body, original_language = 'en' WHERE body_en IS NULL;

-- Add comment explaining the fields
COMMENT ON COLUMN messages.body_en IS 'English translation of the message';
COMMENT ON COLUMN messages.body_ar IS 'Arabic translation of the message';
COMMENT ON COLUMN messages.original_language IS 'Original language of the message (en or ar)';