"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import type { SiteStats } from "@/lib/queries";

interface StatItem {
  icon: string;
  target: number;
  label: string;
}

function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let current = 0;
    const speed = 200;
    const step = target / speed;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.ceil(current));
      }
    }, 10);
    return () => clearInterval(timer);
  }, [target, start]);
  return value.toLocaleString("id-ID") + "+";
}

const TILE_BG = ["bg-nb-yellow", "bg-nb-mint", "bg-nb-pink"];

function StatCard({ item, started, delay, index }: { item: StatItem; started: boolean; delay: number; index: number }) {
  const value = useCountUp(item.target, started);
  return (
    <div
      className={`nb rounded-2xl ${TILE_BG[index % TILE_BG.length]} text-nb-ink px-4 py-4 flex items-center gap-3 transition-all duration-500 ease-out`}
      style={{
        opacity: started ? 1 : 0,
        transform: started ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="nb-sm shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center">
        <Icon name={item.icon} className="text-2xl text-nb-ink" />
      </div>
      <div className="text-left">
        <div className="font-display font-bold text-3xl leading-none">{value}</div>
        <div className="text-sm font-bold mt-1">{item.label}</div>
      </div>
    </div>
  );
}

export default function Stats({ stats }: { stats: SiteStats }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items: StatItem[] = [
    { icon: "laptop-file", target: stats.totalMedia, label: "Total Media" },
    { icon: "chalkboard-user", target: stats.totalTeachers, label: "Guru Kontributor" },
    { icon: "users", target: stats.totalPlays, label: "Total Penggunaan" },
  ];

  return (
    <section ref={ref} className="py-6 px-4">
      <div className="container mx-auto max-w-[1200px] grid gap-4 grid-cols-1 sm:grid-cols-3">
        {items.map((item, i) => (
          <StatCard key={item.label} item={item} started={started} delay={i * 100} index={i} />
        ))}
      </div>
    </section>
  );
}
