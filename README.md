# AI-Powered Meeting Notes Summarizer

A full-stack web application that transforms meeting transcripts into structured summaries using AI and allows sharing via email.

## Features

- **Upload Transcripts**: Paste meeting notes or call transcripts
- **Custom Instructions**: Provide specific prompts for AI summarization
- **AI Summary Generation**: Uses Groq API for intelligent summarization
- **Editable Summaries**: Modify AI-generated summaries before sharing
- **Email Sharing**: Send summaries to multiple recipients
- **MongoDB Storage**: Persistent storage of all summaries and metadata

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **AI**: Groq API (Llama 3 model)
- **Email**: Nodemailer with SMTP
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Groq API key
- SMTP email service (Gmail, Outlook, etc.)

## Installation & Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/meeting-summarizer
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meeting-summarizer

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=your_email@gmail.com
```

### 3. API Key Setup

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Create an account or sign in
3. Generate an API key
4. Add it to your `.env.local` file

#### Email Configuration (Gmail Example)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your email and the app password in `.env.local`

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/your/data/directory
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and add to `.env.local`

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Usage

1. **Enter Transcript**: Paste your meeting notes in the transcript area
2. **Add Instructions**: Specify how you want the summary formatted (e.g., "Bullet points for executives", "Action items only")
3. **Generate Summary**: Click "Generate Summary" to create AI-powered summary
4. **Edit Summary**: Modify the generated summary as needed
5. **Share via Email**: Enter recipient emails (comma-separated) and click "Share via Email"

## Project Structure

```
meeting-summarizer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-summary/route.ts    # AI summary generation endpoint
│   │   │   └── share-summary/route.ts       # Email sharing endpoint
│   │   ├── globals.css                      # Global styles
│   │   ├── layout.tsx                       # Root layout
│   │   └── page.tsx                         # Main application page
│   ├── lib/
│   │   ├── mongodb.ts                       # MongoDB connection
│   │   ├── groq.ts                          # Groq API integration
│   │   └── email.ts                         # Email service
│   ├── models/
│   │   └── Summary.ts                       # MongoDB schema
│   └── types/
│       └── global.d.ts                      # TypeScript globals
├── .env.example                             # Environment variables template
├── .env.local                               # Your environment variables (gitignored)
├── package.json                             # Dependencies and scripts
└── README.md                                # This file
```

## API Endpoints

### POST /api/generate-summary
Generates AI summary from transcript and prompt.

**Request Body:**
```json
{
  "transcript": "Meeting transcript text...",
  "customPrompt": "Summarize in bullet points"
}
```

**Response:**
```json
{
  "summary": "Generated summary text...",
  "summaryId": "mongodb_document_id"
}
```

### POST /api/share-summary
Shares summary via email.

**Request Body:**
```json
{
  "summaryId": "mongodb_document_id",
  "emails": ["email1@example.com", "email2@example.com"],
  "summary": "Final edited summary text..."
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/meeting-summarizer` |
| `GROQ_API_KEY` | Groq API key for AI processing | `gsk_...` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS/SSL | `false` |
| `SMTP_USER` | Email username | `your_email@gmail.com` |
| `SMTP_PASS` | Email password/app password | `your_app_password` |
| `SMTP_FROM` | From email address | `your_email@gmail.com` |

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
# Build image
docker build -t meeting-summarizer .

# Run container
docker run -p 3000:3000 --env-file .env.local meeting-summarizer
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MONGODB_URI is correct
   - Ensure MongoDB service is running
   - Check network connectivity for Atlas

2. **Groq API Error**
   - Verify GROQ_API_KEY is valid
   - Check API quota/limits
   - Ensure internet connectivity

3. **Email Sending Error**
   - Verify SMTP credentials
   - Check if app passwords are required
   - Verify SMTP settings for your provider

4. **Build Errors**
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors with `npm run type-check`
   - Verify all environment variables are set

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Features
1. Database changes: Update `src/models/Summary.ts`
2. API endpoints: Add to `src/app/api/`
3. Frontend: Modify `src/app/page.tsx`
4. Utilities: Add to `src/lib/`

## Security Notes

- Environment variables contain sensitive data - never commit `.env.local`
- Use app passwords for email authentication
- Validate and sanitize all user inputs
- Consider rate limiting for production use

## License

MIT License - feel free to use for any purpose.

---

**Need Help?** Check the troubleshooting section or review the example configuration files.
