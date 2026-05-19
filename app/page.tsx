export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "2px",
            color: "#888",
            textTransform: "uppercase",
          }}
        >
          TripLive
        </p>

        <h1
          style={{
            fontSize: "36px",
            marginTop: "12px",
            marginBottom: "8px",
          }}
        >
          Asia Journey
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "32px",
          }}
        >
          May 23 – June 4, 2026
        </p>

        <div
          style={{
            background: "#111",
            color: "white",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Singapore</h2>
          <p style={{ marginTop: "8px", color: "#ccc" }}>
            82°F · Partly Cloudy
          </p>
          <p style={{ color: "#ccc" }}>
            Local Time: 8:42 PM
          </p>
        </div>

        <div
          style={{
            background: "#f2f2f2",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <h3>Capella Singapore</h3>
          <p>Check-in · May 26</p>
          <p>Premier Garden King</p>
        </div>

        <div
          style={{
            background: "#f2f2f2",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <h3>Offline Mode Enabled</h3>
          <p>
            Confirmations and itinerary details remain available without service.
          </p>
        </div>
      </div>
    </main>
  );
}
