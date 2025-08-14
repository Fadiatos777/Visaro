import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, phone, discord, gtaUsername, notes } = body || {};

    const phoneDigits = String(phone || "").replace(/\D/g, "");
    const isPhoneValid = /^\d{3,}$/.test(phoneDigits);
    if (!fullName || !isPhoneValid) {
      return NextResponse.json(
        { error: "Invalid input. Ensure Full Name is present and phone has digits only (min 3)." },
        { status: 400 }
      );
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return NextResponse.json(
        { error: "Discord webhook not configured" },
        { status: 500 }
      );
    }

    const embed = {
      title: "Visaro Lead Capture",
      color: 0x509887,
      fields: [
        { name: "Full Name", value: String(fullName), inline: false },
        { name: "Phone Number", value: phoneDigits, inline: false },
        { name: "(( Discord ))", value: discord ? String(discord) : "-", inline: false },
        { name: "(( GTA:W Username ))", value: gtaUsername ? String(gtaUsername) : "-", inline: false },
        { name: "Notes", value: notes ? String(notes) : "-", inline: false },
      ],
      timestamp: new Date().toISOString(),
    } as const;

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `<@${process.env.DISCORD_MENTION_USER_ID || "260018504277819393"}>`,
        allowed_mentions: {
          parse: [],
          users: [process.env.DISCORD_MENTION_USER_ID || "260018504277819393"],
        },
        embeds: [embed],
      }),
      // Webhook endpoint is external; avoid caching
      cache: "no-store",
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Discord webhook failed: ${res.status} ${t}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Lead delivery error:", error);
    return NextResponse.json(
      { error: "Failed to send lead. Please try again later." },
      { status: 500 }
    );
  }
}


