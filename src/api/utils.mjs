import {
  doc,
  collection,
  query,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  addDoc,
  orderBy,
  where,
  limit,
} from "firebase/firestore";

import { db } from "./route";
import { generateUUID } from "@/utils/predict";

export const parameters = [
  "precipitation",
  "temperature",
  "humidity",
  "pressure",
  "wind-speed",
  "wind-direction",
];

export const testSensorData = [
  {
    data: "Precipitation",
    value: "--",
    unit: " mm",
  },
  {
    data: "Temperature",
    value: 26.8,
    unit: "°",
  },
  {
    data: "Humidity",
    value: 90.5,
    unit: "%",
  },
  {
    data: "Pressure",
    value: 1008.1,
    unit: " mslp",
  },
  {
    data: "Wind Speed",
    value: 0.3,
    unit: " m/s",
  },
  {
    data: "Wind Direction",
    value: "ESE (105.9°)",
    unit: "",
  },
];

export async function populateStations() {
  try {
    const response = await fetch("/stations.json"); // in /public folder
    const stations = await response.json();

    for (const station of stations) {
      const stationRef = doc(db, "stations", station.site_id);

      // 1️⃣ Create main station document
      await setDoc(stationRef, {
        site_name: station.site_name,
        coordinates: station.coordinates,
        location: station.location || "",
      });

      console.log(`Created station: ${station.site_id}`);

      if (station.site_id === "001" || station.site_id === "98") {
        // 2️⃣ Create empty subcollections
        const subcollections = [
          "precipitation",
          "temperature",
          "humidity",
          "pressure",
          "wind-speed",
          "wind-direction",
        ];

        for (const sub of subcollections) {
          const colRef = collection(db, `stations/${station.site_id}/${sub}`);
          await addDoc(colRef, { dateTime: serverTimestamp() });
        }

        console.log(`→ Added subcollections for ${station.site_id}`);
      }
    }

    console.log("✅ All stations populated successfully!");
  } catch (error) {
    console.error("Error populating stations:", error);
  }
}
export async function test(stationId, parameter) {
  console.log(stationId);
  const precipRef = collection(db, `stations/${stationId}/${parameter}`);
  const docResponse = await getDocs(precipRef);

  const docRef = await addDoc(precipRef, {
    value: "01",
    datetime: serverTimestamp(),
  });

  const data = docResponse.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log(docRef.id);
  console.log(data);
}
export async function pushTest() {
  const colRef = collection(db, `stations/001/humidity`);

  const docRef = await addDoc(colRef, {
    value: 123,
    timestamp: serverTimestamp(),
  });

  console.log(docRef);
}

export async function getStationsList() {
  console.log("Fetching stations list...");
  const stationRef = collection(db, "stations");
  const docResponse = await getDocs(stationRef);

  const output = docResponse.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // console.log(output);
  console.log(`Fetched ${output.length} stations`);
  return output;
}

