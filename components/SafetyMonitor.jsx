"use client";

import React, { useEffect, useState } from "react";
import "./SafetyMonitor.css";

const geoFence = {
  north: 50,
  south: 40,
  east: -70,
  west: -80,
};

const obstacles = [
  { lat: 45.2, lng: -74.9 },
  { lat: 44.8, lng: -75.1 },
];

export default function SafetyMonitor() {
  const [position, setPosition] = useState({ lat: 45, lng: -75 });
  const [status, setStatus] = useState("System Ready...");
  const [danger, setDanger] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.1,
        lng: prev.lng + (Math.random() - 0.5) * 0.1,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function isOutOfBounds(pos) {
      return (
        pos.lat > geoFence.north ||
        pos.lat < geoFence.south ||
        pos.lng > geoFence.east ||
        pos.lng < geoFence.west
      );
    }

    function detectObstacleNearby(pos, threshold = 0.2) {
      return obstacles.some(
        (ob) =>
          Math.hypot(pos.lat - ob.lat, pos.lng - ob.lng) < threshold
      );
    }

    if (isOutOfBounds(position)) {
      setStatus("🚫 Vehicle out of geo-fence!");
      setDanger(false);
    } else if (detectObstacleNearby(position)) {
      setStatus("⚠️ Obstacle nearby!");
      setDanger(true);
    } else {
      setStatus("✅ All Clear");
      setDanger(false);
    }
  }, [position]);

  return (
    <section id="safety" className="py-20 px-6 md:px-20 fade-in">
      <div
        className={`max-w-3xl mx-auto text-center border-4 rounded-3xl p-10 shadow-xl transition-all duration-500 ${
          danger
            ? "danger-mode border-red-600"
            : "bg-gradient-to-br from-white via-green-50 to-blue-50 border-green-500"
        }`}
      >
        <h2 className="text-4xl font-extrabold mb-6 text-green-700 flex justify-center gap-3">
          <i className="fas fa-shield-alt text-green-600"></i>
          Safety Monitoring System
        </h2>
        <p className="text-gray-600 mb-4">Simulated vehicle tracking with geo-fence and obstacle alerts.</p>
        <div className={`text-2xl mt-4 transition-all duration-500 ${danger ? "danger-text" : "text-green-600 font-semibold"}`}>
          {status}
        </div>
      </div>
    </section>
  );
}
