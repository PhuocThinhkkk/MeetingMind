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
## Table


