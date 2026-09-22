import { AppSectionHeader } from "@/components/app-ui/primitives";
import { quickActions as defaultActions } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/types";

export function QuickActions({ actions = defaultActions, className }: { actions?: QuickAction[]; className?: string }) {
  return (
    <div className={className}>
      <AppSectionHeader title="Quick Action" action="Customize" />
      <ul className="mt-[3cqw] grid grid-cols-5 gap-[2cqw]">
        {actions.map(({ label, icon: Icon }) => (
          <li key={label} className="flex flex-col items-center gap-[1.6cqw]">
            <span
              aria-hidden
              className={cn(
                "relative grid size-[11.5cqw] place-items-center rounded-[3.2cqw] bg-white text-[#2f6df6]",
                "shadow-[0_0.8cqw_2cqw_-0.6cqw_rgb(20_20_40/0.18)] ring-1 ring-black/[0.04]",
              )}
            >
              <Icon className="size-[5cqw]" strokeWidth={2} />
              <span className="absolute right-[2.4cqw] bottom-[2.4cqw] size-[1.8cqw] rounded-full bg-[#f7a531] ring-[0.5cqw] ring-white" />
            </span>
            <span className="text-[2.3cqw] text-[#6b6b70]">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
