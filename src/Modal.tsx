import {useEffect, useId, useRef, type ReactNode} from 'react';
import {X} from 'lucide-react';
export default function Modal({title, subtitle, onClose, children, compact = false}: {title: string; subtitle?: string; onClose: () => void; children: ReactNode; compact?: boolean}) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector<HTMLElement>('input,select,textarea,button');
    first?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab') return;
      const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('button,input,select,textarea,[tabindex="0"]') || []).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) {e.preventDefault(); last.focus();}
      else if (!e.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) {e.preventDefault(); first.focus();}
    };
    document.addEventListener('keydown', handler);
    return () => {document.body.style.overflow = overflow; document.removeEventListener('keydown', handler); before?.focus();};
  }, []);
  return <div className="overlay" onClick={onClose}><section ref={ref} className={`sheet ${compact ? 'compact-sheet' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} onClick={e => e.stopPropagation()}>
    <div className="sheet-header"><div>{subtitle && <p>{subtitle}</p>}<h2 id={id}>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={21}/></button></div>{children}
  </section></div>;
}
