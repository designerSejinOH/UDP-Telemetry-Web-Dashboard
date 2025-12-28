"use client";

import { motion } from "motion/react";

interface CircularGaugeProps {
  value: number;
  max: number;
  color: string;
  label: string;
}

export function CircularGauge({
  value,
  max,
  color,
  label,
}: CircularGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-full aspect-square">
      <svg
        className="w-full h-full drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]"
        viewBox="0 0 320 320"
      >
        <defs>
          <linearGradient
            id={`gradient-${label}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="20"
        />

        {/* Animated progress circle */}
        <motion.circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke={`url(#gradient-${label})`}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 160 160)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <motion.div
          className="text-6xl font-black leading-none font-[family-name:'Orbitron']"
          style={{
            background:
              label === "KM/H"
                ? "linear-gradient(180deg, #00ffff, #ffbe0b)"
                : "linear-gradient(180deg, #ff006e, #ffbe0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 30px rgba(0, 255, 255, 0.8)",
          }}
          key={Math.round(value)}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          {Math.round(value)}
        </motion.div>
        <div className="text-sm opacity-70 tracking-[0.2rem] mt-1">{label}</div>
      </div>
    </div>
  );
}
