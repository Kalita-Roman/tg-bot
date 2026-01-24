# mindful-chat

## 🚀 Features

- **Google OAuth Authentication**: Secure sign-in using Google accounts
- **Protected API Endpoint**: `/api/datetime` - Returns current date and time (requires authentication)
- **Interactive UI**: Button to fetch and display API responses

## 🛠️ Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file with the following variables:
```env
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

To generate a NextAuth secret:
```bash
openssl rand -base64 32
```

3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Navigate to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### GET /api/datetime
Returns the current date and time.

**Authentication**: Required (Google OAuth)

**Response**:
```json
{
  "message": "Current date and time: Friday, January 24, 2026, 10:24:01 PM UTC"
}
```

**Error Response** (401):
```json
{
  "error": "Unauthorized. Please sign in with Google."
}
```

## 🌐 Hosting

📂 Google Cloud:  

Cloud Run Service:  
https://console.cloud.google.com/run/detail/europe-central2/tg-bot/observability/metrics?project=multi-tool-box

Artifact Registry:  
https://console.cloud.google.com/artifacts/docker/multi-tool-box/europe-central2/multi-tool-box/tg-bot?project=multi-tool-box

🚀 Deployed:  
https://tg-bot-1001023352343.europe-central2.run.app