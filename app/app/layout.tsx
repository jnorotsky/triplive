export const metadata = {
  title: "TripLive",
  description: "Luxury travel itinerary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f7f4ef",
        }}
      >
        {children}
      </body>
    </html>
  );
}
