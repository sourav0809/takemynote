"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AccountSwitchDialogProps {
  open: boolean;
  onChoose: (choice: "add" | "remove") => void;
}

/**
 * Signed in with a different account than the notes on this device came from.
 * Nothing is uploaded until the person decides.
 */
export function AccountSwitchDialog({ open, onChoose }: AccountSwitchDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Notes from another account</DialogTitle>
          <DialogDescription>
            This device has notes kept from a different account. Add them to the account you just signed in with, or
            remove them from this device?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="h-10" onClick={() => onChoose("remove")}>
            Remove from this device
          </Button>
          <Button className="h-10 px-4" onClick={() => onChoose("add")}>
            Add to this account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
