import { NextResponse } from "next/server";
import {
  createStudyNote,
  listStudyNotes,
  StudyNote,
} from "@/lib/studyNotesStore";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ notes: listStudyNotes() }, { status: 200 });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      { status: 400 }
    );
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const author =
    typeof body.author === "string" ? body.author.trim() : "Perseu B.";
  const rawCategory =
    typeof body.category === "string" ? body.category : "SUGGESTION";
  const allowed: StudyNote["category"][] = ["NOTE", "SUGGESTION", "BUG_IDEA"];
  const category = allowed.includes(rawCategory as StudyNote["category"])
    ? (rawCategory as StudyNote["category"])
    : "SUGGESTION";

  if (content.length < 4 || content.length > 500) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Note or suggestion must contain between 4 and 500 characters.",
        },
      },
      { status: 422 }
    );
  }

  const note = createStudyNote({ category, author, content });
  return NextResponse.json({ note, notes: listStudyNotes() }, { status: 201 });
}