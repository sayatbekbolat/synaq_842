# 🤖 Telegram Bot Setup Guide

## Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`

2. **Send** `/newbot`

3. **Choose a name** for your bot:
   ```
   Synaq Health Stairs Bot
   ```

4. **Choose a username** (must end with 'bot'):
   ```
   synaq_health_bot
   ```
   Or any available name like:
   - `synaq_stairs_bot`
   - `healthstairs_almaty_bot`
   - `synaq_climb_bot`

5. **Copy the token** - BotFather will give you something like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
   ⚠️ **Keep this secret!**

6. **Set the bot domain** (for login widget):
   ```
   /setdomain
   Select your bot
   Enter: localhost
   ```

   For production, add your domain too:
   ```
   /setdomain
   Select your bot
   Enter: your-domain.com
   ```

## Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=synaq_health_bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

Replace with your actual bot username and token.

## Step 3: Test the Bot

1. Open Telegram and search for your bot: `@synaq_health_bot`
2. Click **Start**
3. You should get a welcome message (we'll add this later)

## Step 4: Verify Login Widget

The Telegram Login Widget uses a special authentication flow:

1. **User clicks "Login with Telegram"**
2. **Telegram opens** and asks user to confirm
3. **Callback returns** user data (id, username, first_name, photo, etc.)
4. **Your app verifies** the data using the bot token (for security)

## Security Notes

- ✅ Always verify the hash (we do this server-side)
- ✅ Never expose your bot token (use `.env.local`, not committed to git)
- ✅ Check auth_date to prevent replay attacks (data expires after 1 day)

## Optional: Add Bot Commands

Send to @BotFather:

```
/setcommands
Select your bot
Send:

start - Start the bot
help - Get help
stats - View your climbing stats
leaderboard - See today's top climbers
```

## Optional: Set Bot Picture

1. Create a bot profile picture (512x512 px)
2. Send to @BotFather:
   ```
   /setuserpic
   Select your bot
   Upload image
   ```

## Optional: Set Description

```
/setdescription
Select your bot
Enter:

Track your Health Stairs climbs in Almaty! 🏔️
Compete on the leaderboard and track your progress.
Start climbing at https://your-app-url.com
```

## Troubleshooting

### "Bot domain not set"
- Run `/setdomain` in BotFather
- Add `localhost` for development
- Add your production domain

### "Authorization failed"
- Check bot token in `.env.local`
- Make sure username matches exactly
- Verify hash calculation is correct

### "This bot cannot be used for login"
- Make sure you set the domain with `/setdomain`
- Try restarting the dev server

## Next Steps

After setup, the app will:
1. Show "Login with Telegram" button
2. Authenticate users via Telegram
3. Store their Telegram ID, username, and name
4. Use real user IDs for attempts
5. Display usernames on leaderboard

---

**Ready?** Once you create the bot, add the credentials to `.env.local` and we'll integrate it! 🚀
