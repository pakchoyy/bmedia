"use client";

import { useState } from "react";
import Icon from "./Icon";

interface PlayButtonProps {
  mediaId: string;
  linkUrl: string;
  size?: "lg" | "sm";
  className?: string;
}

export default function PlayButton({
  mediaId,
  linkUrl,
  size = "lg",
  className = "",
}: PlayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await fetch(`/api/play/${mediaId}`, { method: "POST" });
    } catch (e) {
      console.error("Gagal menambah plays:", e);
    } finally {
      setLoading(false);
    }
    window.open(linkUrl, "_blank", "noopener,noreferrer");
  };

  if (size === "lg") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full bg-accent text-white py-4 rounded-lg text-xl font-bold mb-4 flex items-center justify-center gap-2.5 transition-transform hover:bg-[#e06c0d] hover:scale-[1.02] disabled:opacity-70 ${className}`}
      >
        {loading ? (
          <>
            <Icon name="hourglass" className="animate-pulse" />
            Menyiapkan...
          </>
        ) : (
          <>
            <Icon name="arrow-up-right-from-square" />
            Buka Media
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full mt-4 py-2 bg-primary-light text-white rounded-lg font-semibold text-sm transition-colors hover:bg-primary disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Icon name="hourglass" className="animate-pulse" />
          Menyiapkan...
        </span>
      ) : (
        "Buka Media"
      )}
    </button>
  );
}
