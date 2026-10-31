import { LogoMark } from "@/components/brand/logo-mark";
import { STAGE_CATEGORIES, STAGE_FOLDERS } from "@/components/landing/stage/stage-mock-data";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StageSidebar() {
  return (
    <div className="hidden flex-col gap-5 border-r border-line bg-canvas p-3 lg:flex">
      <div className="flex items-center gap-2 px-1.5 pt-1">
        <LogoMark className="size-5" />
        <span className="text-[13px] font-semibold text-ink">{APP_NAME}</span>
      </div>

      <ul className="flex flex-col gap-0.5">
        {STAGE_FOLDERS.map(({ label, icon: Icon, count, active }) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium",
              active ? "bg-accent/70 text-ink" : "text-muted"
            )}
          >
            <Icon className="size-3.5" />
            <span className="flex-1">{label}</span>
            {count !== null && <span className="font-mono text-[11px] text-subtle">{count}</span>}
          </li>
        ))}
      </ul>

      <div>
        <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-wide text-subtle uppercase">
          Categories
        </p>
        <ul className="flex flex-col gap-0.5">
          {STAGE_CATEGORIES.map(({ label, dotClass }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-muted"
            >
              <span className={cn("size-1.5 rounded-full", dotClass)} />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
