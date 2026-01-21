# Troubleshooting

This guide covers common issues and their solutions when working with MeetingMind.


### Migration Errors

**Problem:** Database migrations fail.
**Solutions:**

1. **Check connection:**
   ```bash
   npx supabase db remote commit
   ```

2. **View migration status:**
   ```bash
   npx supabase migration list
   ```

## Connection failed
**Error:** {"Type":"AuthenticationSASLFinal","Data":"e=Wrong password"} failed to connect to postgres: failed to connect to `host=aws-0.............`: failed SASL auth (invalid SCRAM server-final-message received from server)
**Problem:** Database password havent has on env when running cmd ( even it was on .env file )
**Verify:** Run ```echo $env:SUPABASE_DB_PASSWORD ```on terminal shows nothing
**Solution:** Go to supabase, taking the password and then set it ```$env:SUPABASE_DB_PASSWORD="<YOUR_PASSWORD>"```


