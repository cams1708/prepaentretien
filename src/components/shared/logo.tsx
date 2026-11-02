import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-base font-semibold tracking-tight",
        className
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#030208]">
        <Image src="/ecm-logo.png" alt="ECM" width={32} height={32} className="size-8" />
      </span>
      <span>
        Prépa <span className="text-primary">Entretien</span>
      </span>
    </Link>
  );
}
