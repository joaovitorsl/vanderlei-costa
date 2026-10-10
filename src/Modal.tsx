import {useEffect, useLayoutEffect, useId, useRef, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft, X} from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  compact?: boolean;
  stickyFooter?: boolean;
  fullScreenOnMobile?: boolean;
};

export default function Modal({title, subtitle, onClose, children, compact = false, stickyFooter = false, fullScreenOnMobile = false}: Props) {
  const ref = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();

  useLayoutEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const padding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const overflow = document.body.style.overflow;
    const background = document.querySelector<HTMLElement>('.app');
    const wasInert = background?.inert ?? false;
    if (background) background.inert = true;
    if(scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
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
      document.body.style.paddingRight = padding;
      if (background) background.inert = wasInert;
      document.removeEventListener('keydown', handler);
      if (before?.isConnected) before.focus({preventScroll:true});
    };
  }, []);

  useEffect(() => {
    if (!fullScreenOnMobile || !window.visualViewport) return;
    const viewport = window.visualViewport;
    let frame = 0;
    const fitViewport = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const surface = overlay.current;
        if (!surface) return;
        const mobile = window.matchMedia('(max-width:599px)').matches && viewport.scale === 1;
        surface.style.setProperty('--form-height', mobile ? `${viewport.height}px` : '100dvh');
        surface.style.setProperty('--form-top', mobile ? `${viewport.offsetTop}px` : '0px');
        if (!mobile) return;
        const focused = document.activeElement;
        if (!(focused instanceof HTMLElement) || !focused.matches('input,select,textarea') || !surface.contains(focused)) return;
        const bounds = focused.getBoundingClientRect();
        const header = ref.current?.querySelector('.sheet-header')?.getBoundingClientRect();
        const actions = ref.current?.querySelector('.sheet-actions')?.getBoundingClientRect();
        const top = (header?.bottom ?? viewport.offsetTop) + 12;
        const bottom = Math.min(viewport.offsetTop + viewport.height - 16, actions?.top ?? Infinity) - 12;
        if (bounds.bottom > bottom) surface.scrollBy({top:bounds.bottom - bottom});
        else if (bounds.top < top) surface.scrollBy({top:bounds.top - top});
      });
    };
    fitViewport();
    viewport.addEventListener('resize', fitViewport);
    viewport.addEventListener('scroll', fitViewport);
    document.addEventListener('focusin', fitViewport);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', fitViewport);
      viewport.removeEventListener('scroll', fitViewport);
      document.removeEventListener('focusin', fitViewport);
    };
  }, [fullScreenOnMobile]);

  return createPortal(<div ref={overlay} className={`overlay ${fullScreenOnMobile ? 'form-overlay' : ''}`} onClick={onClose}>
    <section ref={ref} className={`sheet ${compact ? 'compact-sheet' : ''} ${stickyFooter ? 'sticky-footer-sheet' : ''} ${fullScreenOnMobile ? 'form-sheet' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} onClick={e => e.stopPropagation()}>
      <div className="sheet-header">
        {fullScreenOnMobile && <button type="button" className="icon-button form-back" onClick={onClose} aria-label="Voltar sem salvar"><ArrowLeft size={22}/></button>}
        <div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="icon-button sheet-close" onClick={onClose} aria-label="Fechar"><X size={21}/></button>
      </div>
      {children}
    </section>
  </div>, document.body);
}
