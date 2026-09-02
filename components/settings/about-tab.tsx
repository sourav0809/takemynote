import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function AboutTab() {
  return (
    <div className="flex flex-col gap-4 text-sm text-muted-foreground">
      <p>
        {APP_NAME} is a modern, markdown-first note-taking app built for
        focus: write quickly, organize with categories, and find what you
        need without friction.
      </p>
      <p>
        Your notes stay yours. {APP_NAME} is designed with privacy in mind
        and gives you full control over your data through export and backup
        tools.
      </p>
      <Button variant="outline" className="w-fit gap-2">
        <ExternalLink />
        View source
      </Button>
    </div>
  );
}
