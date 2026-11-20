"use client";

import { normalizeUrl } from "@/lib/utils";
import Icon from "./Icon";

interface PlayButtonProps {
  mediaId: string;
  linkUrl: string;
  size?: "lg" | "sm";
  className?: string;
  onOpened?: () => void;
}

export default function PlayButton({
  mediaId,
  linkUrl,
  size = "lg",
  className = "",
  onOpened,
}: PlayButtonProps) {
  const handleClick = () => {
    const target = normalizeUrl(linkUrl);
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
    fetch(`/api/play/${mediaId}`, { method: "POST", keepalive: true })
      .then((res) => {
        if (res.ok && onOpened) onOpened();
      })
      .catch(() => {});
  };

  if (size === "lg") {
    return (
      <button
        onClick={handleClick}
        className={`nb nb-press w-full bg-nb-orange text-nb-ink min-h-[52px] py-3 rounded-xl text-lg font-extrabold flex items-center justify-center gap-2 ${className}`}
      >
        <Icon name="arrow-up-right-from-square" />
        Buka Media
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`nb-sm nb-press w-full mt-4 py-2 bg-nb-orange text-nb-ink rounded-lg font-extrabold text-sm ${className}`}
    >
      Buka Media
    </button>
  );
}
