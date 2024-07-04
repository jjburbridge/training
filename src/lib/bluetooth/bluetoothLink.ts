/* eslint-disable no-console */
import { parseHeart, parseCSC, revsToRPM } from "./parseBLEValues";
import { CscObjectProps } from "./types";

/* ====================================
 *
 * RPM Link
 *
 * =================================== */
let cscDevice: BluetoothDevice;

export const cscLink = async (
  updateCscData: Function,
  updateToggleState: Function,
  setLoadingState: Function
): Promise<void> => {
  let myCharacteristic;
  const serviceUuid = "cycling_speed_and_cadence";
  const characteristicUuid = "csc_measurement";

  let telemetryNew: CscObjectProps;
  let telemetryOld: CscObjectProps;

  // This is the limit we apply to the length of the history array.
  const smoothingValue = 4;
  const history: number[] = [];

  // Called when BLE device is disconnected we re-set the toggle
  const onDisconnected = (): void => {
    console.log("> Bluetooth Device disconnected");
    updateToggleState(false);
  };

  // When we notice a change in data run this
  function handleNotifications(event: Event): void {
    if (telemetryNew) {
      telemetryOld = telemetryNew;
    }
    const { value } = event.target as BluetoothRemoteGATTCharacteristic;
    if (value) {
      telemetryNew = parseCSC(value);
      if (telemetryOld) {
        if (history.length !== smoothingValue) {
          history.push(revsToRPM(telemetryOld, telemetryNew));
        } else {
          history.splice(0, 1).push(revsToRPM(telemetryOld, telemetryNew));
          updateCscData(
            Math.round(history.reduce((a, b) => a + b) / history.length)
          );
        }
      }
    }
  }

  // Async call to the BLE device
  try {
    setLoadingState(true);
    console.log("Requesting Bluetooth Device...");
    // offer the device selection list in the browser
    cscDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUuid] }],
    });
    // bind and event listener for a disconection
    cscDevice.addEventListener("gattserverdisconnected", onDisconnected);

    // Connect to the device

    if (cscDevice.gatt) {
      const server = await cscDevice.gatt.connect();

      // Set up services
      console.log("Getting Service...");
      const service = await server.getPrimaryService(serviceUuid);

      // Get the characteristic of the BLE device we've defined above
      console.log("Getting Characteristic...");
      myCharacteristic = await service.getCharacteristic(characteristicUuid);

      // Start notifications from the BLE device
      await myCharacteristic.startNotifications();
      console.log("> Notifications started");

      // Bind an even listening to pull through the data as it updates
      setLoadingState(false);
      myCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleNotifications
      );
    }
  } catch (error) {
    console.log(`Argh! ${error}`);
    // Reset the toggle
    updateToggleState(false);
    setLoadingState(false);
  }
};

// Function called to disconnect the BLE device
export const CscDisconnect = (): void => {
  if (!cscDevice) {
    return;
  }

  if (cscDevice.gatt) {
    console.log("> Bluetooth Device is already connected");
    cscDevice.gatt.disconnect();
  }
};

/* ====================================
 *
 * Heart Rate Link
 *
 * =================================== */

let heartRateDevice: BluetoothDevice;

