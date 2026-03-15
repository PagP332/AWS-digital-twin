import { createAlert, predictData } from "@/api/utils.mjs";

export async function handlePredictData(payload, stationID) {
  // Sample request:
  // {
  //     "temperature": 29,
  //     "humidity": 56,
  //     "pressure": 1005.4,
  //     "windSpeed": 0,
  //     "windDirection": 278,
  //     "precipitation": 0
  // }
  // console.log(payload);
  const errorValue = 999999;
  try {
    const formattedPayload = {
      temperature:
        typeof payload.find((item) => item.data === "Temperature").value ===
        "number"
          ? payload.find((item) => item.data === "Temperature").value
          : errorValue,
      humidity:
        typeof payload.find((item) => item.data === "Humidity").value ===
        "number"
          ? payload.find((item) => item.data === "Humidity").value
          : errorValue,
      pressure:
        typeof payload.find((item) => item.data === "Pressure").value ===
        "number"
          ? payload.find((item) => item.data === "Pressure").value
          : errorValue,
      windSpeed:
        typeof payload.find((item) => item.data === "Wind Speed").value ===
        "number"
          ? payload.find((item) => item.data === "Wind Speed").value
          : errorValue,
      windDirection:
        typeof payload.find((item) => item.data === "Wind Direction").value ===
          "string" ||
        payload.find((item) => item.data === "Wind Direction").value ===
          "number"
          ? Number(payload.find((item) => item.data === "Wind Direction").value)
          : errorValue,
      precipitation:
        typeof payload.find((item) => item.data === "Precipitation").value ===
        "number"
          ? payload.find((item) => item.data === "Precipitation").value
          : errorValue,
    };

    const res = await predictData(formattedPayload);
    if (res.status !== 200) {
      console.error("Predict data request failed with status: ", res.status);
      return null;
    }

    // console.log(request);
    const { code, label, request } = res.data;
    const latestTime = await latestDateTime(payload);

    if (code === 1 && label === "normal") {
      return null; // Continue normal operation
    }

    if (code === -1 && label === "anomaly") {
      console.log(
        "Abnormal behaviour detected in station ",
        stationID,
        " at ",
        latestTime,
      );
      createAlert(stationID, label, latestTime, request);
    }
  } catch (e) {
    console.error("Failed to predict data: ", e);
    return null;
  }
}

export async function generateUUID(timestamp, stationID) {
  const iso = new Date(timestamp).toISOString(); // normalize
  const input = `${stationID}|${iso}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  let hash;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    hash = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  } else {
    const { createHash } = await import("crypto");
    hash = Uint8Array.from(
      createHash("sha256").update(Buffer.from(data)).digest(),
    );
  }

  const b = hash.slice(0, 16);
  b[6] = (b[6] & 0x0f) | 0x50; // set version 5 (0b0101xxxx)
  b[8] = (b[8] & 0x3f) | 0x80; // set RFC 4122 variant

  const hex = [...b].map((v) => v.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

export async function latestDateTime(payload) {
  const items = Array.isArray(payload)
    ? payload.filter((i) => typeof i?.datetime === "string")
    : [];

  if (items.length === 0) return null;

  return items.reduce((latest, item) => {
    const a = new Date(latest.replace(" ", "T"));
    const b = new Date(item.datetime.replace(" ", "T"));
    return b > a ? item.datetime : latest;
  }, items[0].datetime);
}
