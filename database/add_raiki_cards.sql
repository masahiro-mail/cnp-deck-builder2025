-- Add raiki_cards column to saved_decks table
-- This column will store the Raiki deck configuration as JSON

ALTER TABLE saved_decks 
ADD COLUMN raiki_cards JSONB DEFAULT '{"blue":0,"red":0,"yellow":0,"green":0,"purple":0}';

-- Update existing records to have default raiki_cards
UPDATE saved_decks 
SET raiki_cards = '{"blue":0,"red":0,"yellow":0,"green":0,"purple":0}'
WHERE raiki_cards IS NULL;

-- Add comment to the column
COMMENT ON COLUMN saved_decks.raiki_cards IS 'Raiki card configuration for 5 colors (blue, red, yellow, green, purple), total must be 15';

-- Create index for raiki_cards queries (optional, for performance)
CREATE INDEX idx_saved_decks_raiki_cards ON saved_decks USING GIN (raiki_cards);