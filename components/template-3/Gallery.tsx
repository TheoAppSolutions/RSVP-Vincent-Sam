"use client";

import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/shared/Modal";
import { EVENT } from "@/lib/event";
import { GALLERY_PHOTOS } from "@/lib/gallery";

export default function Gallery() {
  const [bad, setBad] = useState<string[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => {
    const photos = GALLERY_PHOTOS.filter(({ src }) => !bad.includes(src));
    return Array.from({ length: Math.ceil(photos.length / 3) }, (_, index) =>
      // Keep portrait pairs together on small screens, in the same reading order.
      photos.slice(index * 3, index * 3 + 3).sort((a, b) =>
        Number(a.width >= a.height) - Number(b.width >= b.height),
      ),
    );
  }, [bad]);
  const imgs = useMemo(() => rows.flat(), [rows]);
  const step = useCallback((direction: number) => setOpen((current) => current === null ? current : (current + direction + imgs.length) % imgs.length), [imgs.length]);

  useEffect(() => {
    const tiles = gridRef.current?.querySelectorAll<HTMLButtonElement>(".photo-tile");
    if (!tiles) return;
    setReady(true);
    if (!('IntersectionObserver' in window)) {
      setRevealed(new Set(imgs.map(({ src }) => src)));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting);
      if (!entering.length) return;
      setRevealed((current) => {
        const next = new Set(current);
        entering.forEach((entry) => {
          const src = (entry.target as HTMLElement).dataset.src;
          if (src) next.add(src);
          observer.unobserve(entry.target);
        });
        return next;
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    tiles.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, [imgs]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  if (!imgs.length) return null;
  return (
    <section id="gallery" className="gallery-section section-pad" aria-labelledby="gallery-title">
      <div className="section-wrap">
        <div className="section-heading gallery-heading"><span className="eyebrow">02 / The little moments</span><h2 id="gallery-title" className="display-heading">A glimpse into <em>our story</em></h2><p>The laughter, quiet glances, and little moments that brought us here.</p></div>
        <div ref={gridRef} className={`photo-grid${ready ? " reveal-ready" : ""}`}>
          {rows.map((row) => (
            <div key={row.map(({ src }) => src).join(",")} className={`photo-row${row.filter((photo) => photo.width < photo.height).length === 1 ? " photo-row-feature" : ""}`} style={{ "--photo-columns": row.map(({ width, height }) => `${width / height}fr`).join(" ") } as CSSProperties}>
              {row.map((photo, columnIndex) => {
                const { src, width, height } = photo;
                const index = imgs.indexOf(photo);
                const landscape = width >= height;
                return (
                  <button key={src} type="button" data-src={src} onClick={() => setOpen(index)} aria-label={`Enlarge photo ${index + 1} of ${imgs.length}`} className={`photo-tile photo-tile-${landscape ? "landscape" : "portrait"}${revealed.has(src) ? " is-revealed" : ""}`} style={{ aspectRatio: `${width} / ${height}`, transitionDelay: `${columnIndex * 100}ms` }}>
                    <Image src={photo} alt={`${EVENT.honoree}, moment ${index + 1}`} fill sizes={landscape ? "(max-width: 800px) calc(100vw - 40px), (min-width: 1320px) 660px, 53vw" : "(max-width: 800px) 50vw, (min-width: 1320px) 290px, 24vw"} onError={() => setBad((current) => current.includes(src) ? current : [...current, src])} />
                    <span aria-hidden="true">View photo ↗</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {open !== null && imgs[open] && <Modal label={`Photo ${open + 1} of ${imgs.length}`} onClose={() => setOpen(null)}><div className="gallery-modal" onClick={() => setOpen(null)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[open].src} alt={`${EVENT.honoree}, moment ${open + 1}`} onClick={(event) => event.stopPropagation()} />
        <button type="button" className="modal-close" aria-label="Close gallery" onClick={() => setOpen(null)}>×</button>
        <button type="button" className="modal-prev" aria-label="Previous photo" onClick={(event) => { event.stopPropagation(); step(-1); }}>‹</button>
        <button type="button" className="modal-next" aria-label="Next photo" onClick={(event) => { event.stopPropagation(); step(1); }}>›</button>
        <span className="modal-count">{String(open + 1).padStart(2, "0")} / {String(imgs.length).padStart(2, "0")}</span>
      </div></Modal>}
    </section>
  );
}
