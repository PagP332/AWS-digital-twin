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
  limit,
} from "firebase/firestore";

import { db } from "./route";

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

export async function getStationsList() {
  const stationRef = collection(db, "stations");
  const docResponse = await getDocs(stationRef);

  const output = docResponse.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // console.log(output);

  return output;
}

export async function getLatestStationData(stationID) {
  console.log("Fetching latest station data id ", stationID);
  const results = await Promise.all(
    parameters.map(async (parameter) => {
      if (stationID === "001") {
        // If Station is Replica
        const stationRef = collection(db, `stations/${stationID}/${parameter}`);
        const q = query(stationRef, orderBy("dateTime", "desc"), limit(1));
        const docResponse = await getDocs(q);

        const doc = docResponse.docs[0];
        if (!doc) return null;

        return {
          parameter,
          id: doc.id,
          ...doc.data(),
        };
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
    const q = query(stationRef, orderBy("dateTime", "desc"));
    const docResponse = await getDocs(q);
    const data = docResponse.docs.map((doc) => doc.data()).reverse();

    return data;
  } else {
    const stationRef = doc(db, `stations/${stationID}/${parameter}/latestData`);
    const docResponse = await getDoc(stationRef);
    const rawData = docResponse.data();
    const data = rawData?.values
      ? [...rawData.values].sort((a, b) => new Date(a.date) - new Date(b.date))
      : [];

    console.log(data);
    return data;
  }
}
