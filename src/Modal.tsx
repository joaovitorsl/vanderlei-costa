import {useEffect, useId, useRef, type ReactNode} from 'react';
import {ArrowLeft, X} from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  compact?: boolean;
  fullScreenOnMobile?: boolean;
};

export default function Modal({title, subtitle, onClose, children, compact = false, fullScreenOnMobile = false}: Props) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const background = document.querySelector<HTMLElement>('.app');
    const wasInert = background?.inert ?? false;
    if (background) background.inert = true;
    document.body.style.overflow = 'hidden';
    Array.from(ref.current?.querySelectorAll<HTMLElement>('button') || []).find(el => el.offsetParent !== null)?.focus({preventScroll:true});
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab') return;
      const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('button,input,select,textarea,[tabindex="0"]') || [])
        .filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = overflow;
      if (background) background.inert = wasInert;
      document.removeEventListener('keydown', handler);
      if (before?.isConnected) before.focus({preventScroll:true});
    };
  }, []);

  return <div className={`overlay ${fullScreenOnMobile ? 'form-overlay' : ''}`} onClick={onClose}>
    <section ref={ref} className={`sheet ${compact ? 'compact-sheet' : ''} ${fullScreenOnMobile ? 'form-sheet' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} onClick={e => e.stopPropagation()}>
      <div className="sheet-header">
        {fullScreenOnMobile && <button type="button" className="icon-button form-back" onClick={onClose} aria-label="Voltar sem salvar"><ArrowLeft size={22}/></button>}
        <div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="icon-button sheet-close" onClick={onClose} aria-label="Fechar"><X size={21}/></button>
      </div>
      {children}
    </section>
  </div>;
}
