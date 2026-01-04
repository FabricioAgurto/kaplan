"use client";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="glass glow w-full max-w-lg rounded-3xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="relative border-b border-white/10 px-5 py-4 bg-black/10">
          <div className="text-lg font-semibold pr-12">{title}</div>

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-10 h-10 rounded-xl
                       border border-white/12 bg-white/8 hover:bg-white/12
                       transition text-white/80 hover:text-white"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body con scroll */}
        <div className="max-h-[75vh] overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* Footer fijo */}
        {footer && (
          <div className="border-t border-white/10 px-5 py-4 bg-black/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
