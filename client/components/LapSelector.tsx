"use client";

import { motion } from "motion/react";
import type { LapSession } from "@/types/lap-data";

interface LapSelectorProps {
  currentSession: LapSession | null;
  selectedLaps: number[];
  onToggleLap: (lapNumber: number) => void;
  onStartSession: () => void;
  onEndSession: () => void;
  isRecording: boolean;
  autoRecording: boolean;
  onToggleAutoRecording: () => void;
  currentLapDataCount?: number; // 현재 수집 중인 데이터 포인트 수
}

export function LapSelector({
  currentSession,
  selectedLaps,
  onToggleLap,
  onStartSession,
  onEndSession,
  isRecording,
  autoRecording,
  onToggleAutoRecording,
  currentLapDataCount = 0,
}: LapSelectorProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}.${Math.floor(milliseconds / 10)
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-cyan-400">🏁 랩 기록</h3>

        <div className="flex gap-2">
          {/* 자동 기록 토글 */}
          <button
            onClick={onToggleAutoRecording}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-colors text-sm flex items-center gap-2
              ${
                autoRecording
                  ? "bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30"
                  : "bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600"
              }
            `}
            title={
              autoRecording
                ? "자동 기록 켜짐 (GT7 시작 시 자동)"
                : "자동 기록 꺼짐 (수동으로 시작)"
            }
          >
            {autoRecording ? "🤖 자동" : "✋ 수동"}
          </button>

          {!isRecording ? (
            <button
              onClick={onStartSession}
              disabled={autoRecording}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-colors text-sm
                ${
                  autoRecording
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }
              `}
              title={
                autoRecording
                  ? "자동 모드에서는 수동 시작 불필요"
                  : "수동으로 기록 시작"
              }
            >
              📹 기록 시작
            </button>
          ) : (
            <button
              onClick={onEndSession}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors text-sm"
            >
              ⏹️ 기록 중지
            </button>
          )}
        </div>
      </div>

      {/* 자동 기록 모드 설명 */}
      {autoRecording && !isRecording && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm flex items-center gap-2">
            <span>🤖</span>
            <span>
              자동 기록 모드: GT7에서 랩을 시작하면 자동으로 기록됩니다
            </span>
          </p>
        </div>
      )}

      {isRecording && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold">기록 중...</span>
            {currentSession && (
              <span className="text-slate-400 text-sm ml-auto">
                현재 랩: {currentSession.currentLap} | 데이터:{" "}
                {currentLapDataCount}개
              </span>
            )}
          </div>
          {currentLapDataCount === 0 && (
            <p className="text-yellow-400 text-xs mt-2">
              ⚠️ 데이터가 수집되지 않고 있습니다. GT7에서 주행 중인지
              확인하세요.
            </p>
          )}
        </div>
      )}

      {currentSession && currentSession.laps.length > 0 && (
        <div>
          <p className="text-slate-300 mb-3 text-sm">
            비교할 랩을 선택하세요 (최대 3개)
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {currentSession.laps.map((lap) => {
              const isSelected = selectedLaps.includes(lap.lapNumber);
              const canSelect = selectedLaps.length < 3 || isSelected;

              return (
                <motion.button
                  key={lap.lapNumber}
                  onClick={() => canSelect && onToggleLap(lap.lapNumber)}
                  disabled={!canSelect}
                  className={`
                    w-full p-3 rounded-lg border transition-all text-left
                    ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-400/20"
                        : canSelect
                        ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                        : "bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed"
                    }
                  `}
                  whileHover={canSelect ? { scale: 1.02 } : {}}
                  whileTap={canSelect ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                        w-6 h-6 rounded border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-400"
                            : "border-slate-600"
                        }
                      `}
                      >
                        {isSelected && (
                          <span className="text-slate-900 text-sm">✓</span>
                        )}
                      </div>

                      <div>
                        <div className="font-semibold text-white">
                          랩 {lap.lapNumber}
                        </div>
                        <div className="text-sm text-slate-400">
                          {lap.lapTime && formatTime(lap.lapTime)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-cyan-400 font-semibold">
                        {lap.bestSpeed.toFixed(1)} km/h
                      </div>
                      <div className="text-xs text-slate-500">최고 속도</div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex gap-4 text-xs text-slate-400">
                    <span>평균: {lap.avgSpeed.toFixed(1)} km/h</span>
                    <span>포인트: {lap.telemetryPoints.length}개</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {selectedLaps.length === 3 && (
            <p className="mt-3 text-xs text-yellow-400/80">
              ⚠️ 최대 3개 랩까지 비교 가능합니다
            </p>
          )}
        </div>
      )}

      {currentSession && currentSession.laps.length === 0 && isRecording && (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm">
            첫 번째 랩을 완주하면 기록이 저장됩니다...
          </p>
        </div>
      )}
    </motion.div>
  );
}
