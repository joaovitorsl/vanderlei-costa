// Provisional digital symbol. Replace this single mark with an official asset when supplied.
export default function Logo({wordmark = false, compact = false}: {wordmark?:boolean; compact?:boolean}) {
  return <><span className="brand-symbol" aria-label="Vanderlei Costa">VC↗</span>{wordmark && <span>{compact ? 'Vanderlei Costa' : 'VANDERLEI COSTA'}<small>{compact ? 'Treinador' : 'TREINADOR'}</small></span>}</>;
}
