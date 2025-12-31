"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  CircularGauge,
  GearDisplay,
  TireTemps,
  InputBars,
  LapInfo,
  EngineInfo,
  FuelInfo,
  PositionInfo,
  TelemetryChart,
  LapComparisonChart,
  LapSelector,
  TrackMap,
  ChartDataPoint,
} from "@/components";
import { useLapRecording } from "@/hooks/useLapRecording";
import type { TelemetryData } from "@/types/telemetry";

export default function Dashboard() {
  const [connected, setConnected] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // 차트 데이터 (최근 100개 포인트)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const startTimeRef = useRef<number>(null);

  // 랩 기록 기능
  const {
    currentSession,
    isRecording,
    selectedLaps,
    currentLapData,
    autoRecording,
    startNewSession,
    endSession,
    processTelemetry,
    toggleLapSelection,
    toggleAutoRecording,
  } = useLapRecording();

  // 서버와 클라이언트 모두 동일한 초기값 사용
  const [serverHost, setServerHost] = useState<string>(
    process.env.NEXT_PUBLIC_WS_HOST || "localhost"
  );
  const [serverPort, setServerPort] = useState<string>(
    process.env.NEXT_PUBLIC_WS_PORT || "8080"
  );

  const wsRef = useRef<WebSocket | null>(null);

  // Hydration 완료 후 localStorage에서 설정 불러오기
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const savedHost = localStorage.getItem("gt7-server-host");
    const savedPort = localStorage.getItem("gt7-server-port");

    if (savedHost) setServerHost(savedHost);
    if (savedPort) setServerPort(savedPort);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Hydration 완료될 때까지 대기

    const connectWebSocket = () => {
      const wsUrl = `ws://${serverHost}:${serverPort}`;
      console.log("연결 시도:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket 연결됨");
        setConnected(true);
        startTimeRef.current = Date.now(); // 연결 시 타이머 리셋
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TelemetryData;
          setTelemetry(data);

          // 랩 기록 처리
          processTelemetry(data);

          // 차트 데이터 추가 (0.5초마다 샘플링)
          const elapsedSeconds = startTimeRef.current
            ? (Date.now() - startTimeRef.current) / 1000
            : 0;
          setChartData((prev) => {
            const newPoint: ChartDataPoint = {
              time: Math.floor(elapsedSeconds),
              speed: data.speed,
              rpm: data.engineRPM,
              throttle: parseFloat(data.throttlePercent),
              brake: parseFloat(data.brakePercent),
              tireTempFL: data.tireTemp.frontLeft,
              tireTempFR: data.tireTemp.frontRight,
              tireTempRL: data.tireTemp.rearLeft,
              tireTempRR: data.tireTemp.rearRight,
            };
            const updated = [...prev, newPoint];
            // 최근 100개만 유지 (약 50초 분량)
            return updated.slice(-100);
          });
        } catch (err) {
          console.error("데이터 파싱 에러:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket 연결 해제됨");
        setConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket 에러:", error);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [serverHost, serverPort, mounted]);

  const handleSaveSettings = () => {
    localStorage.setItem("gt7-server-host", serverHost);
    localStorage.setItem("gt7-server-port", serverPort);
    setShowSettings(false);
    // WebSocket 재연결
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const speed = telemetry?.speed ?? 0;
  const rpm = telemetry?.engineRPM ?? 0;
  const gear = telemetry?.currentGear ?? 0;
  const throttle = parseFloat(telemetry?.throttlePercent ?? "0");
  const brake = parseFloat(telemetry?.brakePercent ?? "0");

  return (
    <div className="min-h-screen p-5 relative z-10">
      {/* 설정 버튼 */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-5 right-5 z-50 bg-slate-900/90 border border-cyan-400/50 rounded-lg p-3 hover:border-cyan-400 transition-all"
        style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" }}
      >
        ⚙️ 서버 설정
      </button>

      {/* 설정 모달 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-slate-900 border-2 border-cyan-400 rounded-xl p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: "0 0 40px rgba(0, 255, 255, 0.5)" }}
            >
              <h2 className="text-2xl font-bold mb-6 font-[family-name:'Orbitron'] text-cyan-400">
                서버 설정
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    서버 호스트 (IP 주소)
                  </label>
                  <input
                    type="text"
                    value={serverHost}
                    onChange={(e) => setServerHost(e.target.value)}
                    placeholder="localhost 또는 192.168.0.100"
                    className="w-full bg-slate-800 border border-cyan-400/30 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    서버 포트
                  </label>
                  <input
                    type="text"
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    placeholder="8080"
                    className="w-full bg-slate-800 border border-cyan-400/30 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="bg-cyan-950/30 border border-cyan-400/30 rounded-lg p-4 text-sm">
                  <p className="text-cyan-400 font-semibold mb-2">💡 팁:</p>
                  <ul className="text-gray-300 space-y-1">
                    <li>
                      • 같은 컴퓨터:{" "}
                      <code className="bg-slate-800 px-1 rounded">
                        localhost
                      </code>
                    </li>
                    <li>• 다른 컴퓨터: 서버 컴퓨터의 IP 주소 입력</li>
                    <li>
                      • 기본 포트:{" "}
                      <code className="bg-slate-800 px-1 rounded">8080</code>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all"
                  style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)" }}
                >
                  저장 및 연결
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-[1fr_400px_1fr] grid-rows-[auto_1fr_auto] gap-5 h-fit">
        {/* Header */}
        <motion.div
          className="col-span-3 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="font-[family-name:'Orbitron'] text-5xl font-black tracking-[0.5rem]"
            style={{
              background: "linear-gradient(90deg, #00ffff, #ff006e, #ffbe0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GT7 TELEMETRY
          </h1>
        </motion.div>

        {/* Status */}
        <motion.div
          className={`col-span-3 text-center p-3 rounded-lg border transition-all ${
            connected
              ? "border-cyan-400 bg-cyan-950/20 backdrop-blur-md"
              : "border-pink-600 bg-pink-950/20 backdrop-blur-md"
          }`}
          style={{
            boxShadow: connected
              ? "0 0 20px rgba(0, 255, 255, 0.5)"
              : "0 0 20px rgba(255, 0, 110, 0.5)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {!mounted ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                ⏳ 초기화 중...
              </motion.span>
            ) : connected ? (
              <motion.span
                key="connected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                🟢 연결됨 - 데이터 수신 중 (ws://{serverHost}:{serverPort})
              </motion.span>
            ) : (
              <motion.span
                key="disconnected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                🔴 연결 해제됨 - ws://{serverHost}:{serverPort} 연결 중...
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Left Panels */}
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <TireTemps
            temps={
              telemetry?.tireTemp ?? {
                frontLeft: 0,
                frontRight: 0,
                rearLeft: 0,
                rearRight: 0,
              }
            }
          />
          <InputBars throttle={throttle} brake={brake} />
          <LapInfo telemetry={telemetry} />
        </motion.div>

        {/* Center Panels - Speed, Gear, RPM */}
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div
            className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
          >
            <CircularGauge
              value={speed}
              max={400}
              color="#00ffff"
              label="KM/H"
            />
          </div>

          <div
            className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
          >
            <GearDisplay gear={gear} />
          </div>

          <div
            className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
          >
            <CircularGauge value={rpm} max={8000} color="#ff006e" label="RPM" />
          </div>
        </motion.div>

        {/* Right Panels */}
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <EngineInfo telemetry={telemetry} />
          <FuelInfo telemetry={telemetry} />
          <PositionInfo telemetry={telemetry} />
        </motion.div>
      </div>

      {/* 차트 섹션 */}
      <motion.div
        className="mt-8 space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {/* 트랙맵 섹션 */}
        {isRecording && currentLapData.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              🗺️ 트랙맵 (실시간)
            </h2>
            <TrackMap
              currentLapData={currentLapData}
              previousLaps={
                currentSession?.laps
                  .filter((lap) => selectedLaps.includes(lap.lapNumber))
                  .map((lap) => ({
                    lapNumber: lap.lapNumber,
                    data: lap.telemetryPoints,
                  })) || []
              }
              width={800}
              height={600}
            />
            {selectedLaps.length > 0 && (
              <p className="text-sm text-slate-400 text-center">
                현재 랩(실선)과 선택된 랩들(점선)을 비교하세요. 색상은 속도를
                나타냅니다.
              </p>
            )}
          </div>
        )}

        {/* 랩 기록 섹션 */}
        <LapSelector
          currentSession={currentSession}
          selectedLaps={selectedLaps}
          onToggleLap={toggleLapSelection}
          onStartSession={startNewSession}
          onEndSession={endSession}
          isRecording={isRecording}
          autoRecording={autoRecording}
          onToggleAutoRecording={toggleAutoRecording}
          currentLapDataCount={currentLapData.length}
        />

        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          실시간 텔레메트리
        </h2>

        <div className="space-y-6">
          {/* 속도 & RPM 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-3">
              속도 & RPM
            </h3>
            <TelemetryChart data={chartData} type="speed" />
          </div>

          {/* 스로틀 & 브레이크 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-3">입력</h3>
            <TelemetryChart data={chartData} type="input" />
          </div>

          {/* 타이어 온도 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-3">
              타이어 온도
            </h3>
            <TelemetryChart data={chartData} type="tire" />
          </div>
        </div>
      </motion.div>

      {/* 랩 비교 섹션 */}
      {isRecording && currentSession && currentSession.laps.length > 0 && (
        <motion.div
          className="mt-8 space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            👻 랩 비교 (고스트)
          </h2>

          {selectedLaps.length > 0 ? (
            <div className="space-y-6">
              {/* 속도 비교 */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-3">
                  속도 비교
                  <span className="text-sm text-slate-500 ml-2">
                    (현재 랩 vs {selectedLaps.map((n) => `랩 ${n}`).join(", ")})
                  </span>
                </h3>
                <LapComparisonChart
                  currentLapData={currentLapData}
                  previousLaps={currentSession.laps}
                  selectedLapNumbers={selectedLaps}
                  type="speed"
                />
              </div>

              {/* 입력 비교 */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-3">
                  입력 비교
                </h3>
                <LapComparisonChart
                  currentLapData={currentLapData}
                  previousLaps={currentSession.laps}
                  selectedLapNumbers={selectedLaps}
                  type="input"
                />
              </div>

              {/* 타이어 온도 비교 */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-3">
                  타이어 온도 비교
                </h3>
                <LapComparisonChart
                  currentLapData={currentLapData}
                  previousLaps={currentSession.laps}
                  selectedLapNumbers={selectedLaps}
                  type="tire"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/50 border border-purple-400/30 rounded-xl text-center">
              <p className="text-slate-400">
                왼쪽 패널에서 비교할 랩을 선택하세요 (최대 3개)
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
