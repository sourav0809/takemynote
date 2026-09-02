import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  count?: number;
  onClick: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  isActive,
  count,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-xs text-sidebar-foreground/50">{count}</span>
      )}
    </button>
  );
}
