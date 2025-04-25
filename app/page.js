'use client';
import { useState, useEffect } from "react";
import { Chart ,BarController,  BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import SafetyMonitor from "@/components/SafetyMonitor";
import Dashboard from "@/components/Dashboard";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Home() {
  const [chart, setChart] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [routeInfo, setRouteInfo] = useState("");
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [placesService, setPlacesService] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load saved dark mode preference
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode === "enabled") {
        document.body.classList.add("dark");
        toggleDarkMode();
      }
  
      // Initialize Google Maps
      if (typeof google !== "undefined") {
        const mapInstance = new google.maps.Map(document.getElementById("map"), {
          zoom: 8,
          center: { lat: 28.6139, lng: 77.209 },
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        setMap(mapInstance);
        setDirectionsService(new google.maps.DirectionsService());
        setDirectionsRenderer(new google.maps.DirectionsRenderer({ map: mapInstance }));
        setPlacesService(new google.maps.places.PlacesService(mapInstance));
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const body = document.body;
    body.classList.toggle("dark");
    const isDark = darkMode;
    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
    setDarkMode(darkMode);
  };

  const calculateEmission = () => {
    const distance = parseFloat(document.getElementById("distance").value);
    const resultElem = document.getElementById("emissionResult");
    const defaultEfficiency = 6; // km per kWh

    if (!isNaN(distance) && distance > 0) {
      const evEmission = (distance / defaultEfficiency) * 0.4;
      const petrolEmission = distance * 0.192;
      const saved = petrolEmission - evEmission;
      const savedPercent = (saved / petrolEmission) * 100;

      resultElem.innerHTML = `
        <span class="text-green-700">EV Emission: <strong>${evEmission.toFixed(2)} kg CO₂</strong></span><br/>
        <span class="text-red-600">Petrol Car Emission: <strong>${petrolEmission.toFixed(2)} kg CO₂</strong></span><br/>
        <span class="text-blue-700 font-semibold">You save approximately <strong>${saved.toFixed(2)} kg CO₂</strong> (${savedPercent.toFixed(1)}%)</span>
      `;

      if (chart) chart.destroy();

      const ctx = document.getElementById("emissionChart").getContext("2d");
      const newChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["EV", "Petrol Car"],
          datasets: [
            {
              label: "CO₂ Emission (kg)",
              data: [evEmission.toFixed(2), petrolEmission.toFixed(2)],
              backgroundColor: ["#22c55e", "#3b82f6"],
              borderRadius: 8,
              maxBarThickness: 80,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
        },
      });

      setChart(newChart);
    } else {
      resultElem.innerHTML = `<span class="text-red-600">Please enter a valid distance.</span>`;
    }
  };

  const findRoute = () => {
    const start = document.getElementById("start").value.trim();
    const end = document.getElementById("end").value.trim();

    if (!start || !end) {
      alert("Please enter both start and destination locations.");
      return;
    }

    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          trafficModel: "best_guess",
        },
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);

          const route = response.routes[0].legs[0];
          const distanceKm = route.distance.value / 1000;
          const durationMin = Math.round(route.duration.value / 60);
          const defaultEfficiency = 6; // km/kWh
          const energyConsumed = distanceKm / defaultEfficiency;

          let info = `
            <p><strong>Distance:</strong> ${distanceKm.toFixed(1)} km</p>
            <p><strong>Estimated Duration:</strong> ${durationMin} minutes</p>
            <p><strong>Estimated Energy Consumption:</strong> ${energyConsumed.toFixed(2)} kWh</p>
          `;

          const midpoint = {
            lat: (route.start_location.lat() + route.end_location.lat()) / 2,
            lng: (route.start_location.lng() + route.end_location.lng()) / 2,
          };

          const request = {
            location: midpoint,
            radius: 5000,
            type: ["electric_vehicle_charging_station"],
          };

          placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
              const chargingStations = results.slice(0, 5).map((place) => place.name).join(", ");
              info += `<p><strong>Nearby EV Charging Stations:</strong> ${chargingStations}</p>`;
            } else {
              info += `<p><strong>Nearby EV Charging Stations:</strong> None found nearby.</p>`;
            }
            setRouteInfo(info);
          });
        } else {
          alert("Could not find route: " + status);
        }
      }
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 transition-colors duration-500">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <a href="#home" className="flex items-center text-green-600 font-extrabold text-2xl tracking-wide hover:text-green-700 transition">
            <i className="fas fa-bolt mr-2"></i>EV EcoTools
          </a>
          
          <ul className="hidden md:flex space-x-10 font-semibold text-gray-700">
            <li><a href="#home" className="hover:text-green-600 transition">Home</a></li>
            <li><a href="#calculator" className="hover:text-green-600 transition">Calculator</a></li>
            <li><a href="#route" className="hover:text-green-600 transition">Route Finder</a></li>
            <li><a href="#contact" className="hover:text-green-600 transition">Contact</a></li>
          </ul>
    
          
          <button onClick={toggleDarkMode} id="darkModeToggle" aria-label="Toggle Dark Mode" className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white transition" title="Toggle Dark Mode">
            <i className="fas fa-moon"></i>
          </button>
    
          
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleDarkMode} id="darkModeToggleMobile" aria-label="Toggle Dark Mode" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white transition" title="Toggle Dark Mode">
              <i className="fas fa-moon"></i>
            </button>
            <input type="checkbox" id="menu-toggle" className="hidden" />
            <label htmlFor="menu-toggle" className="cursor-pointer text-gray-700 hover:text-green-600 transition">
              <i className="fas fa-bars fa-lg"></i>
            </label>
          </div>
        </div>
    
        
        <ul id="menu" className="hidden md:hidden bg-white shadow-md px-6 py-4 space-y-4 font-semibold text-gray-700">
          <li><a href="#home" className="block hover:text-green-600 transition">Home</a></li>
          <li><a href="#calculator" className="block hover:text-green-600 transition">Calculator</a></li>
          <li><a href="#route" className="block hover:text-green-600 transition">Route Finder</a></li>
          <li><a href="#contact" className="block hover:text-green-600 transition">Contact</a></li>
        </ul>
      </nav>

      <section
        id="home"
        className="relative h-screen flex flex-col justify-center items-center text-center px-6 md:px-0 fade-in bg-[url('https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center"
        role="banner"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 opacity-80"></div>

        <div className="relative z-10 max-w-4xl p-8 md:p-16 rounded-xl bg-black bg-opacity-40 shadow-lg">
          <h1 className="text-white text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Drive Smart, Save the Planet
          </h1>
          <p className="text-green-200 text-xl md:text-2xl mb-10 font-semibold drop-shadow-md max-w-3xl mx-auto">
            Calculate your EV CO₂ savings and find the most efficient routes in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="#calculator"
              className="inline-flex items-center justify-center bg-white text-green-700 font-semibold px-10 py-4 rounded-full shadow-lg transition transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-400"
            >
              <i className="fas fa-calculator mr-3"></i> CO₂ Calculator
            </a>
            <a
              href="#route"
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-semibold px-10 py-4 rounded-full shadow-lg transition transform hover:bg-white hover:text-purple-700 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white"
            >
              <i className="fas fa-route mr-3"></i> Efficient Route Finder
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-20 bg-white fade-in" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto text-center">
          <h2 id="features-title" className="text-4xl font-extrabold mb-14 text-gray-900">Our Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <article className="bg-green-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-3 feature-card" tabIndex="0" aria-label="Accurate CO2 Calculations">
              <div className="mb-6 text-green-600 text-5xl" aria-hidden="true">
                <i className="fas fa-leaf"></i>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Accurate CO₂ Calculations</h3>
              <p className="text-gray-700 leading-relaxed">Understand your environmental impact with data-backed insights tailored for EVs.</p>
            </article>
            <article className="bg-blue-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-3 feature-card" tabIndex="0" aria-label="EV Optimized Routing">
              <div className="mb-6 text-blue-600 text-5xl" aria-hidden="true">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-2xl font-semibold mb-3">EV-Optimized Routing</h3>
              <p className="text-gray-700 leading-relaxed">Discover routes that maximize your EV’s efficiency and battery life with smart planning.</p>
            </article>
            <article className="bg-yellow-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-3 feature-card" tabIndex="0" aria-label="Sustainable Design">
              <div className="mb-6 text-yellow-600 text-5xl" aria-hidden="true">
                <i className="fas fa-globe-americas"></i>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Sustainable Design</h3>
              <p className="text-gray-700 leading-relaxed">Crafted with a focus on clean energy and modern, accessible web aesthetics.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 md:px-20 bg-gray-100 fade-in" aria-labelledby="testimonials-title">
        <div className="max-w-7xl mx-auto text-center">
          <h2 id="testimonials-title" className="text-4xl font-extrabold mb-14 text-gray-900">What Users Say</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <blockquote className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2" tabIndex="0">
              <p className="text-lg text-gray-700 italic mb-6">“This tool helped me understand how much I’m saving using my EV. Love the interface!”</p>
              <footer className="font-semibold text-green-600">– Jamie R.</footer>
            </blockquote>
            <blockquote className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2" tabIndex="0">
              <p className="text-lg text-gray-700 italic mb-6">“Efficient route planning for EVs is a game-changer. It’s now part of my daily routine.”</p>
              <footer className="font-semibold text-blue-600">– Morgan T.</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* EV CO2 CALCI Section */}
      <section id="calculator" className="py-20 px-6 md:px-20 bg-white fade-in">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-10 text-gray-900 flex items-center justify-center space-x-3">
          <i className="fas fa-calculator text-green-600"></i>
          <span>EV CO₂ Emission Calculator</span>
        </h2>
        <div className="space-y-6">
          <div className="flex justify-center">
            <input
              type="number"
              id="distance"
              className="w-full max-w-md p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              placeholder="Distance in km"
              min="0"
              aria-label="Distance in kilometers"
            />
          </div>
          <button
            onClick={calculateEmission}
            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-full shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-400"
          >
            <i className="fas fa-play mr-3"></i> Calculate
          </button>
          <p
            id="emissionResult"
            className="mt-6 text-2xl font-semibold text-gray-800 min-h-[2.5rem]"
            role="alert"
            aria-live="polite"
          ></p>
          <canvas
            id="emissionChart"
            className="mt-12 mx-auto max-w-xl"
            aria-label="CO2 Emission Comparison Chart"
            role="img"
          ></canvas>
        </div>
      </div>
    </section>

      {/* Route Finder Section */}
      <section id="route" className="py-20 px-6 md:px-20 bg-gray-50 fade-in">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-10 text-gray-900 flex items-center justify-center space-x-3">
            <i className="fas fa-route text-blue-600"></i>
            <span>EV Efficient Route Finder</span>
          </h2>
          <div className="space-y-6">
            <input
              id="start"
              className="w-full p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Location"
              type="text"
              aria-label="Start Location"
            />
            <input
              id="end"
              className="w-full p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Destination"
              type="text"
              aria-label="Destination"
            />
            <button
              id="findRouteBtn"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-full shadow-lg transition transform hover:-translate-y-1 w-full focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              <i className="fas fa-map-marker-alt mr-3"></i> Find Route
            </button>
          </div>
          <div id="map" className="mt-12 rounded-xl shadow-lg" role="region" aria-label="Map showing route"></div>
          <div id="routeInfo" className="mt-6 text-left max-w-3xl mx-auto text-gray-700"></div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 md:px-20 bg-white fade-in">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-10 text-gray-900 flex items-center justify-center space-x-3">
            <i className="fas fa-envelope text-green-600"></i>
            <span>Contact Us</span>
          </h2>
          <form id="contactForm" className="space-y-8" noValidate>
            <input
              className="w-full text-black p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              placeholder="Your Name"
              name="name"
              required
              aria-required="true"
              aria-label="Your Name"
            />
            <input
              className="w-full text-black p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              type="email"
              placeholder="Your Email"
              name="email"
              required
              aria-required="true"
              aria-label="Your Email"
            />
            <textarea
              className="w-full text-black p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="5"
              placeholder="Your Message"
              name="message"
              required
              aria-required="true"
              aria-label="Your Message"
            ></textarea>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-4 rounded-full shadow-lg transition transform hover:-translate-y-1 w-full focus:outline-none focus:ring-4 focus:ring-green-400"
            >
              <i className="fas fa-paper-plane mr-3"></i> Send Message
            </button>
            <p id="contactSuccess" className="text-green-600 mt-4 font-semibold hidden" role="alert"></p>
          </form>
        </div>
      </section>

      {/* Safety Monitoring  */}
      <SafetyMonitor/>
      {/* Monitoring Dashboard */}
      <Dashboard/>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8">
        <p>&copy; 2025 EV EcoTools. All rights reserved.</p>
      </footer>

      
      <button id="backToTop" aria-label="Back to top" title="Back to top">
        <i className="fas fa-arrow-up"></i>
      </button>
    </>
  );
}
