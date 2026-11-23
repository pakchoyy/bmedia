import Link from "next/link";

/** Nama kontributor berjalan dari kanan ke kiri. Berhenti saat disentuh/hover; diam jika pengguna memilih kurangi gerakan. */
export default function KontributorMarquee({ names }: { names: string[] }) {
  if (!names.length) return null;
  const items = [...names, ...names]; // digandakan agar putaran mulus
  return (
    <div className="marquee group relative overflow-hidden border-y-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow py-2.5" aria-label="Daftar kontributor">
      <ul className="marquee-track flex w-max gap-3 group-hover:[animation-play-state:paused]">
        {items.map((n, i) => (
          <li key={i} aria-hidden={i >= names.length ? true : undefined}>
            <Link href={`/catalog?q=${encodeURIComponent(n)}`} tabIndex={i >= names.length ? -1 : undefined}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white border-2 border-nb-ink px-3 py-1 text-sm font-extrabold text-nb-ink">
              🧑‍🏫 {n}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
