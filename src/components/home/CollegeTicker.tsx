import { colleges } from '../../data/colleges'

export default function CollegeTicker() {
  const doubled = [...colleges, ...colleges]

  return (
    <section className="py-8 bg-surface border-y border-border overflow-hidden">
      <div className="animate-ticker flex gap-16 whitespace-nowrap">
        {doubled.map((name, i) => (
          <span key={i} className="text-lg font-bold text-slate-200 select-none">
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
