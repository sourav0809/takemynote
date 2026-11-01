"use client";

import { ChevronsUpDown, LogIn, LogOut, Settings, UserRound } from "lucide-react";

import { useAccount, type AccountUser } from "@/components/account/account-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppState } from "@/hooks/use-app-state";
import { cn } from "@/lib/utils";

function initials(user: AccountUser): string {
  const source = user.name.trim() || user.email;
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function firstName(user: AccountUser): string {
  return user.name.trim().split(/\s+/)[0] || user.email.split("@")[0];
}

export function UserAvatar({ user, className }: { user: AccountUser; className?: string }) {
  return (
    <Avatar className={className}>
      {user.image && <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">{initials(user)}</AvatarFallback>
    </Avatar>
  );
}

/** Not signed in: a neutral person in a soft circle. */
function GuestAvatar({ className }: { className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border", className)}>
      <UserRound className="size-[55%]" />
    </span>
  );
}

interface AccountMenuProps {
  /** "rail": avatar only, for the collapsed sidebar. */
  variant?: "footer" | "rail";
}

/**
 * The profile chip at the bottom of the sidebar: avatar and first name (or
 * "Guest"), opening a small menu: Sign in or Sign out, and Settings.
 */
export function AccountMenu({ variant = "footer" }: AccountMenuProps) {
  const { enabled, user, isPending, openAuth, requestSignOut } = useAccount();
  const { openSettings } = useAppState();
  const isRail = variant === "rail";
  const label = user ? firstName(user) : "Guest";

  const avatar = isPending ? (
    <span className="size-7 shrink-0 animate-pulse rounded-full bg-muted" />
  ) : user ? (
    <UserAvatar user={user} className="size-7" />
  ) : (
    <GuestAvatar className="size-7" />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label={user ? `Account: ${user.name || user.email}` : "Account and settings"}
            className={cn(
              isRail
                ? "size-10 rounded-xl p-0"
                : "h-11 max-w-[70%] min-w-0 justify-start gap-2.5 rounded-xl px-2 lg:h-10"
            )}
          />
        }
      >
        {avatar}
        {!isRail && (
          <>
            <span className={cn("truncate text-sm font-medium", user ? "text-foreground" : "text-muted-foreground")}>
              {isPending ? <span className="block h-3 w-16 animate-pulse rounded-full bg-muted" /> : label}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/70" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side={isRail ? "right" : "top"} align={isRail ? "end" : "start"} sideOffset={8} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 py-2">
            {user ? <UserAvatar user={user} className="size-9" /> : <GuestAvatar className="size-9" />}
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{user ? user.name || firstName(user) : "Guest"}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user ? user.email : "Notes stay in this browser"}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {enabled && !user && (
          <>
            <DropdownMenuGroup>
              {/* Creating an account is one link away inside the sign-in dialog. */}
              <DropdownMenuItem onClick={() => openAuth({ mode: "sign-in" })}>
                <LogIn />
                Sign in
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openSettings()}>
            <Settings />
            Settings
          </DropdownMenuItem>
          {user && (
            <DropdownMenuItem onClick={requestSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
