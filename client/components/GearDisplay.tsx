"use client";

import { motion } from "motion/react";

interface GearDisplayProps {
  gear: number;
}

export function GearDisplay({ gear }: GearDisplayProps) {
  const displayGear = gear === 0 ? "N" : gear === 15 ? "R" : gear;

  return (
    <motion.div
      className="text-8xl font-black text-center py-8 font-[family-name:'Orbitron']"
      style={{
        background: "linear-gradient(180deg, #ff006e, #ffbe0b)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textShadow: "0 0 40px rgba(255, 0, 110, 0.8)",
        animation: "gear-pulse 0.3s ease-out",
      }}
      key={gear}
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {displayGear}
    </motion.div>
  );
}
