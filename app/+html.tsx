import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML document for web builds.
 * Locks viewport scaling, removes overscroll bounce, and ensures
 * the app fills the entire screen on all devices.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Lock viewport — no zoom, no scaling, cover notch areas */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA / native app feel */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0F0F0F" />

        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Fill entire viewport, remove default margins */
              html, body, #root {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: #0F0F0F;
                overscroll-behavior: none;
                -webkit-overflow-scrolling: touch;
              }

              /* Native app feel: no text selection, no tap highlights */
              * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
              }

              /* Allow text selection inside inputs */
              input, textarea {
                -webkit-user-select: auto;
                user-select: auto;
              }

              /* Extend into safe areas on notched phones */
              @supports (padding: max(0px)) {
                body {
                  padding-left: env(safe-area-inset-left);
                  padding-right: env(safe-area-inset-right);
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
