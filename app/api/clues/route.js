import { supabase } from "../../lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("clues").select("*").order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ clues: data });
}

export async function POST(request) {
  const body = await request.json();
  const rows = body.clues
    ? body.clues.map((c) => ({ what: c.what.trim(), source: (c.source || "").trim() }))
    : [{ what: body.what.trim(), source: (body.source || "").trim() }];

  const { data, error } = await supabase.from("clues").insert(rows).select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ clues: data });
}
