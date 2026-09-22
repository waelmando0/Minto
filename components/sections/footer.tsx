import Image from "next/image";
import Link from "next/link";

import { MintoLogo } from "@/components/logo";
import { StoreButtons } from "@/components/store-buttons";
import { Container } from "@/components/container";
import { footer, mintoMeta } from "@/lib/content";

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-graphite text-white">
      <Container className="relative z-10 pt-24 sm:pt-36">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.6fr] lg:gap-16">
          <div>
            <MintoLogo className="text-2xl [&_svg]:size-7" />
            <p className="mt-5 max-w-[46ch] text-[13px] leading-relaxed text-white/55">{footer.description}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[11px] font-medium tracking-[0.08em] text-white/45 uppercase">{column.title}</h2>
                <ul className="mt-4 grid gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="rounded-sm text-[13px] text-white/85 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Container>

      <div className="relative -mt-4 aspect-[1179/342] min-h-[280px] sm:-mt-10">
        <Image
          src={footer.image.src}
          alt={footer.image.alt}
          fill
          quality={90}
          sizes="100vw"
          className="object-cover [mask-image:linear-gradient(to_bottom,transparent,#000_35%)]"
        />
        <StoreButtons className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex-nowrap" />
        <p className="absolute inset-x-0 bottom-4 text-center text-[11px] text-white/80 [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]">
          © {new Date().getFullYear()} {mintoMeta.name} Financial, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
