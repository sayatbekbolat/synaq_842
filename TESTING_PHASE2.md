# Testing Phase 2 - Complete Flow Guide

## Prerequisites

1. **Supabase Setup** (see SETUP.md)
2. **Environment Variables** configured in `.env.local`
3. **QR Codes** generated (see QR_CODES.md)

## Testing Flow

### 1. Landing Page (`/`)

**URL**: http://localhost:3000

**Test**:
- ✅ See live climber count (top right)
- ✅ See podium with top 3 (mock data)
- ✅ See "START SYNAQ" button
- ✅ Click button → navigates to `/start`

---

### 2. Start Screen (`/start`)

**URL**: http://localhost:3000/start

**Test**:
- ✅ See "Ready to climb?" screen
- ✅ Click "Scan QR Code" → opens camera scanner
- ✅ Scan QR with value `SYNAQ_START`
- ✅ Location verification runs (must be within 50m of start point)
- ✅ On success → navigates to `/climbing`

**Mock Testing** (without QR code):
```javascript
// In browser console
localStorage.setItem('synaq_active_attempt', JSON.stringify({
  attemptId: 'test-' + Date.now(),
  userId: 'test-user',
  startTime: Date.now(),
  status: 'started'
}));
// Then navigate to /climbing
```

---

### 3. Climbing Screen (`/climbing`)

**URL**: http://localhost:3000/climbing

**Test**:
- ✅ See real-time timer counting up (MM:SS format)
- ✅ See motivational messages (change based on elapsed time)
- ✅ Timer persists across page refresh (localStorage)
- ✅ Click "Scan Finish QR" → navigates to `/finish`

**Expected Behavior**:
- Timer updates every second
- Different messages at:
  - < 2 min: "Great start!"
  - < 4 min: "You're doing amazing!"
  - < 6 min: "Almost there!"
  - \> 6 min: "Incredible endurance!"

---

### 4. Finish Screen (`/finish`)

**URL**: http://localhost:3000/finish

**Step 1: Scan QR**
- ✅ See "Almost there!" screen
- ✅ Click "Scan Finish QR" → opens camera
- ✅ Scan QR with value `SYNAQ_FINISH`
- ✅ Location verification (must be within 50m of finish)
- ✅ On success → shows Step 2 (details form)

**Step 2: Enter Details**
- ✅ See final time displayed (MM:SS)
- ✅ Enter your name (required)
- ✅ Enter Instagram handle (optional, without @)
- ✅ Click "Submit Time"
- ✅ Attempt saved to Supabase
- ✅ Navigate to `/success`

---

### 5. Success Screen (`/success`)

**URL**: http://localhost:3000/success?time=180&name=Test%20User

**Test**:
- ✅ See confetti animation
- ✅ See trophy icon with glow
- ✅ See final time (MM:SS format)
- ✅ See stats card
- ✅ Click "Share Your Achievement" → opens share dialog
- ✅ Click "Back to Home" → navigates to `/`

---

## Testing Without Physical Location

### Option 1: Temporarily Disable Geofencing

Edit `lib/geofence.ts`:

```typescript
export async function verifyStartLocation() {
  return {
    isValid: true,
    distance: 0,
    location: { latitude: 43.2566, longitude: 76.9286 }
  };
}

export async function verifyFinishLocation() {
  return {
    isValid: true,
    distance: 0,
    location: { latitude: 43.2580, longitude: 76.9290 }
  };
}
```

### Option 2: Mock GPS Location in Browser

**Chrome DevTools**:
1. Open DevTools → Click 3 dots → More tools → Sensors
2. Set location to custom:
   - Latitude: `43.2566`
   - Longitude: `76.9286`

---

## Testing Supabase Integration

### Check Data in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Select `attempts` table
3. After completing a climb, verify:
   - ✅ New row created
   - ✅ `user_id` matches temp user
   - ✅ `start_time` populated
   - ✅ `end_time` populated
   - ✅ `duration` in seconds
   - ✅ `status` = "completed"

4. Select `users` table
5. Verify:
   - ✅ User created with display name
   - ✅ Instagram handle stored (if provided)

---

## Testing Edge Cases

### 1. No Active Attempt

- Navigate directly to `/climbing` (without scanning start QR)
- **Expected**: Redirect to `/`

### 2. Expired Attempt

```javascript
// Set attempt to > 2 hours ago
localStorage.setItem('synaq_active_attempt', JSON.stringify({
  attemptId: 'test-123',
  userId: 'test-user',
  startTime: Date.now() - (3 * 60 * 60 * 1000), // 3 hours ago
  status: 'started'
}));
```
- Navigate to `/climbing`
- **Expected**: Redirect to `/` (attempt cleared)

### 3. Browser Refresh During Climb

1. Start a climb
2. Refresh page at `/climbing`
3. **Expected**: Timer continues from correct time

### 4. Invalid QR Code

- Scan QR with value "INVALID"
- **Expected**: Error message shown

### 5. Wrong Location

- Mock location far from start/finish
- Try to scan QR
- **Expected**: "Too far from start/finish" error

---

## Performance Testing

### Timer Accuracy

1. Start climb
2. Use stopwatch to compare
3. After 5 minutes, verify times match

### localStorage Persistence

1. Start climb
2. Close tab
3. Reopen `/climbing`
4. **Expected**: Timer continues accurately

---

## Mobile Testing

Test on actual mobile device or Chrome DevTools Device Mode:

1. **Touch Targets**: All buttons > 44x44px
2. **Camera Access**: QR scanner works on mobile
3. **One-Handed Use**: CTA buttons in thumb reach
4. **Orientation**: Works in portrait
5. **Keyboard**: Input fields work properly

---

## Known Limitations (Phase 2)

- ⚠️ Using mock user IDs (Telegram auth in Phase 3)
- ⚠️ QR codes use simple string validation (can be enhanced with encryption)
- ⚠️ No real-time leaderboard updates yet
- ⚠️ Podium shows mock data (will connect to Supabase functions)

---

## Next Steps (Phase 3)

- [ ] Implement full Telegram authentication
- [ ] Real-time leaderboard with Supabase subscriptions
- [ ] User profile pages
- [ ] Admin dashboard
- [ ] Advanced anti-cheating measures
