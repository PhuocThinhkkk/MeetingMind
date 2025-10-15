alter table public.transcription_words
add constraint fk_transcript
foreign key (transcript_id)
references public.transcripts(id)
on delete cascade;

