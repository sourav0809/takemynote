import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PreferenceToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function PreferenceToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: PreferenceToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-8 border-b border-border py-4 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={title}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={title}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  );
}
