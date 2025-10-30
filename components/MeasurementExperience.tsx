"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UploadCloud } from "lucide-react";
import { AgreementGate } from "./AgreementGate";
import { LeaderboardPanels, LeaderboardEntry } from "./LeaderboardPanels";
import { createLengthComment } from "@/lib/measurement";

interface MeasurementResponse {
  measurementId: string;
  name: string;
  value: number;
  listed: boolean;
  ranks: {
    ascending: number;
    descending: number;
  };
}

interface LeaderboardPayload {
  ascending: LeaderboardEntry[];
  descending: LeaderboardEntry[];
}

const AGREEMENT_STORAGE_KEY = "check78-user-agreement";

export function MeasurementExperience() {
  const [needsAgreement, setNeedsAgreement] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [measurement, setMeasurement] = useState<MeasurementResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload>({
    ascending: [],
    descending: []
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = window.localStorage.getItem(AGREEMENT_STORAGE_KEY);
    if (accepted === "yes") {
      setNeedsAgreement(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("无法获取排行榜");
      }
      const data: LeaderboardPayload = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleAgreementAccepted = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AGREEMENT_STORAGE_KEY, "yes");
    }
    setNeedsAgreement(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setErrorMessage("请先输入一个代号或名字。");
      return;
    }
    try {
      setStatus("loading");
      const response = await fetch("/api/measure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: trimmed })
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure?.error ?? "测量失败，请稍后再试。");
      }
      const payload = (await response.json()) as MeasurementResponse;
      setMeasurement(payload);
      await refreshLeaderboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "未知异常发生。");
      setMeasurement(null);
    } finally {
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!measurement) return;
    setUploading(true);
    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: measurement.name, upload: true })
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure?.error ?? "上传失败");
      }
      const updated = (await response.json()) as MeasurementResponse;
      setMeasurement(updated);
      await refreshLeaderboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const evaluation = useMemo(() => {
    if (!measurement) return null;
    return createLengthComment(measurement.value);
  }, [measurement]);

  return (
    <div className="relative z-10">
      <AgreementGate open={needsAgreement} onAccepted={handleAgreementAccepted} />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mb-12 space-y-6 text-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-700/50 bg-slate-900/40 px-6 py-2 text-xs uppercase tracking-[0.35em] text-neon-blue/80 backdrop-blur">
            78 长度测量仪
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-100 md:text-5xl">
            星际尺度下的科幻量测
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300/80 md:text-base">
            输入任意名字，唤醒量子级随机引擎。彩蛋、灰色幽默与排行榜同频共振，打造高互动的科幻体验。
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="glow-card mb-12 border border-slate-700/50 p-8"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                输入你的星际代号
              </span>
              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="例如：张三、银河游侠、Quantum-78"
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 px-5 py-4 text-base text-slate-100 shadow-inner placeholder:text-slate-500 focus:border-neon-purple/80 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </label>
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
              whileTap={{ scale: status === "loading" ? 1 : 0.97 }}
              className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-slate-950 shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:min-w-[180px]"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  计算中...
                </span>
              ) : (
                "开始测量"
              )}
            </motion.button>
          </div>
          {errorMessage && (
            <p className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          )}
        </motion.form>

        {measurement && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]"
          >
            <div className="glow-card space-y-6 border border-neon-blue/40 p-8">
              <header className="space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-neon-blue/70">
                  量测结果
                </p>
                <h2 className="text-2xl font-semibold text-slate-100">
                  {measurement.name}
                </h2>
              </header>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6">
                <p className="text-sm text-slate-400">长度读数</p>
                <p className="mt-2 text-5xl font-bold text-neon-amber">
                  {measurement.value === 9999 || measurement.value === -9999
                    ? measurement.value
                    : `${measurement.value} cm`}
                </p>
                <p className="mt-4 text-sm text-slate-300/90">{evaluation}</p>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/50 p-6 text-sm text-slate-300/80">
                <p>
                  正序排名：{" "}
                  <span className="font-semibold text-neon-purple">
                    #{measurement.ranks.ascending}
                  </span>
                </p>
                <p>
                  倒序排名：{" "}
                  <span className="font-semibold text-neon-purple">
                    #{measurement.ranks.descending}
                  </span>
                </p>
              </div>
              <motion.button
                type="button"
                onClick={handleUpload}
                disabled={measurement.listed || uploading}
                whileHover={{ scale: measurement.listed || uploading ? 1 : 1.01 }}
                whileTap={{ scale: measurement.listed || uploading ? 1 : 0.98 }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-neon-purple/60 bg-slate-900/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-neon-purple transition hover:bg-neon-purple/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <UploadCloud className="size-5" />
                {measurement.listed ? "已上传到排行榜" : uploading ? "上传中..." : "上传到排行榜"}
              </motion.button>
            </div>
            <div className="glow-card border border-slate-700/60 p-8">
              <h3 className="text-lg font-semibold text-neon-blue">排行榜快照</h3>
              <p className="mt-2 text-sm text-slate-400">
                可随时在下方查看更多详细榜单。即使不上传也能围观银河英雄。
              </p>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 space-y-3"
              >
                {leaderboard.descending.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/50 px-5 py-4 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-neon-amber">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-neon-purple">{entry.value}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <header className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold text-neon-blue">银河排行榜中心</h2>
            <p className="text-sm text-slate-400">
              即使不上传也能探索榜单，随时了解宇宙尺度的奇闻异事。
            </p>
          </header>
          <LeaderboardPanels
            ascending={leaderboard.ascending}
            descending={leaderboard.descending}
            highlightName={measurement?.name}
          />
        </motion.section>
      </section>
    </div>
  );
}
