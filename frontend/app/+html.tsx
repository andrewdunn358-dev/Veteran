// @ts-nocheck
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #0f1419 !important;
              }
              body > div:first-child { 
                position: fixed !important; 
                top: 0; 
                left: 50% !important;
                transform: translateX(-50%) !important;
                right: auto !important;
                bottom: 0; 
                width: 100%;
                max-width: 480px !important;
                box-shadow: 0 0 40px rgba(0,0,0,0.5);
              }
              @media (min-width: 481px) {
                body > div:first-child {
                  border-left: 1px solid #2d3748;
                  border-right: 1px solid #2d3748;
                }
              }
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f1419",
        }}
      >
        {children}
      </body>
    </html>
  );
}
