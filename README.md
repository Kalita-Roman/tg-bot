# mindful-chat

A Next.js application with Google Authentication and Telegram Bot integration.

## 🚀 Features

- Google OAuth authentication
- Send messages to Telegram bot (authenticated users only)
- Real-time date/time API endpoint

## 🛠️ Local Development Setup

### Prerequisites
- Node.js installed
- Google OAuth credentials (for authentication)
- Telegram bot token (for sending messages)

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ```

### Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Important Notes

⚠️ **The Telegram message form is only visible after signing in with Google.** 

When you first load the application, you'll see:
- "Sign in with Google" button

After signing in, you'll see:
- "Get Current Date & Time" button
- **Telegram message form** (with Chat ID and Message fields)

If you don't see the form, make sure you're signed in!

## 🌐 Hosting

📂 Google Cloud:  

Cloud Run Service:  
https://console.cloud.google.com/run/detail/europe-central2/tg-bot/observability/metrics?project=multi-tool-box

Artifact Registry:  
https://console.cloud.google.com/artifacts/docker/multi-tool-box/europe-central2/multi-tool-box/tg-bot?project=multi-tool-box

🚀 Deployed:  
https://tg-bot-1001023352343.europe-central2.run.app