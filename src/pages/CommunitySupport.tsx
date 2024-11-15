import React from 'react';
import { Users, MessageSquare, BookOpen, Bell } from 'lucide-react';

const CommunitySupport: React.FC = () => {
  const supportGroups = [
    {
      name: "Emergency Response Team",
      description: "Volunteer group trained in basic emergency response and first aid.",
      members: 50
    },
    {
      name: "Neighborhood Watch",
      description: "Community-led group focused on local safety and crime prevention.",
      members: 75
    },
    {
      name: "Crisis Support Network",
      description: "Provides emotional support and resources during emergencies.",
      members: 30
    },
    {
      name: "Disaster Relief Volunteers",
      description: "Assists in relief efforts during natural disasters and major emergencies.",
      members: 100
    }
  ];

  const supportResources = [
    {
      title: "Emergency Preparedness Guide",
      description: "Comprehensive guide on preparing for various emergency situations.",
      icon: <BookOpen size={24} />
    },
    {
      title: "Community Emergency Response Training (CERT)",
      description: "Free training program on basic disaster response skills.",
      icon: <Users size={24} />
    },
    {
      title: "Mental Health First Aid Course",
      description: "Learn how to identify, understand and respond to signs of mental illnesses.",
      icon: <MessageSquare size={24} />
    },
    {
      title: "Local Emergency Alerts System",
      description: "Sign up for real-time emergency notifications in your area.",
      icon: <Bell size={24} />
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-400 to-teal-300 min-h-screen p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-10 text-white">Community Support</h2>
        <p className="text-center text-lg sm:text-xl lg:text-2xl mb-10 sm:mb-16 text-white max-w-4xl mx-auto">
          Connect with local support groups and access community resources to enhance emergency preparedness and response.
        </p>

        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Local Support Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {supportGroups.map((group, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h4 className="text-xl sm:text-2xl font-semibold mb-3">{group.name}</h4>
              <p className="text-base sm:text-lg text-gray-600 mb-4">{group.description}</p>
              <p className="text-base sm:text-lg text-gray-600 mb-6">Members: {group.members}</p>
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <button className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-base sm:text-lg font-medium flex items-center justify-center">
                  <Users className="mr-2" size={20} />
                  Join Group
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-base sm:text-lg font-medium flex items-center justify-center">
                  <MessageSquare className="mr-2" size={20} />
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Community Resources</h3>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {supportResources.map((resource, index) => (
            <div key={index} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 last:border-b-0">
              <div className="flex items-start mb-4 sm:mb-0">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  {resource.icon}
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold mb-2">{resource.title}</h4>
                  <p className="text-base sm:text-lg text-gray-600">{resource.description}</p>
                </div>
              </div>
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-base sm:text-lg font-medium">
                Access Resource
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySupport;