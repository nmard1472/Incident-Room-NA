import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  const { clues } = await request.json();
  const count = clues?.length ?? 0;

  if (count === 0) {
    return Response.json(
      {
        error:
          "No corroborated clues yet.\n\n" +
          "Mark a clue Corroborated or Key evidence first, then generate the report.",
      },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "No key, no report.\n\n" +
          "Add ANTHROPIC_API_KEY to .env.local (and restart the dev server) to turn this on.",
      },
      { status: 501 }
    );
  }

  const evidence = clues
    .map((c, i) => `${i + 1}. [${c.status}] ${c.what} — source: ${c.source || "unattributed"}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system:
        "You write a police-style investigation report from a numbered list of corroborated " +
        "evidence about the October 2025 Louvre theft. Use only the evidence given — do not " +
        "invent names, dates, or facts beyond it. Write neutral, factual prose in a few short " +
        "paragraphs, as if for an official case file. No headings, no markdown, no bullet lists.",
      messages: [
        { role: "user", content: `Write the report from this corroborated evidence:\n\n${evidence}` },
      ],
    });

    const block = response.content.find((b) => b.type === "text");
    return Response.json({ report: block?.text ?? "" });
  } catch (err) {
    return Response.json(
      { error: `Claude couldn't write the report (${err.message}). Try again.` },
      { status: 502 }
    );
  }
}
