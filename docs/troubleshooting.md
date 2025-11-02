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


