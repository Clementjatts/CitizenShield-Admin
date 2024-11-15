import React from 'react';
import { AlertTriangle, Send, MapPin, FileText, Phone } from 'lucide-react';

const ReportIncident: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Incident reported');
    // Add your form submission logic here
  };

  return (
    <div className="bg-gradient-to-br from-red-400 to-orange-300 min-h-screen p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <AlertTriangle className="text-red-600 mx-auto mb-4 sm:mb-6" size={64} />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Report an Incident</h2>
          <p className="text-lg sm:text-xl text-red-100 max-w-2xl mx-auto">
            Your quick action can make a difference. Report any emergency incidents to help us respond effectively.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="incidentType" className="block text-lg font-medium text-gray-700 mb-2">Incident Type</label>
              <select
                id="incidentType"
                name="incidentType"
                className="block w-full pl-3 pr-10 py-3 text-base sm:text-lg border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-lg"
                required
              >
                <option value="">Select incident type</option>
                <option value="fire">Fire</option>
                <option value="medical">Medical Emergency</option>
                <option value="crime">Crime</option>
                <option value="accident">Accident</option>
                <option value="natural_disaster">Natural Disaster</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-lg font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={24} />
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-base sm:text-lg"
                  placeholder="Enter the incident location"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={24} />
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-base sm:text-lg"
                  placeholder="Describe the incident in detail"
                  required
                ></textarea>
              </div>
            </div>

            <div>
              <label htmlFor="contact" className="block text-lg font-medium text-gray-700 mb-2">Your Contact Information (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={24} />
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-base sm:text-lg"
                  placeholder="Phone number or email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg sm:text-xl font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              <Send className="mr-3" size={24} />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;