"use client";

import { motion } from "motion/react";
import type { TelemetryData } from "@/types/telemetry";

interface LapInfoProps {
  telemetry: TelemetryData | null;
}

function formatTime(milliseconds: number | undefined): string {
  if (!milliseconds || milliseconds < 0) return "--:--.---";
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

export function LapInfo({ telemetry }: LapInfoProps) {
  return (
    <div
      className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
    >
      <h2 className="font-[family-name:'Orbitron'] text-xl font-bold tracking-[0.2rem] mb-4 text-cyan-400 uppercase border-b-2 border-cyan-400/30 pb-3">
        랩 정보
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          className="p-3 bg-black/30 rounded-lg border border-cyan-400/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xs opacity-60 tracking-wider mb-1">현재 랩</div>
          <div className="font-[family-name:'Orbitron'] text-xl font-semibold text-cyan-400">
            {telemetry?.lapCount ?? 0}
          </div>
        </motion.div>
        <motion.div
          className="p-3 bg-black/30 rounded-lg border border-cyan-400/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-xs opacity-60 tracking-wider mb-1">총 랩</div>
          <div className="font-[family-name:'Orbitron'] text-xl font-semibold text-cyan-400">
            {telemetry?.lapsInRace ?? 0}
          </div>
        </motion.div>
      </div>

      <div className="mb-4">
        <div className="text-xs opacity-60 tracking-wider mb-2">최고 기록</div>
        <motion.div
          className="font-[family-name:'Orbitron'] text-3xl font-bold text-center text-yellow-400"
          style={{ textShadow: "0 0 20px rgba(255, 190, 11, 0.6)" }}
          key={telemetry?.bestLapTime}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          {formatTime(telemetry?.bestLapTime)}
        </motion.div>
      </div>

      <div>
        <div className="text-xs opacity-60 tracking-wider mb-2">직전 랩</div>
        <motion.div
          className="font-[family-name:'Orbitron'] text-3xl font-bold text-center text-yellow-400"
          style={{ textShadow: "0 0 20px rgba(255, 190, 11, 0.6)" }}
          key={telemetry?.lastLapTime}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          {formatTime(telemetry?.lastLapTime)}
        </motion.div>
      </div>
    </div>
  );
}
