import type { ReactNode } from "react";

export const metadata = {
  title: "TripLive",
  description: "Live luxury travel itinerary",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f7f4ef" }}>
        {children}
      </body>
    </html>
  );
}
