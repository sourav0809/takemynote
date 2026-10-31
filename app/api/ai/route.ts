import {
  AI_MAX_INPUT_CHARS,
  type AiAction,
  type AiResponseBody,
  isAiAction,
} from "@/lib/ai/ai-actions";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const AI_MODEL = "gpt-5.4-mini";

const BASE_INSTRUCTIONS =
  "You help inside a calm, minimal notes app. Reply with Markdown only: no preamble, no closing remarks, no code fences around the whole answer. Match the language of the note.";

const ACTION_INSTRUCTIONS: Record<AiAction, string> = {
  summarize: "Summarize the note in 2 to 4 short bullet points.",
  checklist:
    'Turn the actionable items in the note into a Markdown task list using "- [ ] " items. If there is nothing actionable, suggest 3 sensible next steps as tasks.',
  fix: "Fix spelling, grammar and punctuation. Keep the meaning, tone, structure and Markdown formatting exactly. Return the full corrected note.",
  continue:
    "Continue the note with one or two short paragraphs in the same voice. Return only the new text.",
};

interface OpenAiResponse {
  output?: { type: string; content?: { type: string; text?: string }[] }[];
  error?: { message?: string };
}

function readOutputText(data: OpenAiResponse): string {
  return (data.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function errorResponse(error: string, status: number) {
  return Response.json({ error } satisfies AiResponseBody, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPEN_AI_API_KEY?.trim();
  if (!apiKey) return errorResponse("AI is not set up on this server.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  const { action, title, markdown } = (body ?? {}) as Record<string, unknown>;
  if (!isAiAction(action) || typeof markdown !== "string" || typeof title !== "string") {
    return errorResponse("Invalid request.", 400);
  }
  if (!markdown.trim() && !title.trim()) {
    return errorResponse("Write something first, then ask AI.", 400);
  }
  if (markdown.length > AI_MAX_INPUT_CHARS) {
    return errorResponse("This note is too long for AI right now.", 413);
  }

  try {
    const upstream = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        reasoning: { effort: "low" },
        instructions: `${BASE_INSTRUCTIONS}\n\n${ACTION_INSTRUCTIONS[action]}`,
        input: `# ${title || "Untitled"}\n\n${markdown}`,
      }),
    });
    const data = (await upstream.json()) as OpenAiResponse;
    if (!upstream.ok) return errorResponse("AI is unavailable right now. Try again.", 502);

    const text = readOutputText(data);
    if (!text) return errorResponse("AI returned nothing. Try again.", 502);
    return Response.json({ text } satisfies AiResponseBody);
  } catch {
    return errorResponse("Could not reach AI. Check your connection.", 502);
  }
}
