import { ReactNode, useEffect, useRef } from 'react';
import { X, LoaderCircle, Search, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function Empty({
  title,
  children,
  action
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state bg-white rounded-3xl p-10 text-center border border-gray-200/80 shadow-sm max-w-md mx-auto my-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
        <Search size={26} />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-base text-gray-900">{title}</h3>
        <div className="text-xs text-gray-500 leading-relaxed">{children}</div>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function Button({
  children,
  busy,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={`btn transition active:scale-[0.98] ${busy ? 'opacity-80 cursor-wait' : ''} ${
        props.className || ''
      }`}
    >
      {busy && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
  className = ''
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    const previous = document.activeElement as HTMLElement;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      d?.close();
      document.body.style.overflow = old;
      window.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={`modal ${className} backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm outline-none`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isOutside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
          if (isOutside) {
            onClose();
          }
        }
      }}
      aria-label={title}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        <button
          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close dialog"
          type="button"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div>{children}</div>
    </dialog>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
      <div>
        {eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 font-mono block">
            {eyebrow}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = ''
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Badge({
  children,
  green = false
}: {
  children: ReactNode;
  green?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        green
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}
    >
      {green && <ShieldCheck size={13} className="text-emerald-600" />}
      {children}
    </span>
  );
}

export function FormError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div
      className="p-3 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 font-medium"
      role="alert"
    >
      {error}
    </div>
  );
}

export function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      <img
        className="hn-avatar w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20"
        src={url}
        alt={name}
      />
    );
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <span className="hn-avatar w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
      {initials || 'HN'}
    </span>
  );
}
