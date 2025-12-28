"use client";

import { motion } from "motion/react";
import type { TelemetryData } from "@/types/telemetry";

interface EngineInfoProps {
  telemetry: TelemetryData | null;
}

export function EngineInfo({ telemetry }: EngineInfoProps) {
  const engineData = [
    { label: "수온", value: telemetry?.waterTemp?.toFixed(0) ?? 0, unit: "°" },
    { label: "오일온", value: telemetry?.oilTemp?.toFixed(0) ?? 0, unit: "°" },
    {
      label: "오일압",
      value: telemetry?.oilPressure?.toFixed(1) ?? 0,
      unit: "",
    },
    { label: "터보", value: telemetry?.turboBoost?.toFixed(2) ?? 0, unit: "" },
  ];

  return (
    <div
      className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
    >
      <h2 className="font-[family-name:'Orbitron'] text-xl font-bold tracking-[0.2rem] mb-4 text-cyan-400 uppercase border-b-2 border-cyan-400/30 pb-3">
        엔진
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {engineData.map((item, index) => (
          <motion.div
            key={item.label}
            className="p-3 bg-black/30 rounded-lg border border-cyan-400/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, borderColor: "rgba(0, 255, 255, 0.5)" }}
          >
            <div className="text-xs opacity-60 tracking-wider mb-1">
              {item.label}
            </div>
            <div className="font-[family-name:'Orbitron'] text-xl font-semibold text-cyan-400">
              {item.value}
              {item.unit}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
