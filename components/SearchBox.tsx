import Icon from "./Icon";

/** Kotak cari global (form GET ke /cari, tanpa JavaScript). */
export default function SearchBox({ defaultValue = "", className = "", autoFocus = false }: { defaultValue?: string; className?: string; autoFocus?: boolean }) {
  return (
    <form action="/cari" method="get" role="search" className={`relative ${className}`}>
      <label htmlFor="cari-q" className="sr-only">Cari game, karya, atau web belajar</label>
      <Icon name="magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      <input id="cari-q" name="q" type="search" defaultValue={defaultValue} autoFocus={autoFocus} maxLength={60}
        placeholder="Cari game, mapel, atau nama guru…"
        className="w-full nb rounded-2xl bg-white dark:bg-slate-900 pl-11 pr-24 py-3.5 font-semibold text-nb-ink dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-nb-yellow" />
      <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-nb-orange border-2 border-nb-ink px-4 py-2 text-sm font-extrabold text-nb-ink">Cari</button>
    </form>
  );
}
