"use client";

import { useEffect, useRef } from "react";
import type { TelemetryPoint } from "@/types/lap-data";

interface TrackMapProps {
  currentLapData: TelemetryPoint[];
  previousLaps?: { lapNumber: number; data: TelemetryPoint[] }[];
  width?: number;
  height?: number;
}

export function TrackMap({
  currentLapData,
  previousLaps = [],
  width = 800,
  height = 600,
}: TrackMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, width, height);

    // 모든 포지션 데이터 수집
    const allPositions = [
      ...currentLapData.map((p) => p.position),
      ...previousLaps.flatMap((lap) => lap.data.map((p) => p.position)),
    ];

    if (allPositions.length === 0) return;

    // 바운딩 박스 계산 (X, Z 평면 - 위에서 내려다본 뷰)
    const minX = Math.min(...allPositions.map((p) => p.x));
    const maxX = Math.max(...allPositions.map((p) => p.x));
    const minZ = Math.min(...allPositions.map((p) => p.z));
    const maxZ = Math.max(...allPositions.map((p) => p.z));

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;

    // 여백 추가
    const padding = 40;
    const scaleX = (width - 2 * padding) / rangeX;
    const scaleZ = (height - 2 * padding) / rangeZ;

    // 균일한 스케일 사용 (왜곡 방지)
    const scale = Math.min(scaleX, scaleZ);

    // 중앙 정렬을 위한 오프셋
    const offsetX = (width - rangeX * scale) / 2;
    const offsetZ = (height - rangeZ * scale) / 2;

    // 좌표 변환 함수
    const transformX = (x: number) => offsetX + (x - minX) * scale;
    const transformZ = (z: number) => offsetZ + (z - minZ) * scale;

    // 배경 그리드
    ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      // 세로선
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // 가로선
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 이전 랩들 그리기 (반투명)
    previousLaps.forEach((lap, idx) => {
      const colors = ["#ff00ff", "#00ff00", "#ffff00", "#ff6600", "#6600ff"];
      const color = colors[idx % colors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      lap.data.forEach((point, i) => {
        const x = transformX(point.position.x);
        const z = transformZ(point.position.z);
        if (i === 0) {
          ctx.moveTo(x, z);
        } else {
          ctx.lineTo(x, z);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // 시작점 표시
      if (lap.data.length > 0) {
        const start = lap.data[0];
        const x = transformX(start.position.x);
        const z = transformZ(start.position.z);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(x, z, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 현재 랩 그리기 (굵고 밝게)
    if (currentLapData.length > 0) {
      ctx.globalAlpha = 1;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);

      // 속도에 따른 색상 그라디언트
      currentLapData.forEach((point, i) => {
        if (i === 0) return;

        const prevPoint = currentLapData[i - 1];
        const x1 = transformX(prevPoint.position.x);
        const z1 = transformZ(prevPoint.position.z);
        const x2 = transformX(point.position.x);
        const z2 = transformZ(point.position.z);

        // 속도에 따른 색상 (0-300 km/h 기준)
        const speed = point.speed;
        const ratio = Math.min(speed / 300, 1);

        // 파란색(느림) → 빨간색(빠름)
        const r = Math.floor(ratio * 255);
        const g = Math.floor((1 - ratio) * 150);
        const b = Math.floor((1 - ratio) * 255);

        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.moveTo(x1, z1);
        ctx.lineTo(x2, z2);
        ctx.stroke();
      });

      // 시작점 표시 (녹색)
      const start = currentLapData[0];
      const startX = transformX(start.position.x);
      const startZ = transformZ(start.position.z);
      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(startX, startZ, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 현재 위치 표시 (빨간색)
      const current = currentLapData[currentLapData.length - 1];
      const currentX = transformX(current.position.x);
      const currentZ = transformZ(current.position.z);
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(currentX, currentZ, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 현재 속도 표시
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(
        `${current.speed.toFixed(0)} km/h`,
        currentX + 12,
        currentZ + 5
      );
    }

    ctx.globalAlpha = 1;

    // 범례
    const legendX = 10;
    const legendY = height - 80;

    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(legendX, legendY, 200, 70);
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.strokeRect(legendX, legendY, 200, 70);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText("범례:", legendX + 10, legendY + 20);

    // 시작점
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(legendX + 20, legendY + 35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("시작점", legendX + 30, legendY + 38);

    // 현재 위치
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(legendX + 20, legendY + 55, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("현재 위치", legendX + 30, legendY + 58);

    // 속도 표시
    ctx.fillStyle = "#fff";
    ctx.fillText("색상: ", legendX + 110, legendY + 20);
    ctx.fillStyle = "#4444ff";
    ctx.fillText("느림", legendX + 110, legendY + 38);
    ctx.fillStyle = "#ff4444";
    ctx.fillText("빠름", legendX + 110, legendY + 55);
  }, [currentLapData, previousLaps, width, height]);

  return (
    <div className="bg-slate-900/50 border border-cyan-400/30 rounded-xl p-5 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto bg-slate-950 rounded-lg"
        style={{ imageRendering: "crisp-edges" }}
      />

      {currentLapData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-400">
            주행을 시작하면 트랙맵이 표시됩니다...
          </p>
        </div>
      )}
    </div>
  );
}
