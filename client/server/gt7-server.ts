import dgram from "dgram";
import { WebSocketServer, WebSocket } from "ws";
import JSSalsa20 from "js-salsa20";
import type { TelemetryData } from "../types/telemetry";

// GT7 Salsa20 키
const SALSA20_KEY = new Uint8Array(
  Buffer.from("Simulator Interface Packet GT7 ver 0.0").slice(0, 32)
);

// PS5 IP 주소
const PS5_IP = process.env.NEXT_PUBLIC_PS5_IP || "192.168.45.104";
const UDP_RECEIVE_PORT = 33740;
const UDP_SEND_PORT = 33739;
const WS_PORT = 8080;

// Salsa20 복호화 (GT7 방식)
function salsa20Decrypt(encrypted: Buffer): Buffer {
  try {
    // IV 계산 (GT7 특수 방식)
    // 0x40 위치에서 4바이트 읽기
    const oiv = encrypted.slice(0x40, 0x44);
    const iv1 = oiv.readUInt32LE(0);

    // XOR with 0xDEADBEAF (주의: DEADBEEF 아님!)
    const iv2 = (iv1 ^ 0xdeadbeaf) >>> 0;

    // 8바이트 IV 생성 (little endian)
    const iv = Buffer.alloc(8);
    iv.writeUInt32LE(iv2, 0);
    iv.writeUInt32LE(iv1, 4);

    // Salsa20 복호화
    const cipher = new JSSalsa20(SALSA20_KEY, new Uint8Array(iv));
    const decrypted = cipher.decrypt(new Uint8Array(encrypted));

    return Buffer.from(decrypted);
  } catch (err) {
    console.error("Salsa20 복호화 에러:", err);
    throw err;
  }
}

// GT7 텔레메트리 파싱
function parseGT7Telemetry(buffer: Buffer): TelemetryData | null {
  try {
    // Magic number 확인 (복호화 후)
    const magic = buffer.readInt32LE(0);
    if (magic !== 0x47375330) {
      // "G7S0"
      console.log(`잘못된 Magic: 0x${magic.toString(16)}`);
      return null;
    }

    const data: Partial<TelemetryData> = {};

    // 위치
    data.position = {
      x: buffer.readFloatLE(0x04),
      y: buffer.readFloatLE(0x08),
      z: buffer.readFloatLE(0x0c),
    };

    // 속도
    data.velocity = {
      x: buffer.readFloatLE(0x10),
      y: buffer.readFloatLE(0x14),
      z: buffer.readFloatLE(0x18),
    };

    // 회전
    data.rotation = {
      pitch: buffer.readFloatLE(0x1c),
      yaw: buffer.readFloatLE(0x20),
      roll: buffer.readFloatLE(0x24),
    };

    // 차량 데이터
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

    // 타이어 온도
    data.tireTemp = {
      frontLeft: buffer.readFloatLE(0x60),
      frontRight: buffer.readFloatLE(0x64),
      rearLeft: buffer.readFloatLE(0x68),
      rearRight: buffer.readFloatLE(0x6c),
    };

    // 패킷 ID
    data.packetId = buffer.readInt32LE(0x70);

    // 랩 정보
    data.lapCount = buffer.readInt16LE(0x74);
    data.lapsInRace = buffer.readInt16LE(0x76);
    data.bestLapTime = buffer.readInt32LE(0x78);
    data.lastLapTime = buffer.readInt32LE(0x7c);

    // 기어 및 입력
    data.currentGear = buffer.readUInt8(0x90) & 0b00001111;
    data.suggestedGear = (buffer.readUInt8(0x90) & 0b11110000) >> 4;
    data.throttle = buffer.readUInt8(0x91);
    data.brake = buffer.readUInt8(0x92);
    data.throttlePercent = ((data.throttle / 255) * 100).toFixed(1);
    data.brakePercent = ((data.brake / 255) * 100).toFixed(1);

    // 서스펜션
    data.suspensionHeight = {
      frontLeft: buffer.readFloatLE(0xb4),
      frontRight: buffer.readFloatLE(0xb8),
      rearLeft: buffer.readFloatLE(0xbc),
      rearRight: buffer.readFloatLE(0xc0),
    };

    // 도로 평면
    data.roadPlane = {
      x: buffer.readFloatLE(0xc4),
      y: buffer.readFloatLE(0xc8),
      z: buffer.readFloatLE(0xcc),
      distance: buffer.readFloatLE(0xd0),
    };

    // 타이어 회전
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

// UDP 서버 생성
const udpServer = dgram.createSocket("udp4");
const clients = new Set<WebSocket>();

// Heartbeat 전송
function sendHeartbeat() {
  const heartbeat = Buffer.from("A");
  udpServer.send(heartbeat, UDP_SEND_PORT, PS5_IP, (err) => {
    if (err) {
      console.error("❌ Heartbeat 전송 실패:", err.message);
    } else {
      console.log(`💓 Heartbeat → ${PS5_IP}:${UDP_SEND_PORT}`);
    }
  });
}

// UDP 메시지 수신
udpServer.on("message", (msg: Buffer, rinfo) => {
  try {
    // Salsa20 복호화
    const decrypted = salsa20Decrypt(msg);

    // 텔레메트리 파싱
    const telemetry = parseGT7Telemetry(decrypted);

    if (telemetry && clients.size > 0) {
      console.log(
        `📊 속도=${telemetry.speed.toFixed(
          1
        )}km/h, RPM=${telemetry.engineRPM.toFixed(0)}, 기어=${
          telemetry.currentGear
        }`
      );

      const jsonData = JSON.stringify(telemetry);

      // WebSocket 클라이언트들에게 전송
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(jsonData);
        }
      });
    }
  } catch (err) {
    // 에러는 조용히 무시 (너무 많은 로그 방지)
  }
});

udpServer.on("listening", () => {
  const address = udpServer.address();
  console.log("\n🏎️  GT7 텔레메트리 서버 시작!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ UDP 수신: ${address?.address}:${address?.port}`);
  console.log(`✅ PS5 타겟: ${PS5_IP}:${UDP_SEND_PORT}`);
  console.log(`✅ WebSocket: 포트 ${WS_PORT}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Heartbeat 시작
  console.log("💓 Heartbeat 전송 시작...\n");
  sendHeartbeat();
  setInterval(sendHeartbeat, 10000); // 10초마다
});

udpServer.on("error", (err: Error) => {
  console.error("❌ UDP 서버 에러:", err);
  udpServer.close();
});

// UDP 서버 시작
udpServer.bind(UDP_RECEIVE_PORT);

// WebSocket 서버
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws: WebSocket) => {
  console.log("🌐 웹 클라이언트 연결됨");
  clients.add(ws);

  ws.on("close", () => {
    console.log("🌐 웹 클라이언트 연결 해제됨");
    clients.delete(ws);
  });
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📱 사용 방법:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("1. 브라우저: http://localhost:3000");
console.log("2. ⚙️ 버튼 → 서버 설정");
console.log("3. 호스트: localhost, 포트: 8080");
console.log("4. GT7에서 타임 어택/레이스 시작!");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 종료 처리
process.on("SIGINT", () => {
  console.log("\n\n서버 종료 중...");
  udpServer.close();
  wss.close();
  process.exit(0);
});
