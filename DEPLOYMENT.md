# Deployment Guide - AI Cyber Crime Reporter

## Prerequisites

Before deploying to Vercel (or any other platform), ensure you have:

1. ✅ A Lovable Cloud / Supabase project set up
2. ✅ Edge function `analyze-report` deployed
3. ✅ LOVABLE_API_KEY configured in Supabase secrets
4. ✅ All environment variables ready

---

## Environment Variables

You **MUST** configure these environment variables in your Vercel project settings:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Where to find these values:

1. **VITE_SUPABASE_URL**: Your Supabase project URL
2. **VITE_SUPABASE_PUBLISHABLE_KEY**: Found in Supabase Project Settings → API → anon/public key
3. **VITE_SUPABASE_PROJECT_ID**: Your Supabase project ID (from project URL)

---

## Vercel Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Project Settings → Environment Variables
4. Deploy

---

## Edge Function Configuration

Make sure your Supabase edge function is properly configured:

### File: `supabase/config.toml`

```toml
project_id = "your-project-id"

[functions.analyze-report]
verify_jwt = false
```

### Deploy Edge Function:

```bash
# If using Supabase CLI
supabase functions deploy analyze-report

# Or deploy through Lovable Cloud (automatic)
```

---

## Troubleshooting Common Deployment Issues

### Issue 1: "Failed to send request to edge function"

**Cause**: Environment variables not properly configured or edge function not deployed

**Solution**:
1. Verify all environment variables are set in Vercel
2. Ensure edge function is deployed to Supabase
3. Check that LOVABLE_API_KEY is configured in Supabase secrets
4. Verify `supabase/config.toml` has correct project_id

### Issue 2: CORS Errors

**Cause**: CORS headers not properly configured in edge function

**Solution**:
- Edge function already includes proper CORS headers
- If issue persists, check Supabase project CORS settings

### Issue 3: Rate Limiting / 429 Errors

**Cause**: Too many requests to Lovable AI gateway

**Solution**:
- App includes automatic retry logic with exponential backoff
- Add rate limiting on frontend if needed
- Consider caching responses for common queries

### Issue 4: Build Errors

**Cause**: Missing dependencies or TypeScript errors

**Solution**:
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

### Issue 5: Environment Variables Not Loading

**Cause**: Variables not prefixed with `VITE_` or not added to Vercel

**Solution**:
- All client-side env vars MUST be prefixed with `VITE_`
- Add to both `.env.local` (development) and Vercel settings (production)
- Redeploy after adding variables

---

## Post-Deployment Checklist

After deployment, verify:

- ✅ Homepage loads correctly
- ✅ All 6 category cards display properly
- ✅ Category selection works
- ✅ Report form validates input correctly
- ✅ Example problems can be clicked and loaded
- ✅ AI analysis completes successfully
- ✅ Error messages display for failed requests
- ✅ Copy and download buttons work
- ✅ "Submit New Report" returns to categories

---

## Performance Optimization

The app includes:

- ✅ Automatic retry logic (up to 3 attempts)
- ✅ 30-second timeout protection
- ✅ Input validation (client + server)
- ✅ Optimized text rendering
- ✅ Proper error boundaries
- ✅ Security headers in `vercel.json`

---

## Security Features

- ✅ Input sanitization (XSS prevention)
- ✅ Zod schema validation
- ✅ Rate limit handling
- ✅ Secure CORS configuration
- ✅ Environment variable validation
- ✅ No sensitive data in console logs

---

## Monitoring & Debugging

### View Logs:

**Vercel Logs:**
```bash
vercel logs [deployment-url]
```

**Supabase Edge Function Logs:**
- Go to Supabase Dashboard → Edge Functions → analyze-report → Logs

### Common Log Messages:

```
✅ "AI response generated successfully" - Working correctly
❌ "AI gateway error: 429" - Rate limited
❌ "Validation error: Invalid details length" - Input validation failed
❌ "LOVABLE_API_KEY not configured" - Missing API key secret
```

---

## Support

If you encounter issues after following this guide:

1. Check browser console for errors
2. View Vercel deployment logs
3. Check Supabase edge function logs
4. Verify all environment variables are set correctly
5. Ensure edge function is deployed and accessible

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Lovable Cloud Documentation](https://docs.lovable.dev/features/cloud)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
