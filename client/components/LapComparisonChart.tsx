"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LapData, TelemetryPoint } from "@/types/lap-data";

interface LapComparisonChartProps {
  currentLapData: TelemetryPoint[];
  previousLaps: LapData[];
  selectedLapNumbers: number[];
  type: "speed" | "input" | "tire";
}

// 랩별 색상
const LAP_COLORS = [
  "#00ffff", // 시안 (현재 랩)
  "#ff00ff", // 마젠타
  "#00ff00", // 녹색
  "#ffff00", // 노란색
  "#ff6600", // 주황색
  "#6600ff", // 보라색
];

export function LapComparisonChart({
  currentLapData,
  previousLaps,
  selectedLapNumbers,
  type,
}: LapComparisonChartProps) {
  // 데이터 정규화 (시간 기준으로 정렬)
  const normalizeData = () => {
    const maxLength = Math.max(
      currentLapData.length,
      ...previousLaps
        .filter((lap) => selectedLapNumbers.includes(lap.lapNumber))
        .map((lap) => lap.telemetryPoints.length)
    );

    const normalized: unknown[] = [];

    for (let i = 0; i < maxLength; i++) {
      const point: Record<string, unknown> = { index: i };

      // 현재 랩 데이터
      if (i < currentLapData.length) {
        const current = currentLapData[i];
        point.current_speed = current.speed;
        point.current_rpm = current.rpm;
        point.current_throttle = current.throttle;
        point.current_brake = current.brake;
        point.current_tireTempFL = current.tireTempFL;
        point.current_tireTempFR = current.tireTempFR;
        point.current_tireTempRL = current.tireTempRL;
        point.current_tireTempRR = current.tireTempRR;
      }

      // 선택된 이전 랩들
      previousLaps
        .filter((lap) => selectedLapNumbers.includes(lap.lapNumber))
        .forEach((lap) => {
          if (i < lap.telemetryPoints.length) {
            const telemetry = lap.telemetryPoints[i];
            const prefix = `lap${lap.lapNumber}`;
            point[`${prefix}_speed`] = telemetry.speed;
            point[`${prefix}_rpm`] = telemetry.rpm;
            point[`${prefix}_throttle`] = telemetry.throttle;
            point[`${prefix}_brake`] = telemetry.brake;
            point[`${prefix}_tireTempFL`] = telemetry.tireTempFL;
            point[`${prefix}_tireTempFR`] = telemetry.tireTempFR;
            point[`${prefix}_tireTempRL`] = telemetry.tireTempRL;
            point[`${prefix}_tireTempRR`] = telemetry.tireTempRR;
          }
        });

      normalized.push(point);
    }

    return normalized;
  };

  const data = normalizeData();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-slate-900/50 border border-cyan-400/30 rounded-xl backdrop-blur-md">
        <p className="text-slate-400">랩을 시작하면 데이터가 표시됩니다...</p>
      </div>
    );
  }

  const renderSpeedChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="index"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          label={{
            value: "샘플 포인트",
            position: "insideBottom",
            offset: -5,
            fill: "#94a3b8",
          }}
        />
        <YAxis
          yAxisId="left"
          stroke="#00ffff"
          tick={{ fill: "#00ffff", fontSize: 11 }}
          label={{
            value: "km/h",
            angle: -90,
            position: "insideLeft",
            fill: "#00ffff",
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#ff00ff"
          tick={{ fill: "#ff00ff", fontSize: 11 }}
          label={{
            value: "RPM",
            angle: 90,
            position: "insideRight",
            fill: "#ff00ff",
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />

        {/* 현재 랩 */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="current_speed"
          stroke={LAP_COLORS[0]}
          strokeWidth={3}
          dot={false}
          name="현재 랩 (속도)"
          isAnimationActive={false}
        />

        {/* 이전 랩들 */}
        {previousLaps
          .filter((lap) => selectedLapNumbers.includes(lap.lapNumber))
          .map((lap, idx) => (
            <Line
              key={`lap${lap.lapNumber}`}
              yAxisId="left"
              type="monotone"
              dataKey={`lap${lap.lapNumber}_speed`}
              stroke={LAP_COLORS[(idx + 1) % LAP_COLORS.length]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name={`랩 ${lap.lapNumber} (${
                lap.lapTime ? (lap.lapTime / 1000).toFixed(2) + "s" : "진행중"
              })`}
              isAnimationActive={false}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderInputChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="index"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          label={{
            value: "샘플 포인트",
            position: "insideBottom",
            offset: -5,
            fill: "#94a3b8",
          }}
        />
        <YAxis
          stroke="#00ffff"
          tick={{ fill: "#00ffff", fontSize: 11 }}
          label={{
            value: "%",
            angle: -90,
            position: "insideLeft",
            fill: "#00ffff",
          }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />

        {/* 현재 랩 - 스로틀 */}
        <Line
          type="monotone"
          dataKey="current_throttle"
          stroke="#00ff00"
          strokeWidth={2}
          dot={false}
          name="현재 랩 (스로틀)"
          isAnimationActive={false}
        />

        {/* 현재 랩 - 브레이크 */}
        <Line
          type="monotone"
          dataKey="current_brake"
          stroke="#ff0000"
          strokeWidth={2}
          dot={false}
          name="현재 랩 (브레이크)"
          isAnimationActive={false}
        />

        {/* 선택된 랩들의 스로틀/브레이크 */}
        {previousLaps
          .filter((lap) => selectedLapNumbers.includes(lap.lapNumber))
          .map((lap, idx) => (
            <Line
              key={`lap${lap.lapNumber}_throttle`}
              type="monotone"
              dataKey={`lap${lap.lapNumber}_throttle`}
              stroke={LAP_COLORS[(idx + 1) % LAP_COLORS.length]}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name={`랩 ${lap.lapNumber} 스로틀`}
              isAnimationActive={false}
              opacity={0.6}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderTireChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="index"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          label={{
            value: "샘플 포인트",
            position: "insideBottom",
            offset: -5,
            fill: "#94a3b8",
          }}
        />
        <YAxis
          stroke="#00ffff"
          tick={{ fill: "#00ffff", fontSize: 11 }}
          label={{
            value: "°C",
            angle: -90,
            position: "insideLeft",
            fill: "#00ffff",
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />

        {/* 현재 랩 타이어 */}
        <Line
          type="monotone"
          dataKey="current_tireTempFL"
          stroke="#ff6b6b"
          strokeWidth={2}
          dot={false}
          name="현재 앞좌"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="current_tireTempFR"
          stroke="#4ecdc4"
          strokeWidth={2}
          dot={false}
          name="현재 앞우"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="current_tireTempRL"
          stroke="#ffe66d"
          strokeWidth={2}
          dot={false}
          name="현재 뒤좌"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="current_tireTempRR"
          stroke="#a8e6cf"
          strokeWidth={2}
          dot={false}
          name="현재 뒤우"
          isAnimationActive={false}
        />

        {/* 선택된 랩의 타이어 (평균만 표시) */}
        {previousLaps
          .filter((lap) => selectedLapNumbers.includes(lap.lapNumber))
          .map((lap, idx) => (
            <Line
              key={`lap${lap.lapNumber}_tire`}
              type="monotone"
              dataKey={`lap${lap.lapNumber}_tireTempFL`}
              stroke={LAP_COLORS[(idx + 1) % LAP_COLORS.length]}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name={`랩 ${lap.lapNumber} 타이어`}
              isAnimationActive={false}
              opacity={0.5}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-slate-900/50 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md">
      {type === "speed" && renderSpeedChart()}
      {type === "input" && renderInputChart()}
      {type === "tire" && renderTireChart()}
    </div>
  );
}
