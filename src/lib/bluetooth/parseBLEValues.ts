/* eslint-disable no-bitwise */
import { CscObjectProps } from "./types";

export function parseCSC(value: DataView): CscObjectProps {
  const flags = value.getUint8(0);
  const hasCrank = !!(flags & 0x02);
  let index = 1;
  const res: CscObjectProps = {
    crankRevs: 0,
    crankTime: 0,
  };

  if (hasCrank) {
    res.crankRevs = value.getUint16(index, true);
    index += 2;
    res.crankTime = value.getUint16(index, true);
    index += 2;
  }
  return res;
}

export function revsToRPM(
  telemetryNew: CscObjectProps,
  telemetryOld: CscObjectProps
): number {
  const deltaRevs = telemetryOld.crankRevs - telemetryNew.crankRevs;
  if (deltaRevs === 0) {
    // no rotation
    return 0;
  }

  let deltaTime = (telemetryOld.crankTime - telemetryNew.crankTime) / 1024;

  if (deltaTime < 0) {
    // time counter wraparound
    deltaTime += 2 ** 16 / 1024;
  }
  deltaTime /= 60; // seconds to minutes

  const rpm = deltaRevs / deltaTime;
  return rpm;
}

interface HeartResults {
  heartRate: number | null;
  contactDetected: boolean;
  energyExpended: number | null;
  rrIntervals: number[] | null;
}

export const parseHeart = (value: DataView): HeartResults => {
  // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
  const flags = value.getUint8(0);
  const rate16Bits = flags & 0x1;
  const result: HeartResults = {
    contactDetected: false,
    energyExpended: null,
    heartRate: null,
    rrIntervals: [],
  };
  let index = 1;
  if (rate16Bits) {
    result.heartRate = value.getUint16(index, /* littleEndian= */ true);
    index += 2;
  } else {
    result.heartRate = value.getUint8(index);
    index += 1;
  }
  const contactDetected = flags & 0x2;
  const contactSensorPresent = flags & 0x4;
  if (contactSensorPresent) {
    result.contactDetected = !!contactDetected;
  }
  const energyPresent = flags & 0x8;
  if (energyPresent) {
    result.energyExpended = value.getUint16(index, /* littleEndian= */ true);
    index += 2;
  }
  const rrIntervalPresent = flags & 0x10;
  if (rrIntervalPresent) {
    const rrIntervals = [];
    for (; index + 1 < value.byteLength; index += 2) {
      rrIntervals.push(value.getUint16(index, /* littleEndian= */ true));
    }
    result.rrIntervals = rrIntervals;
  }
  return result;
};
