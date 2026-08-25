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
      theme="system"
      themeOptions={{ brandColor: "#B1FD7A" }}
    />
  );
}
```

The token is public and short-lived, so it's safe to send to the browser. The component renders a Tolt-hosted iframe and resizes itself to fit the content.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `token` | `string` | required | The public embed token from your server. |
| `data` | `"referrals"` | `"referrals"` | Which embed to render. |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Follows the partner's OS setting by default. |
| `themeOptions` | `{ brandColor?, brandTextColor? }` | none | Recolor the accent to match your app. |
| `baseUrl` | `string` | `https://embed.tolt.com` | Point at a local host during development. |
| `onReady` | `() => void` | none | Fires once the dashboard has loaded. |
| `onError` | `(message: string) => void` | none | Fires if the token is rejected. |

## Not using React?

Drop the iframe in directly:

```html
<iframe
  src="https://embed.tolt.com/referrals?token=PUBLIC_TOKEN"
  style="width: 100%; border: none"
  allow="clipboard-write"
></iframe>
```
