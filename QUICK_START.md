# Quick Start Guide - Google Cloud Deployment

This is a condensed version of the setup process. For detailed instructions, see [SETUP_GOOGLE_CLOUD.md](./SETUP_GOOGLE_CLOUD.md).

## Prerequisites Checklist

- [ ] Google Cloud account
- [ ] New blank Google Cloud project created
- [ ] GitHub repository access (admin)

## Setup Steps (30 minutes)

### 1. Enable APIs (5 min)

```bash
gcloud config set project YOUR_PROJECT_ID

gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Create Service Account (5 min)

```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
    --display-name="GitHub Actions Deployer" \
    --project="YOUR_PROJECT_ID"

# Grant permissions
export PROJECT_ID="YOUR_PROJECT_ID"
export SA_EMAIL="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" --member="serviceAccount:${SA_EMAIL}" --role="roles/run.admin"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" --member="serviceAccount:${SA_EMAIL}" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" --member="serviceAccount:${SA_EMAIL}" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" --member="serviceAccount:${SA_EMAIL}" --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create ~/gcp-sa-key.json --iam-account="${SA_EMAIL}"
```

### 3. Create Google OAuth Credentials (10 min)

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - (Production URL will be added after first deployment)
4. Save Client ID and Secret

### 4. Configure GitHub Secrets (10 min)

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `GCP_SA_KEY` | Full JSON from step 2 | `cat ~/gcp-sa-key.json` |
| `GOOGLE_CLIENT_ID` | From step 3 | OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | From step 3 | OAuth credentials |
| `NEXTAUTH_SECRET` | Random string | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Use placeholder first | `https://example.com` (update after deployment) |
| `TELEGRAM_BOT_TOKEN` | From @BotFather | Optional |
| `TELEGRAM_CHAT_ID` | From bot getUpdates | Optional |
| `WEBHOOK_BEARER_TOKEN` | Random string | `openssl rand -base64 32` |
| `JUST_SECRET` | Random string | `openssl rand -base64 32` |

### 5. Deploy!

```bash
git push origin main
```

Monitor deployment in GitHub Actions tab.

### 6. Post-Deployment (5 min)

After first successful deployment:

1. Get Cloud Run URL from deployment logs
2. Update OAuth redirect URIs in Google Cloud Console:
   - Add: `https://your-service-url.run.app`
   - Add: `https://your-service-url.run.app/api/auth/callback/google`
3. Update `NEXTAUTH_URL` secret in GitHub with actual URL

## Verify Deployment

✅ Visit your Cloud Run URL  
✅ Test Google OAuth login  
✅ Check application functionality  

## Common Issues

**Deployment fails?**
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure service account has all permissions

**OAuth fails?**
- Verify redirect URIs match your Cloud Run URL
- Check `NEXTAUTH_URL` is set correctly

## Resources

- 📖 [Full Setup Guide](./SETUP_GOOGLE_CLOUD.md)
- 🔧 [deploy.yml](./.github/workflows/deploy.yml)
- 📊 [Cloud Run Console](https://console.cloud.google.com/run)
- 🐛 [GitHub Actions Logs](../../actions)

## Need Help?

Check the detailed [SETUP_GOOGLE_CLOUD.md](./SETUP_GOOGLE_CLOUD.md) guide for troubleshooting and additional information.
