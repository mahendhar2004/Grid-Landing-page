import { colleges } from '../../data/colleges'

export default function CollegeTicker() {
  const doubled = [...colleges, ...colleges]

  return (
    <section className="py-6 bg-white border-y border-border overflow-hidden">
      <p className="text-center text-[11px] font-bold text-text-muted/60 uppercase tracking-[3px] mb-4">Trusted by students at</p>
      <div className="animate-ticker flex gap-12 whitespace-nowrap">
        {doubled.map((name, i) => (
          <span key={i} className="text-[15px] font-semibold text-slate-300 select-none">
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
