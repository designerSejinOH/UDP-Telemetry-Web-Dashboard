"use client";

import { motion } from "motion/react";

interface InputBarsProps {
  throttle: number;
  brake: number;
}

export function InputBars({ throttle, brake }: InputBarsProps) {
  return (
    <div
      className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
    >
      <h2 className="font-[family-name:'Orbitron'] text-xl font-bold tracking-[0.2rem] mb-4 text-cyan-400 uppercase border-b-2 border-cyan-400/30 pb-3">
        입력
      </h2>

      {/* Throttle */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm tracking-[0.15rem]">
          <span>스로틀</span>
          <span>{throttle.toFixed(0)}%</span>
        </div>
        <div className="h-8 bg-black/50 rounded-full overflow-hidden border border-cyan-400/20">
          <motion.div
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #00ffff, #ffbe0b)",
              boxShadow: "0 0 20px currentColor",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${throttle}%` }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Brake */}
      <div>
        <div className="flex justify-between mb-2 text-sm tracking-[0.15rem]">
          <span>브레이크</span>
          <span>{brake.toFixed(0)}%</span>
        </div>
        <div className="h-8 bg-black/50 rounded-full overflow-hidden border border-cyan-400/20">
          <motion.div
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #ff006e, #ff4500)",
              boxShadow: "0 0 20px currentColor",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${brake}%` }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
