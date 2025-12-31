export interface TelemetryPoint {
  timestamp: number; // 랩 시작 후 경과 시간 (ms)
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  gear: number;
  tireTempFL: number;
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface LapData {
  lapNumber: number;
  startTime: number; // Date.now()
  endTime: number | null;
  lapTime: number | null; // 밀리초
  telemetryPoints: TelemetryPoint[];
  bestSpeed: number;
  avgSpeed: number;
  trackName?: string;
  carName?: string;
}

export interface LapSession {
  sessionId: string;
  startDate: number;
  laps: LapData[];
  currentLap: number;
}
