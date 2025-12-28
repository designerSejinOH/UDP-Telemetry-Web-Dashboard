"use client";

import { motion } from "motion/react";
import type { TelemetryData } from "@/types/telemetry";

interface FuelInfoProps {
  telemetry: TelemetryData | null;
}

export function FuelInfo({ telemetry }: FuelInfoProps) {
  const fuel = telemetry?.fuelLevel ?? 0;
  const fuelCapacity = telemetry?.fuelCapacity ?? 100;
  const percentage = (fuel / fuelCapacity) * 100;

  return (
    <div
      className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
    >
      <h2 className="font-[family-name:'Orbitron'] text-xl font-bold tracking-[0.2rem] mb-4 text-cyan-400 uppercase border-b-2 border-cyan-400/30 pb-3">
        연료
      </h2>

      <div className="mb-4">
        <div className="flex justify-between mb-2 text-sm tracking-[0.15rem]">
          <span>{fuel.toFixed(1)}L</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-8 bg-black/50 rounded-full overflow-hidden border border-cyan-400/20">
          <motion.div
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #00ff00, #ffbe0b, #ff4500)",
              boxShadow: "0 0 20px currentColor",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="p-3 bg-black/30 rounded-lg border border-cyan-400/10"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xs opacity-60 tracking-wider mb-1">현재</div>
          <div className="font-[family-name:'Orbitron'] text-xl font-semibold text-cyan-400">
            {fuel.toFixed(1)}L
          </div>
        </motion.div>
        <motion.div
          className="p-3 bg-black/30 rounded-lg border border-cyan-400/10"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xs opacity-60 tracking-wider mb-1">용량</div>
          <div className="font-[family-name:'Orbitron'] text-xl font-semibold text-cyan-400">
            {fuelCapacity.toFixed(0)}L
          </div>
        </motion.div>
      </div>
    </div>
  );
}
