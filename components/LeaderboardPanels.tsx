"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";

export interface LeaderboardEntry {
  id: string;
  name: string;
  value: number;
  listedAt?: string | null;
}

interface LeaderboardPanelsProps {
  ascending: LeaderboardEntry[];
  descending: LeaderboardEntry[];
  highlightName?: string;
}

function renderValue(value: number) {
  return value === 9999 || value === -9999 ? value : `${value} cm`;
}

export function LeaderboardPanels({
  ascending,
  descending,
  highlightName
}: LeaderboardPanelsProps) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AnimatePresence>
        {[{ title: "倒序荣耀榜", data: descending }, { title: "正序奇迹榜", data: ascending }].map(
          ({ title, data }) => (
            <motion.div
              key={title}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.45, delay: title === "倒序荣耀榜" ? 0 : 0.1 }}
              className="glow-card h-full overflow-hidden border border-slate-700/50"
            >
              <div className="flex items-center justify-between border-b border-slate-700/40 bg-slate-900/40 px-6 py-4">
                <div className="flex items-center gap-3 text-neon-blue">
                  <Trophy className="size-5 animate-pulseGlow" />
                  <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  top {Math.max(ascending.length, descending.length) || 0}
                </span>
              </div>
              <ul className="grid gap-3 p-6">
                {data.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
                    暂无上传，等待新的银河旅人。
                  </li>
                )}
                {data.map((entry, index) => {
                  const isHighlight =
                    highlightName &&
                    entry.name.localeCompare(highlightName, "zh-CN", {
                      sensitivity: "accent"
                    }) === 0;
                  return (
                    <motion.li
                      key={entry.id}
                      layout
                      transition={{ type: "spring", stiffness: 140, damping: 16 }}
                      className={`flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/40 px-5 py-4 backdrop-blur ${
                        isHighlight ? "border-neon-pink/70 shadow-[0_0_20px_rgba(244,114,182,0.35)]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-neon-purple">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-100">{entry.name}</p>
                          <p className="text-xs text-slate-400">
                            {entry.listedAt
                              ? new Date(entry.listedAt).toLocaleString("zh-CN", {
                                  hour12: false
                                })
                              : "未知时间"}
                          </p>
                        </div>
                      </div>
                      <span className="text-base font-semibold text-neon-amber">
                        {renderValue(entry.value)}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
