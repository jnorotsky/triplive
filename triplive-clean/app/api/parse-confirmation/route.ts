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
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Extract booking/reservation details from this confirmation text and return ONLY valid JSON with these exact fields (use null for any field you cannot find):

{
  "type": "hotel" or "flight" or "restaurant" or "activity" or "transfer" or "note",
  "title": "concise name of hotel / airline+flight number / restaurant / activity",
  "subtitle": "room type, cabin class, party size, or other secondary descriptor",
  "day_date": "check-in / arrival / reservation date in YYYY-MM-DD format",
  "time": "check-in time / departure time / reservation time in HH:MM 24-hour format",
  "confirmation_number": "booking reference, confirmation code, or reservation number",
  "location": "full address or city/country of the hotel, restaurant, or activity",
  "detail": "check-out date, special requests, layover info, or any other important notes"
}

Return ONLY the JSON object, no explanation.

Confirmation text:
${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Parse confirmation error:", err);
    return NextResponse.json(
      { error: "Failed to parse confirmation. Please fill in the fields manually." },
      { status: 500 }
    );
  }
}
