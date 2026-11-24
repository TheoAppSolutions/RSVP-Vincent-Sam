"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  onClose: () => void;
  label?: string;
  labelledBy?: string;
  describedBy?: string;
};

export default function Modal({ children, onClose, label, labelledBy, describedBy }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Native modal dialogs move and contain focus, and make the background inert.
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={ref} className="modal-root" role="dialog" aria-modal="true"
    aria-label={label} aria-labelledby={labelledBy} aria-describedby={describedBy}
    onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(ref.current!.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.matches(":disabled") && element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {children}
  </dialog>;
}
