import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ToltEmbedTheme = "light" | "dark" | "system";

export type ToltEmbedProps = {
  /** The public embed token minted on your server for a specific partner. */
  token: string;
  /** Which embed to render. Only the referral dashboard exists today. */
  data?: "referrals";
  /** Force a theme, or follow the partner's system setting (default). */
  theme?: ToltEmbedTheme;
  /** Match the widget to your brand. */
  themeOptions?: { brandColor?: string; brandTextColor?: string };
  /** Override the embed host (mostly for local development). */
  baseUrl?: string;
  className?: string;
  style?: CSSProperties;
  /** Fires once the dashboard has loaded and reported its size. */
  onReady?: () => void;
  /** Fires if the token is rejected or the dashboard fails to load. */
  onError?: (message: string) => void;
};

const DEFAULT_BASE_URL = "https://embed.tolt.com";

export function ToltEmbed({
  token,
  data = "referrals",
  theme = "system",
  themeOptions,
  baseUrl = DEFAULT_BASE_URL,
  className,
  style,
  onReady,
  onError,
}: ToltEmbedProps) {
  const [height, setHeight] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const origin = safeOrigin(baseUrl);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (origin && event.origin !== origin) return;
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) return;
      const msg = event.data as { type?: string; height?: number; message?: string };
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "tolt-embed:resize" && typeof msg.height === "number") {
        setHeight(msg.height);
      } else if (msg.type === "tolt-embed:ready") {
        onReady?.();
      } else if (msg.type === "tolt-embed:error") {
        onError?.(typeof msg.message === "string" ? msg.message : "Embed failed to load");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin, onReady, onError]);

  return (
    <iframe
      ref={iframeRef}
      src={buildSrc(baseUrl, data, token, theme, themeOptions)}
      title="Tolt referral dashboard"
      className={className}
      allow="clipboard-write"
      style={{ width: "100%", border: "none", colorScheme: "auto", height: height || 520, ...style }}
    />
  );
}

function buildSrc(
  baseUrl: string,
  data: string,
  token: string,
  theme: ToltEmbedTheme,
  themeOptions?: ToltEmbedProps["themeOptions"],
) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/${data}`);
  url.searchParams.set("token", token);
  if (theme !== "system") url.searchParams.set("theme", theme);
  if (themeOptions?.brandColor) url.searchParams.set("brandColor", themeOptions.brandColor);
  if (themeOptions?.brandTextColor) url.searchParams.set("brandTextColor", themeOptions.brandTextColor);
  return url.toString();
}

function safeOrigin(baseUrl: string) {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return null;
  }
}
