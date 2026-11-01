import type { DataAdapter } from "@/lib/data/data-adapter";
import { scheduleGuestShareUpdate } from "@/lib/sharing/guest-shares";
import { syncEngine } from "@/lib/sync/sync-engine";
import { queueChange, type SyncKind, type SyncOp } from "@/lib/sync/sync-storage";

/**
 * Wraps the local adapter: every change is saved on the device first (as
 * before), then, while signed in, queued for the server. Signed out, it
 * behaves like the local adapter, except that notes shared as a guest get
 * their public copy updated.
 */
export function createSyncingDataAdapter(local: DataAdapter): DataAdapter {
  const track = (kind: SyncKind, id: string, op: SyncOp = "upsert") => {
    if (!syncEngine.isActive()) {
      if (kind === "note") scheduleGuestShareUpdate(id);
      return;
    }
    queueChange(kind, id, op);
    syncEngine.noteLocalChange();
  };

  return {
    getNotes: () => local.getNotes(),
    getCategories: () => local.getCategories(),

    async createNote(categoryId, initial) {
      const note = await local.createNote(categoryId, initial);
      track("note", note.id);
      return note;
    },

    async updateNote(id, changes) {
      const note = await local.updateNote(id, changes);
      if (note) track("note", id);
      return note;
    },

    async deleteNotePermanently(id) {
      await local.deleteNotePermanently(id);
      track("note", id, "delete");
    },

    async emptyTrash() {
      const trashedIds = (await local.getNotes()).filter((note) => note.trashed).map((note) => note.id);
      await local.emptyTrash();
      trashedIds.forEach((id) => track("note", id, "delete"));
    },

    async createCategory(name) {
      const category = await local.createCategory(name);
      track("category", category.id);
      return category;
    },

    async renameCategory(id, name) {
      await local.renameCategory(id, name);
      track("category", id);
    },

    async deleteCategory(id) {
      // The server unassigns the category's notes itself, in one transaction.
      await local.deleteCategory(id);
      track("category", id, "delete");
    },

    async getOrCreateScratchpadNote() {
      const before = (await local.getNotes()).some((note) => note.scratchpad);
      const note = await local.getOrCreateScratchpadNote();
      if (!before) track("note", note.id);
      return note;
    },
  };
}
