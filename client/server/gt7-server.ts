import dgram from "dgram";
import { WebSocketServer, WebSocket } from "ws";
import type { TelemetryData } from "../types/telemetry";

// UDP 서버 설정
const UDP_PORT = 33740; // GT7 기본 포트
const udpServer = dgram.createSocket("udp4");

// WebSocket 서버 설정
const WS_PORT = 8080;
const wss = new WebSocketServer({ port: WS_PORT });

const clients = new Set<WebSocket>();

// WebSocket 연결 관리
wss.on("connection", (ws: WebSocket) => {
  console.log("웹 클라이언트 연결됨");
  clients.add(ws);

  ws.on("close", () => {
    console.log("웹 클라이언트 연결 해제됨");
    clients.delete(ws);
  });
});

// GT7 텔레메트리 데이터 파싱
function parseGT7Telemetry(buffer: Buffer): TelemetryData | null {
  try {
    // GT7 Salsa 프로토콜 파싱
    const data: Partial<TelemetryData> = {};

    // 기본 정보
    data.position = {
      x: buffer.readFloatLE(0x04),
      y: buffer.readFloatLE(0x08),
      z: buffer.readFloatLE(0x0c),
    };

    data.velocity = {
      x: buffer.readFloatLE(0x10),
      y: buffer.readFloatLE(0x14),
      z: buffer.readFloatLE(0x18),
    };

    data.rotation = {
      pitch: buffer.readFloatLE(0x1c),
      yaw: buffer.readFloatLE(0x20),
      roll: buffer.readFloatLE(0x24),
    };

    // 차량 정보
    data.speed =
      Math.sqrt(
        data.velocity.x ** 2 + data.velocity.y ** 2 + data.velocity.z ** 2
      ) * 3.6; // m/s to km/h

    data.engineRPM = buffer.readFloatLE(0x3c);
    data.fuelLevel = buffer.readFloatLE(0x44);
    data.fuelCapacity = buffer.readFloatLE(0x48);
    data.metersPerSecond = buffer.readFloatLE(0x4c);
    data.turboBoost = buffer.readFloatLE(0x50);
    data.oilPressure = buffer.readFloatLE(0x54);
    data.waterTemp = buffer.readFloatLE(0x58);
    data.oilTemp = buffer.readFloatLE(0x5c);

    // 타이어 온도 (섭씨)
    data.tireTemp = {
      frontLeft: buffer.readFloatLE(0x60),
      frontRight: buffer.readFloatLE(0x64),
      rearLeft: buffer.readFloatLE(0x68),
      rearRight: buffer.readFloatLE(0x6c),
    };

    // 패킷 ID
    data.packetId = buffer.readInt32LE(0x70);

    // 랩타임
    data.lapCount = buffer.readInt16LE(0x74);
    data.lapsInRace = buffer.readInt16LE(0x76);

    data.bestLapTime = buffer.readInt32LE(0x78);
    data.lastLapTime = buffer.readInt32LE(0x7c);

    // 현재 위치 관련
    data.currentGear = buffer.readUInt8(0x90) & 0b00001111;
    data.suggestedGear = (buffer.readUInt8(0x90) & 0b11110000) >> 4;

    data.throttle = buffer.readUInt8(0x91);
    data.brake = buffer.readUInt8(0x92);

    // 스로틀/브레이크를 0-100 퍼센트로 변환
    data.throttlePercent = ((data.throttle / 255) * 100).toFixed(1);
    data.brakePercent = ((data.brake / 255) * 100).toFixed(1);

    // 타이어 서스펜션
    data.suspensionHeight = {
      frontLeft: buffer.readFloatLE(0xb4),
      frontRight: buffer.readFloatLE(0xb8),
      rearLeft: buffer.readFloatLE(0xbc),
      rearRight: buffer.readFloatLE(0xc0),
    };

    // 도로 평면 (Road Plane)
    data.roadPlane = {
      x: buffer.readFloatLE(0xc4),
      y: buffer.readFloatLE(0xc8),
      z: buffer.readFloatLE(0xcc),
      distance: buffer.readFloatLE(0xd0),
    };

    // 타이어 회전 속도
    data.wheelRevPerSecond = {
      frontLeft: buffer.readFloatLE(0xd4),
      frontRight: buffer.readFloatLE(0xd8),
      rearLeft: buffer.readFloatLE(0xdc),
      rearRight: buffer.readFloatLE(0xe0),
    };

    // 타이어 반경
    data.tireRadius = {
      frontLeft: buffer.readFloatLE(0xe4),
      frontRight: buffer.readFloatLE(0xe8),
      rearLeft: buffer.readFloatLE(0xec),
      rearRight: buffer.readFloatLE(0xf0),
    };

    return data as TelemetryData;
  } catch (err) {
    console.error("파싱 에러:", err);
    return null;
  }
}

// UDP 메시지 수신
udpServer.on("message", (msg: Buffer) => {
  const telemetry = parseGT7Telemetry(msg);

  if (telemetry && clients.size > 0) {
    const jsonData = JSON.stringify(telemetry);

    // 모든 연결된 웹 클라이언트에게 전송
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(jsonData);
      }
    });
  }
});

udpServer.on("listening", () => {
  const address = udpServer.address();
  console.log(`UDP 서버가 ${address?.address}:${address?.port}에서 대기 중`);
  console.log(`WebSocket 서버가 포트 ${WS_PORT}에서 대기 중`);
  console.log("\nGT7 설정:");
  console.log("1. GT7 메뉴 > 설정 > 네트워크");
  console.log('2. "데이터 로거 출력" 활성화');
  console.log(`3. IP 주소를 이 서버의 IP로 설정`);
  console.log(`4. 포트를 ${UDP_PORT}으로 설정`);
});

udpServer.on("error", (err: Error) => {
  console.error("UDP 서버 에러:", err);
  udpServer.close();
});

// 서버 시작
udpServer.bind(UDP_PORT);
