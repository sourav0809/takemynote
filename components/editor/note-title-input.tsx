import { Input } from "@/components/ui/input";

interface NoteTitleInputProps {
  title: string;
  onChange: (title: string) => void;
}

export function NoteTitleInput({ title, onChange }: NoteTitleInputProps) {
  return (
    <Input
      value={title}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Untitled"
      className="h-auto border-none bg-transparent px-0 py-2 text-2xl leading-tight font-bold tracking-tight
        shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-3xl"
    />
  );
}
