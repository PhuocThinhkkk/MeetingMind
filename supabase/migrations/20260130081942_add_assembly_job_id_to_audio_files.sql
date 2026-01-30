-- Add AssemblyAI job id to audio_files table
ALTER TABLE public.audio_files
ADD COLUMN assembly_job_id TEXT;

-- (Optional but recommended)
-- If each audio file maps to exactly one AssemblyAI job
CREATE UNIQUE INDEX IF NOT EXISTS audio_files_assembly_job_id_idx
ON public.audio_files (assembly_job_id);
