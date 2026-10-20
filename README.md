# @tolt/embed

Drop a partner's referral dashboard into your app with one React component. Your partners see their link, earnings, and referrals without leaving your product or signing in to Tolt.

## Install

```bash
npm install @tolt/embed
```

## Use it

Mint a scoped token on your server, then render the component on the client.

On your server (the API key stays here, never in the browser):

```ts
const res = await fetch("https://api.tolt.com/v2/embed-tokens", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.TOLT_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ partnerId: "part_9fQ2xLL" }),
});
const { token } = await res.json();
```

On the client:

```tsx
import { ToltEmbed } from "@tolt/embed";

export function ReferralsPage({ token }: { token: string }) {
  return (
    <ToltEmbed
      token={token}
      theme="dark"
      themeOptions={{
        brandColor: "#4F46E5",
        backgroundColor: "#191919",
        radius: 10,
      }}
    />
  );
}
```

The token is public and short-lived, so it's safe to send to the browser. The component renders a Tolt-hosted iframe and resizes itself to fit the content.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `token` | `string` | none | The public embed token from your server. Omit to render a sample dashboard. |
| `data` | `"referrals"` | `"referrals"` | Which embed to render. |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Follows the partner's OS setting by default. |
| `themeOptions` | `ToltEmbedThemeOptions` | none | Recolor and reshape the widget to match your app. |
| `baseUrl` | `string` | `https://embed.tolt.com` | Point at a local host, or straight at a hosted `.html` file, during development. |
| `onReady` | `() => void` | none | Fires once the dashboard has loaded. |
| `onError` | `(message: string) => void` | none | Fires if the token is rejected. |

## Theming

`theme` picks light, dark, or the partner's OS setting. `themeOptions` overrides individual tokens on top of that; everything is optional, and anything you leave out keeps the default for the active `theme`.

| Field | Applies to |
| --- | --- |
| `brandColor` | Accent: the copy button, links, and the earnings sparkline. |
| `brandTextColor` | Text and icons on top of `brandColor`. Defaults to white or near-black, whichever contrasts better with `brandColor`. |
| `backgroundColor` | The dashboard card surface. |
| `surfaceColor` | Raised tiles inside the card (stats, the referral-link field). |
| `textColor` | Primary text. |
| `mutedColor` | Secondary text and labels. |
| `borderColor` | Hairline borders and dividers. |
| `radius` | Corner radius. A number is treated as pixels; a string is used as-is. |
| `fontFamily` | Body font stack. |
| `headingFontFamily` | Heading font stack. |

```tsx
<ToltEmbed
  token={token}
  theme="dark"
  themeOptions={{
    brandColor: "#4F46E5",
    brandTextColor: "#0D0F12",
    backgroundColor: "#191919",
    surfaceColor: "#111214",
    textColor: "#F2F4F6",
    mutedColor: "#9AA1AB",
    borderColor: "#24272D",
    radius: 10,
    fontFamily: "Inter, system-ui, sans-serif",
    headingFontFamily: "Söhne, Inter, sans-serif",
  }}
/>
```

## Not using React?

Drop the iframe in directly. The same theme options are query parameters:

```html
<iframe
  src="https://embed.tolt.com/referrals?token=PUBLIC_TOKEN&theme=dark&brandColor=%234F46E5&backgroundColor=%23191919&radius=10"
  style="width: 100%; border: none"
  allow="clipboard-write"
></iframe>
```
