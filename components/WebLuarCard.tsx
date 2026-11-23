import Icon from "./Icon";
import { hostOf, WEB_COLORS } from "@/lib/web-link-utils";
import type { WebLuar } from "@/lib/links";

export default function WebLuarCard({ w, i = 0 }: { w: WebLuar; i?: number }) {
  return (
    <a href={w.url} target="_blank" rel="noopener noreferrer"
      className="nb nb-hover nb-press rounded-2xl bg-white dark:bg-slate-900 p-4 flex flex-col gap-2 h-full">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`nb-flat shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-lg text-nb-ink ${WEB_COLORS[i % WEB_COLORS.length]}`}>
          {w.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-lg leading-tight text-nb-ink dark:text-white">{w.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{hostOf(w.url)}</p>
        </div>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{w.description}</p>
      <div className="flex items-center justify-between text-xs font-extrabold text-nb-ink dark:text-white">
        <span className="nb-flat rounded-full bg-nb-cream px-2.5 py-0.5 text-nb-ink">{w.mapel}</span>
        <span className="inline-flex items-center gap-1">Buka <Icon name="arrow-up-right-from-square" /><span className="sr-only">(tab baru)</span></span>
      </div>
    </a>
  );
}
