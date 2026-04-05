# 🏔️ Synaq - Health Stairs Challenge

> **Synaq** (Kazakh: "Test/Trial") - A high-performance web app for the Health Stairs challenge in Almaty, Kazakhstan.

![Cyber-Almaty Aesthetic](https://img.shields.io/badge/vibe-Cyber--Almaty-c6ff00?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green?style=for-the-badge&logo=supabase)

## ⚡ Features

### Phase 1 (Current) - Landing Page & Dashboard
- **Mobile-First Design**: Optimized for one-handed use on steep trails
- **Live Climber Count**: Real-time indicator of active climbers
- **Podium Display**: Today's top 3 leaders with smooth animations
- **Cyber-Almaty Theme**: Dark mode by default with electric lime accents
- **Quick Stats**: Today, Weekly, and All-Time climb counts

### Upcoming Features
- QR Code Scanning (Start/Finish points)
- Timer with localStorage persistence (survives browser refresh)
- Geofencing validation (prevent cheating)
- Telegram Login integration
- Instagram handle collection
- Full Leaderboard with tabs (Today/Weekly/All-time)
- Real-time updates via Supabase subscriptions

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4.0
- **Database & Auth**: Supabase
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your-bot-username

# Geofencing (Health Stairs Coordinates)
NEXT_PUBLIC_START_LAT=43.2566
NEXT_PUBLIC_START_LNG=76.9286
NEXT_PUBLIC_FINISH_LAT=43.2580
NEXT_PUBLIC_FINISH_LNG=76.9290
NEXT_PUBLIC_GEOFENCE_RADIUS=50
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Copy your project URL and anon key to `.env.local`

```bash
# In Supabase SQL Editor, run the contents of:
supabase-schema.sql
```

This creates:
- `users` table
- `attempts` table
- Leaderboard functions (today, weekly, all-time)
- Live climbers count function
- Row-level security policies

## 🎨 Design System

### Colors (Cyber-Almaty Theme)

- **Background**: `#0a0a0a` - Deep charcoal
- **Surface**: `#1a1a1a` - Elevated charcoal
- **Lime**: `#c6ff00` - Electric lime (primary accent)
- **Lime Glow**: `#d4ff33` - Brighter lime for effects
- **Foreground**: `#ededed` - Off-white text
- **Muted**: `#9ca3af` - Gray text

### Typography

- **Sans**: Geist Sans (clean, modern)
- **Mono**: Geist Mono (for times and stats)

### Key Components

#### Podium
```tsx
<Podium leaders={[
  { rank: 1, name: "Askar K.", time: 180, instagram: "askar_climb" },
  { rank: 2, name: "Aigerim S.", time: 195 },
  { rank: 3, name: "Daniyar M.", time: 210 }
]} />
```

#### LiveCount
```tsx
<LiveCount count={3} />
```

## 🏗️ Project Structure

```
synaq/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Landing page (with login/user menu)
│   ├── globals.css         # Cyber-Almaty theme
│   ├── auth/               # Telegram login page
│   ├── start/              # Start QR scan flow
│   ├── climbing/           # Active climb timer
│   ├── finish/             # Finish QR + Instagram input
│   ├── success/            # Success celebration page
│   └── api/
│       └── auth/telegram/  # Telegram verification API
├── components/
│   ├── Podium.tsx          # Top 3 leaders display
│   ├── LiveCount.tsx       # Live climber indicator
│   ├── QRScanner.tsx       # QR code scanner (html5-qrcode)
│   └── TelegramLogin.tsx   # Telegram auth widget
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   ├── geofence.ts         # Location validation
│   ├── geofence-dev.ts     # Dev mode (skip location)
│   └── timer.ts            # Timer with persistence
├── supabase-schema.sql     # Database schema
├── QR_CODES.md             # QR code generation guide
├── TELEGRAM_SETUP.md       # Create Telegram bot guide
├── TELEGRAM_INTEGRATION.md # Integration details
└── tailwind.config.ts      # Tailwind theme config
```

## 🔐 Anti-Cheating Measures

1. **Geofencing**: Must be within 50m of start/finish coordinates
2. **Timer Validation**: Server-side timestamp verification
3. **Location Logging**: Start and finish GPS coordinates stored
4. **Rate Limiting**: Prevent spam attempts

## 📱 Mobile Optimization

- **One-Handed Use**: Primary CTA positioned for thumb reach
- **Responsive Design**: Mobile-first with progressive enhancement
- **Touch Optimization**: Large tap targets (min 44x44px)
- **Performance**: Lazy loading, code splitting, optimized images

## 🚧 Development Roadmap

### Phase 1 ✅
- [x] Landing page with Cyber-Almaty theme
- [x] Podium component
- [x] Live count indicator
- [x] Supabase schema
- [x] Geofencing utilities
- [x] Timer persistence logic

### Phase 2 ✅
- [x] QR code scanner integration (html5-qrcode)
- [x] Start/Finish flow with timer
- [x] Instagram handle input
- [x] Real attempt submission to Supabase
- [x] Success screen with sharing
- [x] Dev mode shortcuts for testing

### Phase 3 ✅ (Current)
- [x] Telegram Login component
- [x] Full Telegram authentication flow
- [x] Server-side hash verification
- [x] User profile creation with Telegram
- [x] Login/Logout UI
- [x] Real user IDs (no more mocks)

### Phase 4 (Next)
- [ ] Real leaderboard (fetch from Supabase)
- [ ] Real-time updates (Supabase subscriptions)
- [ ] User profile pages
- [ ] Achievement badges
- [ ] Admin dashboard

### Phase 5
- [ ] PWA support (installable app)
- [ ] Offline mode
- [ ] Push notifications
- [ ] Social sharing cards
- [ ] Analytics dashboard

## 📄 License

MIT License - feel free to use this for your own stair climbing challenges!

## 🏔️ About Health Stairs, Almaty

The Health Stairs is a popular outdoor fitness spot in Almaty, Kazakhstan, featuring hundreds of steps up the mountainside with breathtaking views of the city.

---

**Built with 💚 for the climbing community**
