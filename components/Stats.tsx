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

function StatCard({ item, started, delay }: { item: StatItem; started: boolean; delay: number }) {
  const value = useCountUp(item.target, started);
  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{
        opacity: started ? 1 : 0,
        transform: started ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <Icon name={item.icon} className="text-4xl mb-2.5 mx-auto text-accent" />
      <div className="text-4xl font-extrabold leading-none mb-1">{value}</div>
      <div className="text-base opacity-90">{item.label}</div>
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
    <section
      ref={ref}
      className="bg-bgy-stats text-white py-12 my-8"
    >
      <div className="container mx-auto max-w-[1200px] px-6 grid gap-8 text-center grid-cols-1 sm:grid-cols-3">
        {items.map((item, i) => (
          <StatCard key={item.label} item={item} started={started} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}
