# Database

## Migration
To create a new migration run: 
````bash
npx supabase migration new <migration_name>
````
It will create a new file in `/supabase/migrations`, edit that sql file.\
Run this to push the migration to the cloud:
````bash
npx supabase db push
````
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