export async function getLatestStationData(stationID) {
  console.log("Fetching latest station data id ", stationID);
  const results = await Promise.all(
    parameters.map(async (parameter) => {
      if (stationID === "001") {
        // If Station is Replica
        const stationRef = collection(db, `stations/${stationID}/${parameter}`);
        const q = query(stationRef, orderBy("timestamp", "desc"), limit(1));
        const docResponse = await getDocs(q);

        const doc = docResponse.docs[0];
        if (!doc) return { parameter };

        if (parameter === "wind-direction") {
          return {
            parameter,
            id: doc.id,
            dateTime: doc.data().timestamp,
            value: `${doc.data().value}`,
          };
        } else {
          return {
            parameter,
            id: doc.id,
            dateTime: doc.data().timestamp,
            value: doc.data().value,
          };
        }
      } else {
        // If Station is PAGASA
        const stationRef = doc(
          db,
          `stations/${stationID}/${parameter}/latestData`,
        );
        const docResponse = await getDoc(stationRef);

        if (!docResponse.exists()) return null;
        const data = docResponse.data();

        const latestEntry = data.values.reduce((latest, current) => {
          return new Date(current.date) > new Date(latest.date)
            ? current
            : latest;
        });

        if (parameter === "wind-direction") {
          return {
            parameter,
            value: `${latestEntry.converted_value} ${latestEntry.value}`,
            dateTime: new Date(latestEntry.date),
            as_of: data.as_of,
          };
        } else {
          return {
            parameter,
            value: latestEntry.value,
            dateTime: new Date(latestEntry.date),
            as_of: data.as_of,
          };
        }
      }
    }),
  );

  // console.log(results);
  if (!results) return null;

  const formatted = [
    {
      data: "Precipitation",
      id: results.find((r) => r.parameter === "precipitation")?.id ?? null,
      value:
        results.find((r) => r.parameter === "precipitation")?.value ?? "--",
      datetime:
        results.find((r) => r.parameter === "precipitation")?.dateTime ?? null,
      unit: " mm",
    },
    {
      data: "Temperature",
      id: results.find((r) => r.parameter === "temperature")?.id ?? null,
      value: results.find((r) => r.parameter === "temperature")?.value ?? "--",
      datetime:
        results.find((r) => r.parameter === "temperature")?.dateTime ?? null,
      unit: "°",
    },
    {
      data: "Humidity",
      id: results.find((r) => r.parameter === "humidity")?.id ?? null,
      value: results.find((r) => r.parameter === "humidity")?.value ?? "--",
      datetime:
        results.find((r) => r.parameter === "humidity")?.dateTime ?? null,
      unit: "%",
    },
    {
      data: "Pressure",
      id: results.find((r) => r.parameter === "pressure")?.id ?? null,
      value: results.find((r) => r.parameter === "pressure")?.value ?? "--",
      datetime:
        results.find((r) => r.parameter === "pressure")?.dateTime ?? null,
      unit: " mslp",
    },
    {
      data: "Wind Speed",
      id: results.find((r) => r.parameter === "wind-speed")?.id ?? null,
      value: results.find((r) => r.parameter === "wind-speed")?.value ?? "--",
      datetime:
        results.find((r) => r.parameter === "wind-speed")?.dateTime ?? null,
      unit: " m/s",
    },
    {
      data: "Wind Direction",
      id: results.find((r) => r.parameter === "wind-direction")?.id ?? null,
      value:
        results.find((r) => r.parameter === "wind-direction")?.value ?? "--",
      datetime:
        results.find((r) => r.parameter === "wind-direction")?.dateTime ?? null,
      unit: "°",
    },
  ];

  console.log(
    `Fetched ${formatted.length} parameters for station ${stationID}`,
  );
  // console.log(formatted);
  return formatted;
}

export async function getParameterData(stationID, parameter) {
  if (!parameters.includes(parameter)) {
    console.error("Invalid parameter");
    return null;
  }

  console.log(`Fetching ${parameter} data of station id ${stationID}`);
  if (stationID === "001") {
    const stationRef = collection(db, `stations/${stationID}/${parameter}`);
    const q = query(stationRef, orderBy("timestamp", "desc"));
    const docResponse = await getDocs(q);
    const data = docResponse.docs.map((doc) => doc.data()).reverse();

    console.log(`Fetched ${data.length} values`);
    return data;
  } else {
    const stationRef = doc(db, `stations/${stationID}/${parameter}/latestData`);
    const docResponse = await getDoc(stationRef);
    const rawData = docResponse.data();
    const data = rawData?.values
      ? [...rawData.values].sort((a, b) => new Date(a.date) - new Date(b.date))
      : [];

    // console.log(data);
    console.log(`Fetched ${data.length} values`);
    return data;
  }
}

export async function modelStatusCheck() {
  try {
    const res = await fetch("http://localhost:8000/health", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Model status request failed:", res.status, text);
      return false;
    } else {
      console.log("Model Status OK");
      return true;
    }
  } catch (err) {
    console.error("Request error:", err);
    return false;
  }
}

