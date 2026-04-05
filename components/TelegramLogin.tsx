"use client";

import { useEffect } from "react";

interface TelegramLoginProps {
  botUsername: string;
  onAuth: (user: TelegramUser) => void;
  buttonSize?: "large" | "medium" | "small";
  cornerRadius?: number;
  requestAccess?: boolean;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Telegram Login Widget
 * Loads the official Telegram login widget and handles authentication
 *
 * Note: This is for Phase 2 implementation. Currently using mock auth.
 */
export default function TelegramLogin({
  botUsername,
  onAuth,
  buttonSize = "large",
  cornerRadius = 10,
  requestAccess = true,
}: TelegramLoginProps) {
  useEffect(() => {
    // Define callback function for Telegram widget
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      console.log("Telegram auth successful:", user);
      onAuth(user);
    };

    // Load Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", buttonSize);
    script.setAttribute("data-radius", cornerRadius.toString());
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", requestAccess ? "write" : "");
    script.async = true;

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.innerHTML = ""; // Clear previous widget
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, buttonSize, cornerRadius, requestAccess, onAuth]);

  return (
    <div className="flex flex-col items-center">
      <div id="telegram-login-container" className="telegram-login-widget" />
      <p className="text-foreground-muted text-xs mt-3 text-center">
        We use Telegram to verify your identity
      </p>
    </div>
  );
}
