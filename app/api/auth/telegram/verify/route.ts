import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verify Telegram Login Widget data
 * Based on: https://core.telegram.org/widgets/login#checking-authorization
 */
export async function POST(request: NextRequest) {
  try {
    const data: TelegramAuthData = await request.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { valid: false, error: "Bot token not configured" },
        { status: 500 }
      );
    }

    // Check auth_date (data should not be older than 24 hours)
    const authDate = data.auth_date;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;

    if (timeDiff > 86400) {
      // 24 hours in seconds
      return NextResponse.json(
        { valid: false, error: "Authentication data is too old" },
        { status: 400 }
      );
    }

    // Create data check string
    const checkData: Record<string, string | number> = {
      auth_date: data.auth_date,
      first_name: data.first_name,
      id: data.id,
    };

    if (data.last_name) checkData.last_name = data.last_name;
    if (data.photo_url) checkData.photo_url = data.photo_url;
    if (data.username) checkData.username = data.username;

    // Sort keys and create data-check-string
    const dataCheckString = Object.keys(checkData)
      .sort()
      .map((key) => `${key}=${checkData[key]}`)
      .join("\n");

    // Create secret key (SHA256 hash of bot token)
    const secretKey = crypto
      .createHash("sha256")
      .update(botToken)
      .digest();

    // Create hash
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Compare hashes
    const isValid = hash === data.hash;

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: "Hash verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Telegram verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
