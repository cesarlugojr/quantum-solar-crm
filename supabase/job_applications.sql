-- Create job_applications table for job application form data
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(100) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  
  -- Experience & Qualifications
  years_experience VARCHAR(50),
  previous_employer VARCHAR(255),
  current_salary VARCHAR(100),
  desired_salary VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  certifications TEXT,
  licenses TEXT,
  
  -- Job-Specific Skills Test (New)
  skills_test_question1 TEXT,
  skills_test_question2 TEXT,
  skills_test_question3 TEXT,
  skills_test_question4 TEXT,
  skills_test_question5 TEXT,
  skills_test_practical_scenario TEXT,
  
  -- References
  reference1_name VARCHAR(255) NOT NULL,
  reference1_phone VARCHAR(20) NOT NULL,
  reference1_relationship VARCHAR(100) NOT NULL,
  reference2_name VARCHAR(255) NOT NULL,
  reference2_phone VARCHAR(20) NOT NULL,
  reference2_relationship VARCHAR(100) NOT NULL,
  
  -- Additional Information
  cover_letter TEXT,
  why_quantum_solar TEXT NOT NULL,
  availability TEXT,
  transportation_reliable BOOLEAN NOT NULL DEFAULT false,
  background_check_consent BOOLEAN NOT NULL DEFAULT false,
  
  -- Application Status & Metadata
  application_status VARCHAR(50) DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common queries
CREATE INDEX idx_job_applications_email ON job_applications(email);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_submitted_at ON job_applications(submitted_at);
