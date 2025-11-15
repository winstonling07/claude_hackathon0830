# Troubleshooting "Failed to Create Account"

If you're seeing "Failed to create account" error, follow these steps:

## 1. Check Browser Console

Open your browser's developer console (F12 or Cmd+Option+I) and check for any error messages. The error should now be more descriptive.

## 2. Verify Supabase Setup

### Environment Variables
Make sure you have `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Verify Variables are Loaded
- Restart your dev server after adding environment variables: `npm run dev`
- Environment variables are only loaded when the server starts

## 3. Verify Database Table Exists

The `users` table must exist in your Supabase database:

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Run the SQL from `supabase/schema.sql`
4. Verify the table exists:
   - Go to **Table Editor** in the sidebar
   - You should see a `users` table

## 4. Check Row Level Security (RLS)

The schema includes RLS policies. Make sure:
- RLS is enabled on the `users` table
- The "Allow anonymous signup" policy exists
- If using service role key, it should bypass RLS

## 5. Common Error Messages and Solutions

### "Database table not found"
- **Solution**: Run the SQL schema in Supabase SQL Editor

### "Database connection error"
- **Solution**: Check your Supabase URL and API keys are correct

### "Database not configured"
- **Solution**: Make sure `.env.local` exists and has the correct values

### "An account with this email already exists"
- **Solution**: Use a different email or check if you've already signed up

### "Password encryption failed"
- **Solution**: This is rare, but try again or check server logs

## 6. Check Server Logs

Look at your terminal where `npm run dev` is running. You should see detailed error messages that will help identify the issue.

## 7. Test Supabase Connection

You can test if Supabase is configured correctly by checking:
- Supabase dashboard shows your project is active
- API keys are correct (from Settings > API)
- Network tab in browser shows API calls to Supabase

## 8. Still Not Working?

1. Check that your Supabase project is not paused (free tier pauses after inactivity)
2. Verify you have internet connection
3. Try restarting your dev server
4. Check Supabase dashboard for any service alerts
5. Verify the database password is set correctly

