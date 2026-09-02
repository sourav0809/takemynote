import { useState } from "react";

import { Input } from "@/components/ui/input";

interface AddCategoryInputProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function AddCategoryInput({ onSubmit, onCancel }: AddCategoryInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <Input
      autoFocus
      placeholder="New category..."
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Enter") handleSubmit();
        if (event.key === "Escape") onCancel();
      }}
      className="h-8 bg-sidebar-accent text-sm text-sidebar-accent-foreground placeholder:text-sidebar-foreground/40"
    />
  );
}
