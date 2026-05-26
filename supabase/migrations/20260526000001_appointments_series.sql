ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS appointment_type text DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS series_id uuid;
