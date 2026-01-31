# Google Cloud Setup Guide for tg-bot Deployment

This guide will help you set up a new Google Cloud project to deploy the tg-bot application using GitHub Actions.

## Prerequisites

- A Google Cloud account
- A new blank Google Cloud project (you've already created this)
- GitHub repository with admin access
- A Telegram bot token (if using Telegram integration)

## Step 1: Google Cloud Project Setup

### 1.1 Note Your Project ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your new project
3. Note down your **Project ID** (not the project name) - you'll need this later
4. The deploy.yml is configured to work with region `europe-central2` by default

### 1.2 Enable Required APIs

Enable the following APIs in your Google Cloud project:

```bash
# Using gcloud CLI (recommended)
gcloud config set project YOUR_PROJECT_ID

gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

Or manually through the console:
- [Artifact Registry API](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com)
- [Cloud Run API](https://console.cloud.google.com/apis/library/run.googleapis.com)
- [Cloud Build API](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)

## Step 2: Create Service Account

### 2.1 Create the Service Account

```bash
# Set your project ID
export PROJECT_ID="YOUR_PROJECT_ID"

# Create service account
gcloud iam service-accounts create github-actions-deployer \
    --display-name="GitHub Actions Deployer" \
    --description="Service account for GitHub Actions to deploy to Cloud Run" \
    --project="${PROJECT_ID}"
```

### 2.2 Grant Required Permissions

```bash
# Get the service account email
export SA_EMAIL="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant Cloud Run Admin role (for deploying services)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

# Grant Artifact Registry Writer role (for pushing Docker images)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.writer"

# Grant Storage Admin role (required by Cloud Run)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

# Grant Service Account User role (required to deploy as service account)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"
```

### 2.3 Create and Download Service Account Key

```bash
# Create and download the key
gcloud iam service-accounts keys create ~/gcp-sa-key.json \
    --iam-account="${SA_EMAIL}" \
    --project="${PROJECT_ID}"

# View the key (you'll need to copy this entire JSON content)
cat ~/gcp-sa-key.json
```

**Important:** Keep this key secure and never commit it to your repository!

## Step 3: Configure Google OAuth (for NextAuth)

### 3.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console - APIs & Services - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: External (or Internal if using Google Workspace)
   - Fill in required information (app name, support email)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `tg-bot`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - Your production URL will be added after first deployment
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local development)
     - Your production callback URL will be added after first deployment (e.g., `https://your-service-url.run.app/api/auth/callback/google`)
5. Click **Create** and save the:
   - **Client ID**
   - **Client Secret**

**Note:** After your first deployment, you'll get a Cloud Run URL. Add these additional authorized URIs:
- `https://YOUR-SERVICE-URL.run.app` (JavaScript origin)
- `https://YOUR-SERVICE-URL.run.app/api/auth/callback/google` (Redirect URI)

## Step 4: Configure Telegram Bot (Optional)

If you're using Telegram integration:

1. Create a bot with [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command and follow the instructions
3. Save the **bot token** provided
4. To get your Chat ID:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find the `chat.id` field in the response

## Step 5: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### Required Secrets:

1. **GCP_SA_KEY**
   - The entire JSON content from the service account key file (from Step 2.3)
   - Copy the entire JSON including the curly braces

2. **GOOGLE_CLIENT_ID**
   - From Step 3 (OAuth credentials)

3. **GOOGLE_CLIENT_SECRET**
   - From Step 3 (OAuth credentials)

4. **NEXTAUTH_SECRET**
   - Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```

5. **NEXTAUTH_URL**
   - For first deployment, use a placeholder: `https://example.com`
   - After first deployment, update with your actual Cloud Run URL

6. **TELEGRAM_BOT_TOKEN** (Optional)
   - From Step 4 (Telegram bot token)

7. **TELEGRAM_CHAT_ID** (Optional)
   - From Step 4 (Your Telegram chat ID)

8. **WEBHOOK_BEARER_TOKEN** (Optional)
   - Generate a secure random token:
   ```bash
   openssl rand -base64 32
   ```

9. **JUST_SECRET** (Optional)
   - Any additional secret your app might need
   - Generate with:
   ```bash
   openssl rand -base64 32
   ```

## Step 6: Update Configuration (Optional)

If you want to change the region or app name:

Edit `.github/workflows/deploy.yml`:
```yaml
env:
  APP_NAME: tg-bot  # Change this to your desired app name
  REGION: europe-central2  # Change to your preferred region
```

Available regions for Cloud Run: https://cloud.google.com/run/docs/locations

## Step 7: Deploy

### First Deployment

1. Make sure all GitHub secrets are configured
2. Push to the `main` branch:
   ```bash
   git push origin main
   ```
3. Go to GitHub → **Actions** tab to monitor the deployment
4. The workflow will:
   - Install dependencies
   - Run tests (if present)
   - Create Artifact Registry repository (automatically)
   - Build and push Docker image
   - Deploy to Cloud Run
5. Once complete, you'll see the service URL in the deployment logs

### Update OAuth Redirect URIs

After first successful deployment:

1. Note the Cloud Run URL from the deployment logs (e.g., `https://tg-bot-xxx.europe-central2.run.app`)
2. Go back to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
3. Edit your OAuth 2.0 Client ID
4. Add the production URLs:
   - Authorized JavaScript origins: `https://your-actual-url.run.app`
   - Authorized redirect URIs: `https://your-actual-url.run.app/api/auth/callback/google`
5. Update the `NEXTAUTH_URL` secret in GitHub to use the actual Cloud Run URL

### Subsequent Deployments

Every push to the `main` branch will automatically trigger a deployment.

## Step 8: Verify Deployment

1. Visit your Cloud Run service URL
2. Test authentication with Google OAuth
3. Check the application functionality

### Monitor Your Deployment

- **Cloud Run Console**: https://console.cloud.google.com/run?project=YOUR_PROJECT_ID
- **Artifact Registry**: https://console.cloud.google.com/artifacts?project=YOUR_PROJECT_ID
- **View Logs**: Click on your service in Cloud Run → Logs tab

## Troubleshooting

### Deployment fails with authentication error
- Verify the `GCP_SA_KEY` secret is correctly formatted (entire JSON)
- Ensure service account has all required permissions

### OAuth authentication fails
- Check that redirect URIs are correctly configured in Google Console
- Verify `NEXTAUTH_URL` matches your actual Cloud Run URL
- Ensure `NEXTAUTH_SECRET` is set

### Docker build fails
- Check if all required secrets are set in GitHub
- Review build logs in GitHub Actions

### Service won't start
- Check Cloud Run logs in Google Cloud Console
- Verify all environment variables are correctly set
- Ensure the application port matches (3000)

## Cost Considerations

Cloud Run pricing:
- First 2 million requests per month are free
- CPU: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GiB-second
- With the current configuration (1 CPU, 512MB), typical costs are minimal for low-traffic applications

Set up budget alerts:
1. Go to [Billing](https://console.cloud.google.com/billing)
2. Select your billing account
3. Click **Budgets & alerts**
4. Create a budget to monitor spending

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Rotate service account keys** periodically
3. **Use the principle of least privilege** for service account permissions
4. **Enable audit logging** in Google Cloud
5. **Review OAuth scopes** regularly
6. **Set up alerts** for unusual activity
7. **Keep dependencies updated** to avoid security vulnerabilities

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions for Google Cloud](https://github.com/google-github-actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## Summary Checklist

- [ ] Created Google Cloud project and noted Project ID
- [ ] Enabled required APIs (Artifact Registry, Cloud Run, Cloud Build)
- [ ] Created service account with proper permissions
- [ ] Downloaded service account key JSON
- [ ] Created Google OAuth credentials
- [ ] Configured Telegram bot (if needed)
- [ ] Added all required secrets to GitHub
- [ ] Reviewed and updated deploy.yml configuration (if needed)
- [ ] Pushed to main branch and monitored deployment
- [ ] Updated OAuth redirect URIs with actual Cloud Run URL
- [ ] Verified application is working correctly

---

**Need Help?**

If you encounter issues not covered in this guide, check:
- GitHub Actions logs in your repository
- Cloud Run logs in Google Cloud Console
- Open an issue in the repository
