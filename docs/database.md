# Database

## Migration

To create a new migration run:

```bash
npx supabase migration new <migration_name>
```

It will create a new file in `/supabase/migrations`, edit that sql file.\
Run this to push the migration to the cloud:

```bash
npx supabase db push
```

And then update the schema in `types/database.types.ts`\

```bash
npx supabase gen types typescript --project-id <your_project_id> > types/database.types.ts
```

## Table

## Database Types (`types/database.types.ts`)

Generated from Supabase schema. Regenerate with:

```bash
npx supabase gen types typescript --local > types/database.types.ts
```

## Staging & Backup

Use direct url pool in supabase postgresql://USER:PASSWORD@HOST:PORT/DATABASE
These following cmd was on Window OS:

```bash
pg_dump "SOURCE_URL" -n public -F c -f app.dump
```

```bash
pg_restore \
 -d "TARGET_URL" \
 --no-owner \
 --no-privileges \
 app.dump

```
