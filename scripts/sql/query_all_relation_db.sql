select
  tc.table_name        as source_table,
  kcu.column_name      as source_column,
  ccu.table_name       as target_table,
  ccu.column_name      as target_column,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
order by source_table;
