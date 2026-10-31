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
      aria-label="Note title"
      className="h-auto rounded-none border-none bg-transparent px-0 py-1 text-[28px] leading-tight font-bold tracking-tight
        shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-[28px] lg:text-[32px] dark:bg-transparent"
    />
  );
}
