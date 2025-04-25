import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [battery, setBattery] = useState(100);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLat((prev) => prev + (Math.random() - 0.5) * 0.1);
      setLng((prev) => prev + (Math.random() - 0.5) * 0.1);
      setBattery((prev) => Math.max(0, prev - 0.3));
      setSpeed(Math.floor(Math.random() * 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className="py-20 px-6 md:px-20 bg-white fade-in">
      <div className="max-w-4xl mx-auto text-center border border-blue-200 rounded-3xl p-10 shadow-lg bg-gradient-to-br from-white via-blue-50 to-green-50">
        <h2 className="text-4xl font-extrabold mb-10 text-blue-700 flex justify-center gap-3">
          <i className="fas fa-tachometer-alt text-blue-600"></i>
          Vehicle Dashboard
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-gray-800 text-lg font-semibold">
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
            <div className="text-gray-500 text-sm mb-2">Speed</div>
            <div className="text-3xl text-blue-700 font-bold">{speed}</div>
            <div className="text-sm text-gray-500">km/h</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
            <div className="text-gray-500 text-sm mb-2">Battery</div>
            <div className="text-3xl text-green-600 font-bold">{battery.toFixed(0)}</div>
            <div className="text-sm text-gray-500">%</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-gray-500 text-sm mb-2">Latitude</div>
            <div className="text-xl font-medium">{lat.toFixed(4)}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-gray-500 text-sm mb-2">Longitude</div>
            <div className="text-xl font-medium">{lng.toFixed(4)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
