import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ToltEmbedTheme = "light" | "dark" | "system";

/**
 * Recolor and reshape the dashboard to match your app. Every field is optional;
 * anything you leave out keeps the Tolt default for the active `theme`.
 */
export type ToltEmbedThemeOptions = {
  /** Accent: the copy button, links, and the earnings sparkline. */
  brandColor?: string;
  /** Text and icons that sit on top of `brandColor`. */
  brandTextColor?: string;
  /** The dashboard card surface. */
  backgroundColor?: string;
  /** Raised tiles inside the card: the stats and the referral-link field. */
  surfaceColor?: string;
  /** Primary text. */
  textColor?: string;
  /** Secondary text and labels. */
  mutedColor?: string;
  /** Hairline borders and dividers. */
  borderColor?: string;
  /** Corner radius. A number is treated as pixels; a string is used as-is. */
  radius?: number | string;
  /** Body font stack. */
  fontFamily?: string;
  /** Heading font stack. */
  headingFontFamily?: string;
};

export type ToltEmbedProps = {
  /** The public embed token minted on your server for a specific partner. Omit to render a sample dashboard. */
  token?: string;
  /** Which embed to render. Only the referral dashboard exists today. */
  data?: "referrals";
  /** Force a theme, or follow the partner's system setting (default). */
  theme?: ToltEmbedTheme;
  /** Match the widget to your brand. */
  themeOptions?: ToltEmbedThemeOptions;
  /** Override the embed host, or point straight at a hosted `.html` file (mostly for local development). */
  baseUrl?: string;
  className?: string;
  style?: CSSProperties;
  /** Fires once the dashboard has loaded and reported its size. */
  onReady?: () => void;
  /** Fires if the token is rejected or the dashboard fails to load. */
  onError?: (message: string) => void;
};

const DEFAULT_BASE_URL = "https://embed.tolt.com";

const THEME_KEYS: (keyof ToltEmbedThemeOptions)[] = [
  "brandColor",
  "brandTextColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "mutedColor",
  "borderColor",
  "radius",
  "fontFamily",
  "headingFontFamily",
];

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
  token: string | undefined,
  theme: ToltEmbedTheme,
  themeOptions?: ToltEmbedThemeOptions,
) {
  const trimmed = baseUrl.replace(/\/$/, "");
  const target = /\.html?(\?|#|$)/i.test(trimmed) ? trimmed : `${trimmed}/${data}`;
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  if (theme !== "system") params.set("theme", theme);
  if (themeOptions) {
    for (const key of THEME_KEYS) {
      const value = themeOptions[key];
      if (value === undefined || value === null || value === "") continue;
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `${target}?${query}` : target;
}

function safeOrigin(baseUrl: string) {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return null;
  }
}
