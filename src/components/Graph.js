import { LineChart } from "@mui/x-charts";
import React from "react";

export default function Graph({ data = [], stationID, className, ...props }) {
  // console.log(data);
  // Helper: safely parse and validate timestamps

  const parseTimestamp = (t) => {
    if (!t || typeof t !== "string") return null;
    const normalized = t.includes("T") ? t : t.replace(" ", "T");
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return null;

    // 🔥 Filter out literal 1970 timestamps (epoch time or default 0)
    if (date.getFullYear() === 1970) return null;

    return date;
  };

  // Choose correct field depending on station
  const dateField = stationID === "001" ? "timestamp" : "date";

  // Clean, filter, and sort data
  const cleanedData = data
    .map((item) => {
      const dateObj = parseTimestamp(item[dateField]);
      return dateObj ? { date: dateObj, value: item.value } : null;
    })
    .filter(Boolean) // remove null (invalid timestamp) entries
    .sort((a, b) => a.date - b.date); // oldest → newest

  // Extract x and y data for the chart
  const xAxisData = cleanedData.map((d) => d.date);
  const yAxisData = cleanedData.map((d) => d.value);

  const yMinData = yAxisData.length ? Math.min(...yAxisData) : 0;
  const yMaxData = yAxisData.length ? Math.max(...yAxisData) : 1;
  const span = yMaxData - yMinData;
  const center = (yMinData + yMaxData) / 2;

  // Tune these to match your preferred "flatness"
  const minVisualSpan = 10; // force at least 10 units total height
  const padPct = 0.08; // 8% top/bottom padding for normal ranges

  let yMin;
  let yMax;

  if (span < minVisualSpan) {
    // Near-equal values: center and widen to avoid exaggerated wiggles
    yMin = center - minVisualSpan / 2;
    yMax = center + minVisualSpan / 2;
  } else {
    // Real large variation (including spikes): keep natural scale + small padding
    const pad = span * padPct;
    yMin = yMinData - pad;
    yMax = yMaxData + pad;
  }

  return (
    <div
      className={`flex h-fit w-fit items-center justify-center ${className}`}
    >
      <LineChart
        xAxis={[{ data: xAxisData, label: "Datetime", scaleType: "time" }]}
        yAxis={[{ min: yMin, max: yMax }]}
        series={[{ data: yAxisData, label: "Value", color: "#514fbc" }]}
        width={800}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />
    </div>
  );
}
