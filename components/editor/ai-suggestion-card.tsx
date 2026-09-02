import { Sparkles } from "lucide-react";

interface AiSuggestionCardProps {
  suggestion: string;
}

export function AiSuggestionCard({ suggestion }: AiSuggestionCardProps) {
  return (
    <div className="mx-8 mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">AI Suggestion</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{suggestion}</p>
      </div>
    </div>
  );
}
