import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PreferenceSelectRowProps {
  title: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

export function PreferenceSelectRow({
  title,
  description,
  value,
  options,
  onValueChange,
}: PreferenceSelectRowProps) {
  return (
    <div className="flex items-center justify-between gap-8 border-b border-border py-4 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={title}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Select
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onValueChange(newValue);
        }}
      >
        <SelectTrigger id={title} className="w-44 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
