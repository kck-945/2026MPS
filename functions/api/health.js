export async function onRequestGet() {
  return Response.json({
    ok: true,
    service: "anivance-mps-form",
  });
}
