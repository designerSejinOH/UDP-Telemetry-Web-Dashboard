export interface TelemetryData {
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  speed: number;
  engineRPM: number;
  fuelLevel: number;
  fuelCapacity: number;
  metersPerSecond: number;
  turboBoost: number;
  oilPressure: number;
  waterTemp: number;
  oilTemp: number;
  tireTemp: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  packetId: number;
  lapCount: number;
  lapsInRace: number;
  bestLapTime: number;
  lastLapTime: number;
  currentGear: number;
  suggestedGear: number;
  throttle: number;
  brake: number;
  throttlePercent: string;
  brakePercent: string;
  suspensionHeight: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  roadPlane: {
    x: number;
    y: number;
    z: number;
    distance: number;
  };
  wheelRevPerSecond: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  tireRadius: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
}
