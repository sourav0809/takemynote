"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useId, useState } from "react";

import { AuthShowcase } from "@/components/account/auth-showcase";
import { GoogleIcon } from "@/components/brand/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type AuthMode = "sign-in" | "sign-up";

interface AuthDialogProps {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onOpenChange: (open: boolean) => void;
  /** Offer "Continue with Google" (its OAuth client is configured). */
  googleEnabled: boolean;
  /** Why we're asking, e.g. "Sign in to share this note." */
  reason?: string | null;
  /** Shown when Google sign-in sent the person back with a problem. */
  initialError?: string | null;
  /** Where Google sends people back to (query on /notes, e.g. "?share=<id>"). */
  returnQuery?: string;
  /** Signed in with email and password (Google reloads the page instead). */
  onSignedIn: () => void;
}

const MIN_PASSWORD = 8;
const EASE_OUT = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

const LEGAL_LINK_CLASS = "underline underline-offset-2 outline-none hover:text-foreground focus-visible:text-foreground";

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string; switchPrompt: string; switchAction: string }> = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to sync your notes across your devices.",
    submit: "Sign in",
    switchPrompt: "New to TakeMyNote?",
    switchAction: "Create an account",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Free. Your notes sync across devices, and you can share them with a link.",
    submit: "Create account",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
  },
};

/** Better Auth error → a short, human message. */
function describeError(error: { code?: string; status?: number; message?: string }, mode: AuthMode): string {
  const code = error.code ?? "";
  if (error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (code.includes("ALREADY_EXISTS")) return "An account with this email already exists. Sign in instead.";
  if (code.includes("INVALID_EMAIL_OR_PASSWORD") || code.includes("INVALID_PASSWORD")) return "That email and password don’t match.";
  if (code.includes("PASSWORD_TOO_SHORT")) return `Use at least ${MIN_PASSWORD} characters for your password.`;
  if (code.includes("INVALID_EMAIL")) return "Enter a valid email address.";
  return mode === "sign-in" ? "Couldn’t sign you in. Please try again." : "Couldn’t create your account. Please try again.";
}

interface FieldProps extends React.ComponentProps<typeof Input> {
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
}

function Field({ label, hint, trailing, id, className, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input id={id} className={cn("h-11 rounded-xl px-3.5", trailing && "pr-11", className)} {...props} />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Sign in or create an account: a calm picture on the left, the form on the
 * right. On phones it's a bottom sheet with the picture as a short banner.
 */
export function AuthDialog({
  open,
  mode,
  onModeChange,
  onOpenChange,
  googleEnabled,
  reason,
  initialError,
  returnQuery = "",
  onSignedIn,
}: AuthDialogProps) {
  const fieldId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isWorking, setWorking] = useState(false);
  const [isGoogleWorking, setGoogleWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[mode];
  const shownError = error ?? initialError ?? null;

  const switchMode = () => {
    setError(null);
    setPassword("");
    onModeChange(mode === "sign-in" ? "sign-up" : "sign-in");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isWorking) return;
    setError(null);
    const trimmedEmail = email.trim();
    if (mode === "sign-up" && !name.trim()) return setError("Tell us your name.");
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) return setError("Enter a valid email address.");
    if (password.length < MIN_PASSWORD) {
      return setError(mode === "sign-up" ? `Use at least ${MIN_PASSWORD} characters for your password.` : "That email and password don’t match.");
    }

    setWorking(true);
    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({ name: name.trim(), email: trimmedEmail, password })
          : await authClient.signIn.email({ email: trimmedEmail, password });
      if (result.error) {
        setError(describeError(result.error, mode));
        return;
      }
      setPassword("");
      onSignedIn();
    } catch {
      setError("Couldn’t reach TakeMyNote. Check your connection.");
    } finally {
      setWorking(false);
    }
  };

  const continueWithGoogle = async () => {
    setError(null);
    setGoogleWorking(true);
    const { error: googleError } = await authClient.signIn.social({ provider: "google", callbackURL: `/notes${returnQuery}` });
    // On success the browser is already on its way to Google.
    if (googleError) {
      setGoogleWorking(false);
      setError("Couldn’t start Google sign-in. Please try again.");
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !isWorking && onOpenChange(next)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/35 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-sm",
            "data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
            EASE_OUT
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            // Phones: a bottom sheet. sm and up: a centred two-column card.
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-3xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/5 outline-none",
            "sm:inset-0 sm:m-auto sm:grid sm:h-[min(620px,calc(100dvh-3rem))] sm:max-h-none sm:w-[calc(100%-3rem)] sm:max-w-[880px] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:rounded-3xl dark:ring-foreground/10",
            "transition-[opacity,translate,scale] duration-300 motion-reduce:transition-none",
            "data-starting-style:translate-y-full data-ending-style:translate-y-full",
            "sm:data-starting-style:translate-y-4 sm:data-starting-style:scale-[0.97] sm:data-starting-style:opacity-0",
            "sm:data-ending-style:translate-y-2 sm:data-ending-style:opacity-0",
            EASE_OUT
          )}
        >
          {/* Picture slides: a short banner on phones, the left column from sm up. */}
          <AuthShowcase className="h-32 shrink-0 sm:h-full" />

          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm sm:top-4 sm:right-4"
              />
            }
          >
            <X />
          </DialogPrimitive.Close>

          {/* Form. */}
          <div className="min-h-0 overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:flex sm:flex-col sm:justify-center sm:px-10 sm:py-10">
            <div className="mx-auto w-full max-w-sm">
              <DialogPrimitive.Title className="text-2xl font-semibold tracking-tight">{copy.title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground">
                {reason ?? copy.subtitle}
              </DialogPrimitive.Description>

              {googleEnabled && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 h-11 w-full gap-2.5 rounded-xl text-[15px]"
                    disabled={isGoogleWorking || isWorking}
                    onClick={() => void continueWithGoogle()}
                  >
                    {isGoogleWorking ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                    Continue with Google
                  </Button>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
                    <span className="h-px flex-1 bg-border" />
                    or with email
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </>
              )}

              <form onSubmit={(event) => void submit(event)} className={cn("flex flex-col gap-4", !googleEnabled && "mt-6")} noValidate>
                {mode === "sign-up" && (
                  <Field
                    id={`${fieldId}-name`}
                    label="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    maxLength={60}
                    autoFocus
                    placeholder="Your name"
                  />
                )}
                <Field
                  id={`${fieldId}-email`}
                  label="Email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  autoFocus={mode === "sign-in"}
                  placeholder="you@example.com"
                />
                <Field
                  id={`${fieldId}-password`}
                  label="Password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  maxLength={128}
                  hint={mode === "sign-up" ? `At least ${MIN_PASSWORD} characters.` : undefined}
                  trailing={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      onClick={() => setPasswordVisible((visible) => !visible)}
                    >
                      {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  }
                />

                {shownError && (
                  <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                    {shownError}
                  </p>
                )}

                <Button type="submit" className="mt-1 h-11 w-full rounded-xl text-[15px]" disabled={isWorking || isGoogleWorking}>
                  {isWorking && <Loader2 className="animate-spin" />}
                  {copy.submit}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {copy.switchPrompt}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
                >
                  {copy.switchAction}
                </button>
              </p>
              {/* New tab, so the dialog and what they were doing stay put. */}
              <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                By continuing, you agree to the{" "}
                <a href={ROUTES.terms} target="_blank" rel="noreferrer" className={LEGAL_LINK_CLASS}>
                  Terms
                </a>{" "}
                and{" "}
                <a href={ROUTES.privacy} target="_blank" rel="noreferrer" className={LEGAL_LINK_CLASS}>
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
