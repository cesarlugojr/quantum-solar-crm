-- Create chatbot_conversations table for AI chatbot lead capture and conversation tracking
CREATE TABLE chatbot_conversations (
  id SERIAL PRIMARY KEY,
  
  -- Lead Data (stored as JSONB for flexibility)
  lead_data JSONB NOT NULL DEFAULT '{}',
  
  -- Conversation Tracking
  last_message TEXT,
  last_response TEXT,
  conversation_history JSONB DEFAULT '[]',
  
  -- Lead Status and Intent
  intent VARCHAR(50),
  lead_status VARCHAR(20) DEFAULT 'active',
  capture_ready BOOLEAN DEFAULT FALSE,
  
  -- Contact Information (extracted from lead_data for easier querying)
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  monthly_bill DECIMAL(10,2),
  
  -- Metadata
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_chatbot_conversations_email ON chatbot_conversations(email) WHERE email IS NOT NULL;
CREATE INDEX idx_chatbot_conversations_phone ON chatbot_conversations(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_chatbot_conversations_intent ON chatbot_conversations(intent);
CREATE INDEX idx_chatbot_conversations_lead_status ON chatbot_conversations(lead_status);
CREATE INDEX idx_chatbot_conversations_capture_ready ON chatbot_conversations(capture_ready);
CREATE INDEX idx_chatbot_conversations_created_at ON chatbot_conversations(created_at);
CREATE INDEX idx_chatbot_conversations_last_activity ON chatbot_conversations(last_activity_at);
CREATE INDEX idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);

-- GIN index for JSONB lead_data queries
CREATE INDEX idx_chatbot_conversations_lead_data_gin ON chatbot_conversations USING GIN (lead_data);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatbot_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_activity_at = CURRENT_TIMESTAMP;
    
    -- Extract contact info from lead_data for easier querying
    IF NEW.lead_data ? 'name' THEN
        NEW.name = NEW.lead_data->>'name';
    END IF;
    
    IF NEW.lead_data ? 'email' THEN
        NEW.email = NEW.lead_data->>'email';
    END IF;
    
    IF NEW.lead_data ? 'phone' THEN
        NEW.phone = NEW.lead_data->>'phone';
    END IF;
    
    IF NEW.lead_data ? 'monthlyBill' THEN
        NEW.monthly_bill = (NEW.lead_data->>'monthlyBill')::DECIMAL;
    END IF;
    
    IF NEW.lead_data ? 'intent' THEN
        NEW.intent = NEW.lead_data->>'intent';
    END IF;
    
    -- Set capture_ready if we have name, phone, and email
    IF NEW.name IS NOT NULL AND NEW.phone IS NOT NULL AND NEW.email IS NOT NULL THEN
        NEW.capture_ready = TRUE;
        NEW.lead_status = 'qualified';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamps and extract contact info
CREATE TRIGGER trigger_update_chatbot_conversations_updated_at
    BEFORE UPDATE ON chatbot_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_conversations_updated_at();

-- Create trigger for INSERT to extract contact info initially
CREATE TRIGGER trigger_extract_chatbot_lead_data_on_insert
    BEFORE INSERT ON chatbot_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_conversations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE chatbot_conversations IS 'Stores AI chatbot conversations and captured lead data';
COMMENT ON COLUMN chatbot_conversations.lead_data IS 'JSONB field storing flexible lead data including name, email, phone, monthlyBill, intent, etc.';
COMMENT ON COLUMN chatbot_conversations.conversation_history IS 'JSONB array storing full conversation history between user and bot';
COMMENT ON COLUMN chatbot_conversations.capture_ready IS 'Boolean indicating if lead has provided complete contact information (name, phone, email)';
COMMENT ON COLUMN chatbot_conversations.lead_status IS 'Status of the lead: active, qualified, contacted, converted, etc.';
