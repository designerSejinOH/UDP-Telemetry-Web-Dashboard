"use client";

import { motion } from "motion/react";

interface TireTempsProps {
  temps: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
}

export function TireTemps({ temps }: TireTempsProps) {
  const getTireColor = (temp: number): string => {
    if (temp < 60) return "#00ffff";
    if (temp < 80) return "#00ff00";
    if (temp < 95) return "#ffbe0b";
    return "#ff006e";
  };

  const tires = [
    { label: "FL", temp: temps.frontLeft },
    { label: "FR", temp: temps.frontRight },
    { label: "RL", temp: temps.rearLeft },
    { label: "RR", temp: temps.rearRight },
  ];

  return (
    <div
      className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
    >
      <h2 className="font-[family-name:'Orbitron'] text-xl font-bold tracking-[0.2rem] mb-4 text-cyan-400 uppercase border-b-2 border-cyan-400/30 pb-3">
        타이어 온도
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {tires.map((tire, index) => (
          <motion.div
            key={tire.label}
            className="text-center p-4 bg-black/30 rounded-lg border border-cyan-400/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xs opacity-60 tracking-[0.15rem] mb-1">
              {tire.label}
            </div>
            <motion.div
              className="text-3xl font-bold my-1 font-[family-name:'Orbitron']"
              style={{ color: getTireColor(tire.temp) }}
              animate={{
                textShadow: `0 0 20px ${getTireColor(tire.temp)}80`,
              }}
            >
              {tire.temp.toFixed(0)}°
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
