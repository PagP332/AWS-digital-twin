"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import FloatingWindow from "./FloatingWindow";
import { CloudSun } from "lucide-react";
import Button from "./Button";
// import fs from "fs";

export default function Map({ handleSelectStation }) {
  const markers = [
    {
      id: 1,
      position: [14.614, 121.0608],
      stationName: "Science Garden AWS",
      location: "Science Garden, Quezon City",
    },
  ];

  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetch("/stations.json") // file located in /public/aws_stations.json
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((station) => ({
          id: station.site_id,
          position: station.coordinates,
          stationName: station.site_name,
          location: station.location || "Location Not Available",
        }));
        setStations(formatted);
      })
      .catch(console.error);
  }, []);

  const onMarkerView = (id) => {
    console.log("Marker Clicked");
    handleSelectStation(id);
  };

  const MapMarkers = ({ markers }) => {
    return stations.map((marker, idx) => {
      return (
        <Marker key={idx} position={marker.position}>
          <Popup className="relative">
            <div className="absolute bg-background border-1 border-border rounded-xl w-60 p-4 -top-14 left-0 z-100 font-sfpro text-black">
              <div className="space-y-1">
                <div className="flex flex-row items-center gap-2">
                  <CloudSun size={22} />
                  <p className="ml-5 font-medium">{marker.stationName}</p>
                </div>
                <p className="text-xs font-light">
                  {`${marker.position[0]}, ${marker.position[1]}`}
                </p>
                <p className="font-light">{marker.location}</p>
              </div>
              <div className="flex justify-center">
                <Button
                  text="View"
                  onClick={() => onMarkerView(marker.id)}
                  className="!bg-accent"
                />
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <MapContainer
      center={[14.614, 121.0608]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapMarkers markers={markers} />
    </MapContainer>
  );
}
