# Supabase Setup Guide

This guide will help you set up Supabase for storing user accounts in SprintNotes.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: SprintNotes (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to finish setting up (usually 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon in the sidebar)
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long JWT token)
   - **service_role** key (another long JWT token - keep this secret!)

## Step 3: Set Up Environment Variables

1. In the root of your project, create a `.env.local` file (if it doesn't exist)
2. Copy the contents from `.env.local.example` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `NEXT_PUBLIC_` prefix makes these variables available to client-side code
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side

## Step 4: Run the SQL Schema

1. In your Supabase dashboard, click on **SQL Editor** in the sidebar
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents and paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

This will create:
- The `users` table with all necessary columns
- Indexes for faster queries
- Row Level Security (RLS) policies
- A trigger to automatically update the `updated_at` timestamp
- A public view for user profiles

## Step 5: Install Dependencies

Run the following command to install Supabase and bcrypt dependencies:

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client library
- `bcryptjs` - Password hashing library
- `@types/bcryptjs` - TypeScript types for bcryptjs

## Step 6: Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try creating a new account through the signup flow
3. Check your Supabase dashboard:
   - Go to **Table Editor**
   - Click on the `users` table
   - You should see your newly created user (without the password hash visible)

## Security Notes

- **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds before storage
- **Row Level Security**: The database uses RLS to ensure users can only access their own data
- **Environment Variables**: Never expose your service role key in client-side code
- **HTTPS**: Supabase requires HTTPS for production use

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env.local` file exists and has the correct variable names
- Restart your development server after adding environment variables

### Error: "relation 'users' does not exist"
- Make sure you've run the SQL schema in the Supabase SQL Editor
- Check that the table was created in the Table Editor

### Error: "Failed to create account"
- Check the Supabase dashboard logs for more details
- Verify your API keys are correct
- Make sure RLS policies allow INSERT operations

## Next Steps

- Consider setting up Supabase Auth for more advanced authentication features
- Add email verification if needed
- Set up database backups
- Configure additional RLS policies based on your needs

For more information, visit the [Supabase documentation](https://supabase.com/docs).

