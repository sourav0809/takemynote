"use client";

import { Download, DownloadCloud, UploadCloud } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { usePreferences } from "@/hooks/use-preferences";
import { useNotes } from "@/hooks/use-notes";
import { downloadAllNotesAsMarkdown, downloadBackupJson, parseBackupJson } from "@/lib/backup";
import { restoreFromBackup } from "@/lib/data";
import { CURRENT_SCHEMA_VERSION } from "@/lib/data/storage-keys";

export function DataManagementTab() {
  const { data: notes } = useNotes();
  const { data: categories } = useCategories();
  const preferences = usePreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const payload = parseBackupJson(text);
      await restoreFromBackup(payload);
      toast.success("Backup imported successfully. Reloading...");
      window.setTimeout(() => window.location.reload(), 600);
    } catch {
      toast.error("Could not import this backup file");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          Download all of your notes as Markdown files.
        </p>
        <Button
          variant="secondary"
          className="shrink-0 gap-2"
          onClick={() => downloadAllNotesAsMarkdown(notes)}
        >
          <Download />
          Download All Notes
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          Export all TakeMyNote data as a single JSON backup file.
        </p>
        <Button
          variant="secondary"
          className="shrink-0 gap-2"
          onClick={() =>
            downloadBackupJson({
              schemaVersion: CURRENT_SCHEMA_VERSION,
              notes,
              categories,
              preferences: {
                activeLineHighlight: preferences.activeLineHighlight,
                scrollPastEnd: preferences.scrollPastEnd,
                sortBy: preferences.sortBy,
                textDirection: preferences.textDirection,
              },
            })
          }
        >
          <DownloadCloud />
          Backup All Notes
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Import a previously exported TakeMyNote JSON backup file.
        </p>
        <Button
          variant="secondary"
          className="shrink-0 gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud />
          Import Backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImportFile(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
