import { Download, DownloadCloud, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DataManagementTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          Download all of your notes as Markdown files in a zip archive.
        </p>
        <Button
          variant="secondary"
          className="shrink-0 gap-2"
          onClick={() => toast.info("Export coming soon")}
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
          onClick={() => toast.info("Backup coming soon")}
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
          onClick={() => toast.info("Import coming soon")}
        >
          <UploadCloud />
          Import Backup
        </Button>
      </div>
    </div>
  );
}
