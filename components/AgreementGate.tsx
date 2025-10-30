"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface AgreementGateProps {
  open: boolean;
  onAccepted: () => void;
}

export function AgreementGate({ open, onAccepted }: AgreementGateProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glow-card mx-4 max-w-2xl space-y-6 border-neon-blue/30 p-8 shadow-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-neon-blue/70">
                78 LENGTH CONSTELLATION PROTOCOL
              </p>
              <h2 className="text-3xl font-semibold text-neon-purple">
                用户协议 · 银河巡游者协定
              </h2>
              <p className="text-sm text-slate-300/90">
                在进入 78 长度测量仪之前，请确认您已阅读并接受以下内容：
              </p>
              <ul className="space-y-2 text-sm text-slate-300/80">
                <li>• 本测量仪仅供科幻娱乐用途，所有结果均为量子随机生成。</li>
                <li>• 特殊彩蛋及排行榜结果可能引发宇宙级别的心理波动，请做好准备。</li>
                <li>• 管理员将对违禁字符串进行星际封锁，敬请配合。</li>
              </ul>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-600/60 bg-slate-800/40 p-4 backdrop-blur">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="size-5 rounded-md border-2 border-neon-blue/80 bg-slate-900/70 text-neon-purple focus:ring-neon-pink"
              />
              <span className="text-sm text-slate-200">
                我确认已知悉并愿意遵守银河巡游者协定，立即进入 78 长度测量仪。
              </span>
            </label>
            <motion.button
              type="button"
              disabled={!agreed}
              onClick={onAccepted}
              className="w-full rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 shadow-lg transition hover:shadow-[0_0_30px_rgba(168,85,247,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
              whileHover={{ scale: agreed ? 1.01 : 1 }}
              whileTap={{ scale: agreed ? 0.99 : 1 }}
            >
              进入量测界面
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
