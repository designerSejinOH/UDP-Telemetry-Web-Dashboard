import { useState, useEffect, useRef, useCallback } from "react";
import type { TelemetryData } from "@/types/telemetry";
import type { LapData, TelemetryPoint, LapSession } from "@/types/lap-data";

const STORAGE_KEY = "gt7-lap-sessions";
const SAMPLE_RATE = 100; // 100ms마다 샘플링 (1초에 10개 포인트)

// localStorage에서 세션 로드 (lazy initialization)
const loadSessions = (): LapSession[] => {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error("세션 로드 실패:", err);
      return [];
    }
  }
  return [];
};

export function useLapRecording() {
  const [sessions, setSessions] = useState<LapSession[]>(loadSessions); // lazy initialization
  const [currentSession, setCurrentSession] = useState<LapSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLaps, setSelectedLaps] = useState<number[]>([]); // 비교할 랩 선택
  const [currentLapData, setCurrentLapData] = useState<TelemetryPoint[]>([]); // state로 변경
  const [autoRecording, setAutoRecording] = useState(true); // 자동 기록 모드 (기본값: true)

  const lastLapNumberRef = useRef<number>(0);
  const currentLapStartRef = useRef<number>(0);
  const currentLapDataRef = useRef<TelemetryPoint[]>([]);
  const lastSampleTimeRef = useRef<number>(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeedRef = useRef<number>(0);

  // 세션 저장 (localStorage에서 로드하는 useEffect 제거)
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // 새 세션 시작
  const startNewSession = useCallback(() => {
    const newSession: LapSession = {
      sessionId: `session-${Date.now()}`,
      startDate: Date.now(),
      laps: [],
      currentLap: 0,
    };
    setCurrentSession(newSession);
    setIsRecording(true);
    lastLapNumberRef.current = 0;
    currentLapStartRef.current = Date.now();
    currentLapDataRef.current = [];
    setCurrentLapData([]); // state도 초기화
    setSelectedLaps([]);
    console.log("🏁 새 세션 시작!");
  }, []);

  // 세션 종료
  const endSession = useCallback(() => {
    if (currentSession) {
      setSessions((prev) => [...prev, currentSession]);
      setCurrentSession(null);
      setIsRecording(false);
      console.log("🏁 세션 종료!");
    }
  }, [currentSession]);

  // 텔레메트리 데이터 처리
  const processTelemetry = useCallback(
    (telemetry: TelemetryData) => {
      const now = Date.now();
      const currentLapNumber = telemetry.lapCount;
      const currentSpeed = telemetry.speed;

      // 디버깅: 현재 상태 로그
      if (Math.random() < 0.01) {
        // 1% 확률로 로그 (너무 많은 로그 방지)
        console.log("📊 현재 상태:", {
          lapCount: currentLapNumber,
          lastLap: lastLapNumberRef.current,
          isRecording,
          autoRecording,
          speed: currentSpeed.toFixed(1),
          dataPoints: currentLapDataRef.current.length,
        });
      }

      // 자동 기록 시작 (lapCount > 0이고 아직 기록 중이 아닐 때)
      if (autoRecording && !isRecording && currentLapNumber > 0) {
        console.log(
          "🏁 자동 기록 시작! (랩 감지됨, lapCount:",
          currentLapNumber,
          ")"
        );
        const newSession: LapSession = {
          sessionId: `session-${Date.now()}`,
          startDate: Date.now(),
          laps: [],
          currentLap: currentLapNumber,
        };
        setCurrentSession(newSession);
        setIsRecording(true);
        lastLapNumberRef.current = currentLapNumber; // 현재 랩 번호로 초기화
        currentLapStartRef.current = Date.now();
        currentLapDataRef.current = [];
        setCurrentLapData([]);
        setSelectedLaps([]);
        console.log("✅ 세션 시작, 초기 랩:", currentLapNumber);
      }

      // 자동 기록 종료 감지 (속도가 0이고 일정 시간 지속)
      if (autoRecording && isRecording) {
        if (currentSpeed < 1) {
          // 속도가 0이면 타이머 시작
          if (!idleTimerRef.current) {
            idleTimerRef.current = setTimeout(() => {
              console.log("🏁 자동 기록 종료! (30초간 정지 상태)");
              if (currentSession) {
                setSessions((prev) => [...prev, currentSession]);
                setCurrentSession(null);
                setIsRecording(false);
              }
              idleTimerRef.current = null;
            }, 30000); // 30초
          }
        } else {
          // 속도가 0보다 크면 타이머 취소
          if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
          }
        }
      }

      // 기록 중이 아니면 여기서 종료
      if (!isRecording || !currentSession) {
        lastSpeedRef.current = currentSpeed;
        return;
      }

      // 랩 변경 감지 (현재 랩이 이전보다 크면)
      if (currentLapNumber > lastLapNumberRef.current) {
        const prevLapNumber = lastLapNumberRef.current;
        const lapEndTime = now;
        const lapTime = lapEndTime - currentLapStartRef.current;

        console.log(
          `🏁 랩 ${prevLapNumber} 완주 감지! (새 랩: ${currentLapNumber})`
        );

        // 데이터 포인트가 있을 때만 저장
        if (currentLapDataRef.current.length > 0) {
          const lapData: LapData = {
            lapNumber: prevLapNumber,
            startTime: currentLapStartRef.current,
            endTime: lapEndTime,
            lapTime: lapTime,
            telemetryPoints: [...currentLapDataRef.current],
            bestSpeed: Math.max(
              ...currentLapDataRef.current.map((p) => p.speed)
            ),
            avgSpeed:
              currentLapDataRef.current.reduce((sum, p) => sum + p.speed, 0) /
              currentLapDataRef.current.length,
          };

          // 세션에 랩 추가
          setCurrentSession((prev) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              laps: [...prev.laps, lapData],
              currentLap: currentLapNumber,
            };
            console.log("💾 세션 업데이트:", {
              totalLaps: updated.laps.length,
              newLap: lapData.lapNumber,
              lapTime: (lapData.lapTime! / 1000).toFixed(2) + "s",
              points: lapData.telemetryPoints.length,
            });
            return updated;
          });

          console.log(
            `✅ 랩 ${prevLapNumber} 저장 완료! (${(lapTime / 1000).toFixed(
              2
            )}초, ${currentLapDataRef.current.length}개 포인트)`
          );
        } else {
          console.log(`⚠️ 랩 ${prevLapNumber} 데이터 없음 (스킵)`);
        }

        // 새 랩 시작
        currentLapStartRef.current = now;
        currentLapDataRef.current = [];
        setCurrentLapData([]);
        lastSampleTimeRef.current = 0;
        console.log(`🏁 랩 ${currentLapNumber} 시작!`);
      }

      lastLapNumberRef.current = currentLapNumber;
      lastSpeedRef.current = currentSpeed;

      // 샘플링 (100ms마다)
      if (now - lastSampleTimeRef.current >= SAMPLE_RATE) {
        const point: TelemetryPoint = {
          timestamp: now - currentLapStartRef.current,
          speed: telemetry.speed,
          rpm: telemetry.engineRPM,
          throttle: parseFloat(telemetry.throttlePercent),
          brake: parseFloat(telemetry.brakePercent),
          gear: telemetry.currentGear,
          tireTempFL: telemetry.tireTemp.frontLeft,
          tireTempFR: telemetry.tireTemp.frontRight,
          tireTempRL: telemetry.tireTemp.rearLeft,
          tireTempRR: telemetry.tireTemp.rearRight,
          position: {
            x: telemetry.position.x,
            y: telemetry.position.y,
            z: telemetry.position.z,
          },
        };

        currentLapDataRef.current.push(point);
        setCurrentLapData((prev) => [...prev, point]);
        lastSampleTimeRef.current = now;
      }
    },
    [isRecording, currentSession, autoRecording]
  );

  // 랩 선택 토글
  const toggleLapSelection = useCallback((lapNumber: number) => {
    setSelectedLaps((prev) => {
      if (prev.includes(lapNumber)) {
        return prev.filter((n) => n !== lapNumber);
      } else {
        return [...prev, lapNumber];
      }
    });
  }, []);

  // 자동 기록 토글
  const toggleAutoRecording = useCallback(() => {
    setAutoRecording((prev) => !prev);
  }, []);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // 모든 세션 삭제
  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSession(null);
    setIsRecording(false);
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ 모든 세션 삭제됨");
  }, []);

  // 특정 세션 삭제
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  }, []);

  return {
    // 상태
    sessions,
    currentSession,
    isRecording,
    selectedLaps,
    currentLapData, // state 반환 (ref 대신)
    autoRecording,

    // 함수
    startNewSession,
    endSession,
    processTelemetry,
    toggleLapSelection,
    toggleAutoRecording,
    clearAllSessions,
    deleteSession,
  };
}
