import type { ReactNode } from "react";
import { BatteryFull, SignalHigh, Wifi } from "lucide-react";

import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
  /** Accessible description of what the screen shows. */
  label: string;
}

/**
 * A CSS-only titanium phone. The screen is an `app-ui` container, so its
 * contents scale with whatever width the frame is given.
 */
export function PhoneFrame({ children, className, label }: PhoneFrameProps) {
  return (
    <figure
      aria-label={label}
      className={cn(
        "relative aspect-[71.6/146.6] rounded-[16%/7.8%] bg-[linear-gradient(145deg,#f4f4f5,#b9b9bd_30%,#e9e9eb_55%,#9d9da2_80%,#dcdcde)] p-[1.6%]",
        "shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45),0_18px_36px_-18px_rgb(0_0_0/0.3)]",
        className,
      )}
    >
      {/* Hardware buttons */}
      <span aria-hidden className="absolute top-[17%] -left-[0.9%] h-[3.5%] w-[1.2%] rounded-l-sm bg-[#a9a9ae]" />
      <span aria-hidden className="absolute top-[24%] -left-[0.9%] h-[7%] w-[1.2%] rounded-l-sm bg-[#a9a9ae]" />
      <span aria-hidden className="absolute top-[33%] -left-[0.9%] h-[7%] w-[1.2%] rounded-l-sm bg-[#a9a9ae]" />
      <span aria-hidden className="absolute top-[27%] -right-[0.9%] h-[11%] w-[1.2%] rounded-r-sm bg-[#a9a9ae]" />

      <div className="h-full rounded-[14.6%/7.1%] bg-black p-[3%]">
        <div className="app-ui relative h-full overflow-hidden rounded-[12.5%/6%] bg-[#f5f5f7]">
          <div aria-hidden className="absolute top-[2.6cqw] left-1/2 z-20 h-[8.6cqw] w-[29cqw] -translate-x-1/2 rounded-full bg-black" />
          <StatusBar />
          {children}
          <div aria-hidden className="absolute bottom-[2cqw] left-1/2 z-20 h-[1.2cqw] w-[34cqw] -translate-x-1/2 rounded-full bg-[#141414]/80" />
        </div>
      </div>
    </figure>
  );
}

function StatusBar() {
  return (
    <div aria-hidden className="flex h-[13.5cqw] items-center justify-between px-[9cqw] pt-[1cqw] text-[#141414]">
      <span className="text-[3.6cqw] font-semibold tracking-[-0.02em]">9:41</span>
      <span className="flex items-center gap-[1.2cqw]">
        <SignalHigh className="size-[4cqw]" strokeWidth={3} />
        <Wifi className="size-[3.8cqw]" strokeWidth={3} />
        <BatteryFull className="size-[5.2cqw]" strokeWidth={2} />
      </span>
    </div>
  );
}