export async function predictData(payload) {
  // Sample request:
  // {
  //     "temperature": 29,
  //     "humidity": 56,
  //     "pressure": 1005.4,
  //     "windSpeed": 0,
  //     "windDirection": 278,
  //     "precipitation": 0
  // }

  // Check payload validity
  if (
    payload.temperature === undefined ||
    payload.humidity === undefined ||
    payload.pressure === undefined ||
    payload.windSpeed === undefined ||
    payload.windDirection === undefined ||
    payload.precipitation === undefined
  ) {
    console.error("Invalid payload for prediction");
    return null;
  }

  try {
    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Prediction request failed:", res.status, text);
      return null;
    }

    const body = await res.json();
    console.log("Prediction result:", body);

    return body;
  } catch (err) {
    console.error("Request error:", err);
    return null;
  }
}

export async function getAlertsList(stationID) {
  console.log("Fetching alerts list...");
  const alertsRef = collection(db, "alerts");
  const q = query(
    alertsRef,
    where("station_id", "==", stationID),
    where("resolved", "==", false),
    where("type", "==", "anomaly"),
    orderBy("timestamp", "desc"),
  );
  const res = await getDocs(q);
  const alerts = res.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    };
  });
  console.log(`Fetched ${alerts.length} alerts`);
  return alerts;
}

export async function readAlert(alertID, read) {
  if (read) return;
  else {
    console.log(`Marking alert id ${alertID} as read...`);
    const alertRef = doc(db, `alerts/${alertID}`);
    await setDoc(alertRef, { read: true }, { merge: true });
    console.log(`Alert id ${alertID} marked as read.`);
  }
}

export async function toggleResolveAlert(alertID, resolved) {
  console.log(`Resolving alert id ${alertID}...`);
  const alertRef = doc(db, `alerts/${alertID}`);
  await setDoc(alertRef, { resolved: !resolved }, { merge: true });
  console.log(`Alert id ${alertID} toggled.`);
}

export async function setAlertSensor(alertID, sensor) {
  console.log(`Setting sensor for alert id ${alertID}...`);
  const alertRef = doc(db, `alerts/${alertID}`);
  await setDoc(alertRef, { sensor: sensor }, { merge: true });
  console.log(`Alert id ${alertID} sensor set to ${sensor}.`);
}

export async function createAlert(stationID, type, timestamp, data) {
  // payload example:
  // {
  //   station_id: '001',
  //   type: 'anomaly',
  //   timestamp: "2025-10-25 13:49:01"
  //   data: {
  //     humidity: 85,
  //     temperature: 30,
  //     pressure: 1003.5,
  //     windSpeed: 0,
  //     windDirection: 270,
  //     precipitation: 0
  //   }
  // }
  const uuid = await generateUUID(timestamp, stationID);

  const payload = {
    resolved: false,
    read: false,
    sensor: "",
    station_id: stationID,
    timestamp: String(timestamp),
    type,
    data,
  };

  const alertsRef = doc(db, "alerts", uuid);
  try {
    console.log("Creating alert on ", stationID);
    const docSnap = await getDoc(alertsRef);
    if (docSnap.exists()) {
      console.log("Alert already exists with ID:", uuid);
      return;
    }
    await setDoc(alertsRef, payload);
  } catch (e) {
    console.error("Failed to create alert: ", e);
    return;
  }
  console.log("Alert created with ID:", uuid);
}

export async function diagnoseData(payload) {
  // Sample request:
  // {
  //     "temperature": 29,
  //     "humidity": 56,
  //     "pressure": 1005.4,
  //     "windSpeed": 0,
  //     "windDirection": 278,
  //     "precipitation": 0
  // }

  // Check payload validity
  if (
    payload.temperature === undefined ||
    payload.humidity === undefined ||
    payload.pressure === undefined ||
    payload.windSpeed === undefined ||
    payload.windDirection === undefined ||
    payload.precipitation === undefined
  ) {
    console.error("Invalid payload for prediction");
    return null;
  }
  try {
    const res = await fetch("http://localhost:8000/diagnose", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Prediction request failed:", res.status, text);
      return null;
    }

    const body = await res.json();
    console.log("Diagnosis result:", body);

    return body;
  } catch (err) {
    console.error("Request error:", err);
    return null;
  }
}
