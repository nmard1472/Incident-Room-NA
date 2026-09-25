import { supabase } from "../../lib/supabase";

export async function POST(request) {
  const { report } = await request.json();

  if (!report?.trim()) {
    return Response.json({ error: "Nothing to publish yet." }, { status: 400 });
  }

  const { data, error } = await supabase.from("reports").insert({ body: report }).select().single();

  if (error) {
    return Response.json({ error: `Couldn't save the report (${error.message}).` }, { status: 500 });
  }

  return Response.json({ id: data.id });
}
