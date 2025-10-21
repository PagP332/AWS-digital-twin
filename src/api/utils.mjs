import {
  doc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

import { db } from "./initApp";

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
        await addDoc(colRef, { initialized: true });
      }

      console.log(`→ Added subcollections for ${station.site_id}`);
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

  return output;
}

export async function getLatestStationData(stationID) {}
