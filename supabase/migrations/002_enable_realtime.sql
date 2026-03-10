-- Enable Realtime for progress table so other browsers/tabs get updates
-- Run in Supabase SQL Editor if 001_create_progress was run manually

alter publication supabase_realtime add table public.progress;
