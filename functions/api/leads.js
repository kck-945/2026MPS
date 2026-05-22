export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const message = String(payload.message || "").trim();
    const source = String(payload.source || "mps-world-summit-2026").trim();
    const submittedAt = String(payload.submittedAt || new Date().toISOString());

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid submission." }, { status: 400 });
    }

    if (message.length > 1200) {
      return Response.json({ error: "Message is too long." }, { status: 400 });
    }

    if (!context.env.DB) {
      return Response.json({ error: "Database is not configured." }, { status: 500 });
    }

    await context.env.DB.prepare(
      `INSERT INTO leads (name, email, message, source, submitted_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(name, email, message, source, submittedAt)
      .run();

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Unable to save submission." }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}
