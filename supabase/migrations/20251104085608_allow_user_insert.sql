create policy "Users can insert their own record"
on "public"."users"
for insert
to authenticated
with check (
  auth.uid() = id
);

