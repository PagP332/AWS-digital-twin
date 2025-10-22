import { LineChart } from "@mui/x-charts";
import React from "react";

export default function Graph({ data = [], className, ...props }) {
  // Sort oldest → newest
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.date.replace(" ", "T")) - new Date(b.date.replace(" ", "T")),
  );

  // Convert to Date objects safely
  const xAxisData = sortedData.map((d) => new Date(d.date.replace(" ", "T")));
  const yAxisData = sortedData.map((d) => d.value);

  return (
    <div
      className={`flex h-fit w-fit items-center justify-center ${className}`}
    >
      <LineChart
        xAxis={[{ data: xAxisData, label: "Datetime", scaleType: "time" }]}
        series={[{ data: yAxisData, label: "Value" }]}
        width={800}
        height={400}
      />
    </div>
  );
}
