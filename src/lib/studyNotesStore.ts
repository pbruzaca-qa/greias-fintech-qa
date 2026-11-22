export interface StudyNote {
  id: string;
  category: "NOTE" | "SUGGESTION" | "BUG_IDEA";
  author: string;
  content: string;
  createdAt: string;
}

interface StudyNotesMemory {
  notes: StudyNote[];
}

const globalForNotes = globalThis as unknown as {
  __greiasStudyNotes?: StudyNotesMemory;
};

function getNotesMemory(): StudyNotesMemory {
  if (!globalForNotes.__greiasStudyNotes) {
    globalForNotes.__greiasStudyNotes = {
      notes: [
        {
          id: "note_seed_01",
          category: "NOTE",
          author: "Perseu B.",
          content:
            "Practice baseline active: test client vs. server HTTP 422 barriers, Wire $2.50 fee edge cases, and Chaos Monkey resilience.",
          createdAt: "2026-11-23T11:45:00.000Z",
        },
      ],
    };
  }
  return globalForNotes.__greiasStudyNotes;
}

export function listStudyNotes(): StudyNote[] {
  return getNotesMemory().notes.map((n) => ({ ...n }));
}

export function createStudyNote(params: {
  category: StudyNote["category"];
  author: string;
  content: string;
}): StudyNote {
  const mem = getNotesMemory();
  const note: StudyNote = {
    id: `note_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    category: params.category,
    author: params.author.trim() || "Perseu B.",
    content: params.content.trim(),
    createdAt: new Date().toISOString(),
  };
  mem.notes = [note, ...mem.notes];
  return { ...note };
}