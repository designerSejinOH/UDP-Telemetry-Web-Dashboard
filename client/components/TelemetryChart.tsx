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

export interface ChartDataPoint {
  time: number;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  tireTempFL: number;
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;
}

interface TelemetryChartProps {
  data: ChartDataPoint[];
  type: "speed" | "input" | "tire";
}

export function TelemetryChart({ data, type }: TelemetryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] bg-slate-900/50 border border-cyan-400/30 rounded-xl backdrop-blur-md">
        <p className="text-slate-400">주행 시작 시 차트가 표시됩니다...</p>
      </div>
    );
  }

  const renderSpeedChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value) => `${value}s`}
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
            fontSize: 12,
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
            fontSize: 12,
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
          formatter={(value: number) => value.toFixed(0)}
          labelFormatter={(label) => `${label}초`}
        />
        <Legend
          wrapperStyle={{ color: "#fff", fontSize: "12px" }}
          iconType="line"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="speed"
          stroke="#00ffff"
          strokeWidth={2}
          dot={false}
          name="속도 (km/h)"
          isAnimationActive={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="rpm"
          stroke="#ff00ff"
          strokeWidth={2}
          dot={false}
          name="RPM"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderInputChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value) => `${value}s`}
        />
        <YAxis
          stroke="#00ffff"
          tick={{ fill: "#00ffff", fontSize: 11 }}
          label={{
            value: "%",
            angle: -90,
            position: "insideLeft",
            fill: "#00ffff",
            fontSize: 12,
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
          formatter={(value: number) => `${value.toFixed(0)}%`}
          labelFormatter={(label) => `${label}초`}
        />
        <Legend
          wrapperStyle={{ color: "#fff", fontSize: "12px" }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="throttle"
          stroke="#00ff00"
          strokeWidth={2}
          dot={false}
          name="스로틀"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="brake"
          stroke="#ff0000"
          strokeWidth={2}
          dot={false}
          name="브레이크"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderTireChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value) => `${value}s`}
        />
        <YAxis
          stroke="#00ffff"
          tick={{ fill: "#00ffff", fontSize: 11 }}
          label={{
            value: "°C",
            angle: -90,
            position: "insideLeft",
            fill: "#00ffff",
            fontSize: 12,
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
          formatter={(value: number) => `${value.toFixed(1)}°C`}
          labelFormatter={(label) => `${label}초`}
        />
        <Legend
          wrapperStyle={{ color: "#fff", fontSize: "12px" }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="tireTempFL"
          stroke="#ff6b6b"
          strokeWidth={2}
          dot={false}
          name="앞 좌"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="tireTempFR"
          stroke="#4ecdc4"
          strokeWidth={2}
          dot={false}
          name="앞 우"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="tireTempRL"
          stroke="#ffe66d"
          strokeWidth={2}
          dot={false}
          name="뒤 좌"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="tireTempRR"
          stroke="#a8e6cf"
          strokeWidth={2}
          dot={false}
          name="뒤 우"
          isAnimationActive={false}
        />
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
