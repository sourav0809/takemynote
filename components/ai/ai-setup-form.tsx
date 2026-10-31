"use client";

import { CircleCheck, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { AiProviderLogo } from "@/components/brand/ai-provider-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiSettings } from "@/hooks/use-ai-settings";
import { toFriendlyAiError } from "@/lib/ai/ai-errors";
import { loadApiKey, removeApiKey, saveApiKey } from "@/lib/ai/key-vault";
import {
  AI_PROVIDER_IDS,
  AI_PROVIDERS,
  getDefaultModel,
  getModelOption,
  type AiProviderId,
} from "@/lib/ai/providers";
import { verifyApiKey } from "@/lib/ai/writing-agent";
import { cn } from "@/lib/utils";

interface AiSetupFormProps {
  /** Called after the key is checked and saved. */
  onSaved?: () => void;
  /** Settings shows "Remove key"; the welcome flow and quick setup don't. */
  allowRemove?: boolean;
}

/**
 * Provider → model → API key. The key is checked with one tiny request, then
 * encrypted on this device. It is never shown again, only its last 4 characters.
 */
export function AiSetupForm({ onSaved, allowRemove = false }: AiSetupFormProps) {
  const settings = useAiSettings();
  const fieldId = useId();
  const [provider, setProvider] = useState<AiProviderId>(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [keyInput, setKeyInput] = useState("");
  const [isKeyVisible, setKeyVisible] = useState(false);
  const [isChecking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const info = AI_PROVIDERS[provider];
  const typedKey = keyInput.trim();
  const hasSavedKeyForProvider = settings.savedKey?.provider === provider;
  const isDirty =
    !settings.isReady || provider !== settings.provider || model !== settings.model || typedKey !== "";
  const canSubmit = isDirty && (typedKey !== "" || hasSavedKeyForProvider) && !isChecking;
  const showsPrefixHint = typedKey !== "" && !typedKey.startsWith(info.keyPrefix);

  const chooseProvider = (next: AiProviderId) => {
    setProvider(next);
    setModel(next === settings.provider ? settings.model : getDefaultModel(next));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setChecking(true);
    setError(null);

    try {
      const apiKey = typedKey || (await loadApiKey(provider));
      if (!apiKey) {
        setError(`Paste your ${info.name} API key.`);
        return;
      }
      await verifyApiKey(provider, model, apiKey);
      if (typedKey) await saveApiKey(provider, typedKey);
      settings.update({ provider, model });
      setKeyInput("");
      setKeyVisible(false);
      toast.success(`AI is ready with ${getModelOption(provider, model)?.label ?? info.name}`);
      onSaved?.();
    } catch (caught) {
      setError(toFriendlyAiError(caught, provider).message);
    } finally {
      setChecking(false);
    }
  };

  const handleRemove = async () => {
    await removeApiKey();
    setKeyInput("");
    setError(null);
    toast.success("AI key removed from this device");
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5" autoComplete="off">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Provider</span>
        <div role="radiogroup" aria-label="AI provider" className="grid grid-cols-3 gap-2">
          {AI_PROVIDER_IDS.map((id) => {
            const isSelected = id === provider;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => chooseProvider(id)}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-xl border px-2 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary text-foreground ring-1 ring-primary"
                    : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                )}
              >
                <AiProviderLogo provider={id} />
                <span className="truncate">{AI_PROVIDERS[id].name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${fieldId}-model`}>Model</Label>
        <Select
          items={info.models.map((option) => ({ value: option.id, label: option.label }))}
          value={model}
          onValueChange={(value) => value && setModel(value)}
        >
          <SelectTrigger id={`${fieldId}-model`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {info.models.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <span className="flex flex-col gap-0.5 py-0.5">
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${fieldId}-key`}>API key</Label>
          <a
            href={info.keyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Get a key
            <ExternalLink className="size-3" />
          </a>
        </div>
        <div className="relative">
          <Input
            id={`${fieldId}-key`}
            name="ai-api-key"
            type={isKeyVisible ? "text" : "password"}
            value={keyInput}
            onChange={(event) => {
              setKeyInput(event.target.value);
              setError(null);
            }}
            placeholder={hasSavedKeyForProvider ? `Saved key ••••${settings.savedKey?.hint}` : info.keyPlaceholder}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            aria-invalid={error ? true : undefined}
            className="h-10 pr-11 font-mono text-[13px] placeholder:font-sans"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1 right-1 text-muted-foreground"
            aria-label={isKeyVisible ? "Hide key" : "Show key"}
            onClick={() => setKeyVisible((visible) => !visible)}
          >
            {isKeyVisible ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {hasSavedKeyForProvider
            ? "Leave empty to keep your saved key."
            : `Encrypted and kept on this device. Only ever sent to ${info.name}.`}
          {showsPrefixHint && ` ${info.name} keys usually start with “${info.keyPrefix}”.`}
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button type="submit" className="h-10 px-4" disabled={!canSubmit}>
          {isChecking && <Loader2 className="animate-spin" />}
          {isChecking ? "Checking key…" : hasSavedKeyForProvider && settings.isReady ? "Save changes" : "Connect"}
        </Button>
        {settings.isReady && !isDirty && (
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <CircleCheck className="size-4 shrink-0 text-primary" />
            <span className="truncate">Connected · key ••••{settings.savedKey?.hint}</span>
          </p>
        )}
        {allowRemove && settings.savedKey && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto h-10 text-muted-foreground hover:text-destructive"
            onClick={() => void handleRemove()}
          >
            Remove key
          </Button>
        )}
      </div>
    </form>
  );
}
