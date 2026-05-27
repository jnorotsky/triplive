import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured in Vercel environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Extract booking/reservation details from this confirmation text and return ONLY valid JSON with these exact fields (use null for any field you cannot find):

{
  "type": "hotel" or "flight" or "restaurant" or "activity" or "transfer" or "note",
  "title": "concise name of hotel / airline+flight number / restaurant / activity",
  "subtitle": "room type, cabin class, party size, or other secondary descriptor",
  "day_date": "check-in / arrival / reservation date in strict YYYY-MM-DD format",
  "end_date": "check-out / return / end date in strict YYYY-MM-DD format (hotels and multi-day activities only — null otherwise)",
  "time": "check-in time / departure time / reservation time in HH:MM 24-hour format",
  "confirmation_number": "booking reference, confirmation code, or reservation number",
  "location": "full address or city/country of the hotel, restaurant, or activity",
  "detail": "newline-separated bullet points covering amenities, included perks, special requests, cancellation policy, layover info, etc. — ONE fact per line, no bullet characters, no numbering"
}

Rules:
- All dates MUST be strict YYYY-MM-DD (e.g. "2026-05-26"). Never use other formats.
- For hotels: day_date is the check-in date, end_date is the check-out date.
- For flights: day_date is the departure date, end_date stays null.
- For everything else: end_date stays null unless the booking explicitly spans multiple days.
- The "detail" field MUST be formatted as multiple short lines separated by \\n newline characters, where each line is ONE distinct fact (one amenity, one policy, one note). Do NOT prefix lines with bullets, dashes, asterisks, or numbers — the UI adds bullets automatically. Do NOT cram multiple things into one line. Do NOT include the check-out date in detail (it goes in end_date). Keep each line short and scannable.
- Example detail value: "Daily breakfast included\\n$100 USD hotel credit\\nRoom upgrade on arrival\\nEarly check-in / late check-out subject to availability\\nRefundable with 2-day cancellation deadline"
- Return ONLY the JSON object, no explanation, no markdown fences.

Confirmation text:
${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      throw new Error(`Anthropic API error ${response.status}: ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Parse confirmation error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
