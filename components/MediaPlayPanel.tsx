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
    <div className="w-[300px] bg-pagebg dark:bg-slate-800 p-6 rounded-xl shrink-0 max-md:w-full">
      <PlayButton
        mediaId={mediaId}
        linkUrl={linkUrl}
        onOpened={() => setPlays((p) => p + 1)}
      />
      <div className="text-sm text-gray-600 dark:text-slate-400 border-t border-gray-300 dark:border-slate-700 pt-3">
        <Icon name="chart-simple" className="mr-1" />
        Digunakan: <strong>{formatPlays(plays)}</strong> kali
      </div>
    </div>
  );
}