"use client";

import { useState } from "react";
import PlayButton from "./PlayButton";
import Icon from "./Icon";
import { formatPlays } from "@/lib/utils";

interface MediaPlayPanelProps {
  mediaId: string;
  linkUrl: string;
  initialPlays: number;
}

export default function MediaPlayPanel({
  mediaId,
  linkUrl,
  initialPlays,
}: MediaPlayPanelProps) {
  const [plays, setPlays] = useState(initialPlays);

  return (
    <div className="max-w-sm">
      <PlayButton
        mediaId={mediaId}
        linkUrl={linkUrl}
        onOpened={() => setPlays((p) => p + 1)}
      />
      <div className="text-sm text-gray-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
        <Icon name="chart-simple" />
        Digunakan: <strong>{formatPlays(plays)}</strong> kali
      </div>
    </div>
  );
}