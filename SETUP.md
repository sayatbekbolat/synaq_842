# 🚀 Quick Setup Guide for Synaq

This guide will get you up and running with Synaq in less than 10 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Basic knowledge of React/Next.js

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16
- Supabase JS client
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `synaq` (or whatever you prefer)
5. Generate a strong database password (save it!)
6. Choose your region (closest to Almaty for best performance)
7. Click "Create new project"

#### Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Cmd/Ctrl + Enter`

You should see: **Success. No rows returned**

This creates:
- ✅ `users` table
- ✅ `attempts` table
- ✅ Leaderboard functions
- ✅ Live count function
- ✅ Security policies

### 3. Configure Environment Variables

#### Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon/public** key (long string starting with `eyJ...`)

#### Create .env.local File

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Telegram Bot (for future auth)
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot

# Geofencing coordinates (Health Stairs, Almaty)
NEXT_PUBLIC_START_LAT=43.2566
NEXT_PUBLIC_START_LNG=76.9286
NEXT_PUBLIC_FINISH_LAT=43.2580
NEXT_PUBLIC_FINISH_LNG=76.9290
NEXT_PUBLIC_GEOFENCE_RADIUS=50
```

> **Note**: If you're not in Almaty, you can use your own coordinates. Use Google Maps to find the lat/lng of your start and finish points.

### 4. Start the Development Server

```bash
npm run dev
```

You should see:

```
✓ Ready in 523ms
- Local:   http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the Landing Page

You should see:
- ✅ "SYNAQ" logo with mountain icon
- ✅ Live climber count (top right)
- ✅ Podium with top 3 (mock data)
- ✅ Massive green "START SYNAQ" button
- ✅ Quick stats (Today/Week/All-time)
- ✅ Dark theme with lime accents

## 🎨 Customizing the Theme

### Change the Accent Color

Edit `app/globals.css`:

```css
:root {
  --lime: #c6ff00;        /* Change this to your preferred color */
  --lime-glow: #d4ff33;   /* Lighter version for glows */
  --lime-dark: #9acc00;   /* Darker version for hover states */
}
```

### Adjust Fonts

Edit `app/layout.tsx` to use different Google Fonts:

```tsx
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

## 🧪 Testing Geofencing (Optional)

To test geofencing without being at the actual stairs:

1. Use Chrome DevTools → Device Mode
2. Click the 3 dots → **Sensors**
3. Set custom location:
   - Latitude: `43.2566`
   - Longitude: `76.9286`

Or temporarily disable geofencing for testing:

```tsx
// In lib/geofence.ts
export async function verifyStartLocation() {
  return {
    isValid: true,  // Always return true for testing
    distance: 0,
    location: { latitude: 43.2566, longitude: 76.9286 }
  };
}
```

## 📊 Viewing Data in Supabase

1. Go to **Table Editor** in Supabase
2. Select `users` or `attempts` table
3. View, add, or edit data directly

## 🐛 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection errors

- Check your `.env.local` file has the correct URL and key
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env.local`

### Animations not working

- Make sure Framer Motion is installed: `npm list framer-motion`
- Clear Next.js cache: `rm -rf .next`

### Tailwind classes not working

- Make sure `tailwind.config.ts` exists
- Restart dev server
- Check browser console for CSS errors

## 🚀 Next Steps

Now that you have Phase 1 running:

1. **Add Real Data**: Insert test data into Supabase
2. **Build Phase 2**: Implement QR code scanner
3. **Add Authentication**: Set up Telegram Login
4. **Deploy**: Push to Vercel for production

## 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 💬 Need Help?

If you run into issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify your `.env.local` configuration
4. Make sure all dependencies are installed

---

**Happy building! 🏔️**
