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
**Problem:** Database password isn't set in the environment when running the command (even if it's in .env).
**Verify:** Run `echo $env:SUPABASE_DB_PASSWORD` in PowerShell; it prints nothing.
**Solution:** Get the password from Supabase and set it: `$env:SUPABASE_DB_PASSWORD="<YOUR_PASSWORD>"`.
