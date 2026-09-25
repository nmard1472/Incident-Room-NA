import { supabase } from "../../../lib/supabase";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { status } = await request.json();

  const { data, error } = await supabase.from("clues").update({ status }).eq("id", id).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ clue: data });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { error } = await supabase.from("clues").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
