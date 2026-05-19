const itinerary = [
  {
    title: "Capella Singapore",
    detail: "Check-in · May 26 · Premier Garden King",
  },
  {
    title: "Private Transfer",
    detail: "Driver details to be added.",
  },
  {
    title: "Offline Mode",
    detail: "Confirmations and saved trip details remain available without service.",
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        padding: "28px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section
        style={{
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.04em" }}>
                TripLive
              </h1>
              <p style={{ margin: "6px 0 0", color: "#78716c" }}>
                Real-time travel itinerary
              </p>
            </div>
            <span
              style={{
                border: "1px solid #e7e5e4",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 12,
                color: "#78716c",
                background: "#fff",
              }}
            >
              Private Link
            </span>
          </div>

          <div
            style={{
              background: "#111",
              color: "#fff",
              borderRadius: 28,
              padding: 24,
              boxShadow: "0 12px 30px rgba(0,0,0,.12)",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#a8a29e",
              }}
            >
              Client Trip
            </p>
            <h2 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.04em" }}>
              Asia Journey
            </h2>
            <p style={{ color: "#d6d3d1", margin: "8px 0 0" }}>
              May 23 – June 4, 2026
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,.1)",
                  borderRadius: 20,
                  padding: 14,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#d6d3d1" }}>
                  Weather
                </p>
                <p style={{ margin: "6px 0 0", fontWeight: 600 }}>
                  82°F · Cloudy
                </p>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,.1)",
                  borderRadius: 20,
                  padding: 14,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#d6d3d1" }}>
                  Local Time
                </p>
                <p style={{ margin: "6px 0 0", fontWeight: 600 }}>
                  8:42 PM · SGT
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {["Today", "Itinerary", "Updates", "Docs"].map((tab) => (
            <div
              key={tab}
              style={{
                textAlign: "center",
                background: "#fff",
                borderRadius: 999,
                padding: "10px 6px",
                fontSize: 13,
                color: "#57534e",
                border: "1px solid #e7e5e4",
              }}
            >
              {tab}
            </div>
          ))}
        </nav>

        <h3 style={{ fontSize: 20, margin: "0 0 12px" }}>Today</h3>

        <div style={{ display: "grid", gap: 12 }}>
          {itinerary.map((item) => (
            <article
              key={item.title}
              style={{
                background: "#fff",
                border: "1px solid #e7e5e4",
                borderRadius: 24,
                padding: 18,
                boxShadow: "0 4px 18px rgba(0,0,0,.05)",
              }}
            >
              <h4 style={{ margin: 0, fontSize: 17 }}>{item.title}</h4>
              <p style={{ margin: "8px 0 0", color: "#57534e", lineHeight: 1.5 }}>
                {item.detail}
              </p>
            </article>
          ))}
        </div>

        <button
          style={{
            width: "100%",
            marginTop: 24,
            border: 0,
            borderRadius: 999,
            padding: "16px 18px",
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Contact Concierge
        </button>
      </section>
    </main>
  );
}
