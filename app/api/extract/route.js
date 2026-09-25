import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request) {
  const { url } = await request.json();

  if (!url) {
    return Response.json({ error: "No link to read." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "No key, no extraction.\n\n" +
          "Add ANTHROPIC_API_KEY to .env.local (and restart the dev server) to turn this on.",
      },
      { status: 501 }
    );
  }

  let text;
  try {
    const page = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!page.ok) {
      return Response.json({ error: `Could not read that link (${page.status}).` }, { status: 502 });
    }
    text = stripHtml(await page.text()).slice(0, 15000);
  } catch {
    return Response.json({ error: "Could not reach that link." }, { status: 502 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system:
        "You extract factual claims from news articles for an investigation board about the " +
        "October 2025 Louvre theft. Pull out claims the article states as fact, one per clue, " +
        'in your own concise words. Respond with JSON only, matching exactly: {"clues": ' +
        '[{"what": string, "source": string}]}. "source" is who the article attributes the ' +
        "claim to (a named official, witness, or outlet), or the article's own outlet if " +
        "unattributed. No prose before or after the JSON.",
      messages: [{ role: "user", content: `Article text:\n\n${text}` }],
    });

    const block = response.content.find((b) => b.type === "text");
    const parsed = JSON.parse(block?.text ?? "{}");

    if (!Array.isArray(parsed.clues)) {
      throw new Error("malformed response");
    }

    return Response.json({ clues: parsed.clues });
  } catch (err) {
    return Response.json(
      { error: `Claude couldn't pull clues from that page (${err.message}). Add one by hand for now.` },
      { status: 502 }
    );
  }
}