export const heartRateLink = async (
  setHeartRate: Function,
  updateToggleState: Function,
  setLoadingState: Function
): Promise<void> => {
  let myCharacteristic;
  const serviceUuid = "heart_rate";
  const characteristicUuid = "heart_rate_measurement";

  // Called when BLE device is disconnected we re-set the toggle
  const onDisconnected = (): void => {
    console.log("> Bluetooth Device disconnected");
    updateToggleState(false);
  };

  // When we notice a change in data run this
  function handleCharacteristicValueChanged(event: Event): void {
    const { value } = event.target as BluetoothRemoteGATTCharacteristic;
    if (value) {
      setHeartRate(parseHeart(value).heartRate);
      console.log(parseHeart(value).heartRate);
    }
  }

  // Async call to the BLE device
  try {
    setLoadingState(true);
    // offer the device selection list in the browser
    heartRateDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      //  filters: [{ services: [serviceUuid] }],
    });
    // bind and event listener for a disconection
    heartRateDevice.addEventListener("gattserverdisconnected", onDisconnected);

    // Connect to the device
    if (heartRateDevice.gatt) {
      const server = await heartRateDevice.gatt.connect();

      // Set up services
      console.log("Getting Service...");
      const service = await server.getPrimaryService(serviceUuid);

      // Get the characteristic of the BLE device we've defined above
      console.log("Getting Characteristic...");
      myCharacteristic = await service.getCharacteristic(characteristicUuid);

      // Start notifications from the BLE device
      await myCharacteristic.startNotifications();
      console.log("> Notifications started");

      // Bind an even listening to pull through the data as it updates
      setLoadingState(false);
      myCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );
    }
  } catch (error) {
    // Reset the toggle
    console.log(`Argh! ${error}`);
    updateToggleState(false);
    setLoadingState(false);
  }
};

// Function called to disconnect the BLE device
export const HRDisconnect = (): void => {
  if (!heartRateDevice) {
    return;
  }

  if (heartRateDevice.gatt) {
    console.log("> Bluetooth Device is already connected");
    heartRateDevice.gatt.disconnect();
  }
};

/* ====================================
 *
 * Cycling Power
 *
 * =================================== */

let cyclingPowerDevice: BluetoothDevice;
interface Power {
  power: number;
}

export const cyclingPowerLink = async (
  setPower: Function,
  setPowerHistory: Function,
  updateToggleState: Function,
  setLoadingState: Function
): Promise<void> => {
  let myCharacteristic;
  const serviceUuid = "cycling_power";
  const characteristicUuid = "cycling_power_measurement";
  // The power graph seems to only accept the number of value we initiate
  // it with so we set this to 10
  const history: Power[] = [
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
    { power: 0 },
  ];
  // Called when BLE device is disconnected we re-set the toggle
  const onDisconnected = (): void => {
    console.log("> Bluetooth Device disconnected");
    updateToggleState(false);
  };

  // When we notice a change in data run this
  function handleCharacteristicValueChanged(event: Event): void {
    const { value } = event.target as BluetoothRemoteGATTCharacteristic;
    const index = 1;
    if (value) {
      const power: number = value.getInt16(index);

      setPower(power);

      if (history) {
        history.push({ power });
        setPowerHistory(history.slice(Math.max(history.length - 10, 1)));
      }
    }
  }

  // Async call to the BLE device
  try {
    setLoadingState(true);
    // offer the device selection list in the browser
    cyclingPowerDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUuid] }],
    });
    // bind and event listener for a disconection
    cyclingPowerDevice.addEventListener(
      "gattserverdisconnected",
      onDisconnected
    );

    // Connect to the device
    if (cyclingPowerDevice.gatt) {
      const server = await cyclingPowerDevice.gatt.connect();

      // Set up services
      console.log("Getting Service...");
      const service = await server.getPrimaryService(serviceUuid);

      // Get the characteristic of the BLE device we've defined above
      console.log("Getting Characteristic...");
      myCharacteristic = await service.getCharacteristic(characteristicUuid);

      // Start notifications from the BLE device
      await myCharacteristic.startNotifications();
      console.log("> Notifications started");

      // Bind an even listening to pull through the data as it updates
      setLoadingState(false);
      myCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );
    }
  } catch (error) {
    // Reset the toggle
    console.log(`Argh! ${error}`);
    updateToggleState(false);
    setLoadingState(false);
  }
};

// Function called to disconnect the BLE device
export const powerDisconnect = (): void => {
  if (!cyclingPowerDevice) {
    return;
  }
  if (cyclingPowerDevice.gatt) {
    console.log("> Bluetooth Device is already connected");
    cyclingPowerDevice.gatt.disconnect();
  }
};
