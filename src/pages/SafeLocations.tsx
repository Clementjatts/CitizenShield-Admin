import React from 'react';
import { MapPin, Phone, Clock, Shield } from 'lucide-react';

const SafeLocations: React.FC = () => {
  const safeLocations = [
    {
      name: "City Community Center",
      address: "123 Main St, Cityville",
      phone: "(555) 123-4567",
      hours: "24/7 during emergencies",
      services: ["Shelter", "Food", "Medical"],
    },
    {
      name: "Central High School",
      address: "456 Oak Ave, Cityville",
      phone: "(555) 987-6543",
      hours: "Open during major emergencies",
      services: ["Shelter", "Food"],
    },
    {
      name: "Memorial Hospital",
      address: "789 Elm St, Cityville",
      phone: "(555) 246-8135",
      hours: "24/7",
      services: ["Medical", "Trauma Care"],
    },
    {
      name: "Police Station",
      address: "101 Safety Rd, Cityville",
      phone: "(555) 911-9111",
      hours: "24/7",
      services: ["Security", "Information"],
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-400 to-teal-300 min-h-screen p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-10 text-white">Safe Locations</h2>
        <p className="text-center text-lg sm:text-xl lg:text-2xl mb-10 sm:mb-16 text-white max-w-4xl mx-auto">
          Find nearby safe locations for shelter, medical assistance, and information during emergencies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
          {safeLocations.map((location, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">{location.name}</h3>
                <p className="text-base sm:text-lg text-gray-600 mb-3 flex items-center">
                  <MapPin className="mr-3 text-blue-500 flex-shrink-0" size={24} />
                  {location.address}
                </p>
                <p className="text-base sm:text-lg text-gray-600 mb-3 flex items-center">
                  <Phone className="mr-3 text-green-500 flex-shrink-0" size={24} />
                  {location.phone}
                </p>
                <p className="text-base sm:text-lg text-gray-600 mb-4 flex items-center">
                  <Clock className="mr-3 text-purple-500 flex-shrink-0" size={24} />
                  <span className="font-semibold">Hours:</span>&nbsp;{location.hours}
                </p>
                <div className="mb-6 flex flex-wrap">
                  {location.services.map((service, idx) => (
                    <span key={idx} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                      <Shield size={16} className="mr-1" />
                      {service}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-base sm:text-lg transition duration-300 ease-in-out flex items-center justify-center">
                    <MapPin className="mr-2" size={20} />
                    Directions
                  </button>
                  <a href={`tel:${location.phone}`} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-base sm:text-lg transition duration-300 ease-in-out flex items-center justify-center">
                    <Phone className="mr-2" size={20} />
                    Call
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white bg-opacity-90 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
          <p className="text-center text-base sm:text-lg text-gray-700">
            <strong className="text-blue-600 block mb-2 text-lg sm:text-xl">Note:</strong>
            Always check the official channels or contact the locations directly for the most up-to-date information during emergencies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafeLocations;