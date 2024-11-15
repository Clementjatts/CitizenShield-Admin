import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Book, AlertTriangle, Users, MapPin, Stethoscope } from 'lucide-react';

const Home: React.FC = () => {
    const emergencyCards = [
        { title: 'Emergency Contacts', icon: <Phone size={32} />, link: '/emergency-contacts', color: 'bg-red-500' },
        { title: 'Emergency Guide', icon: <Book size={32} />, link: '/emergency-guide', color: 'bg-blue-600' },
        { title: 'Report Incident', icon: <AlertTriangle size={32} />, link: '/report-incident', color: 'bg-yellow-500' },
        { title: 'Community Support', icon: <Users size={32} />, link: '/community-support', color: 'bg-green-500' },
        { title: 'Safe Locations', icon: <MapPin size={32} />, link: '/safe-locations', color: 'bg-purple-500' },
        { title: 'First Aid Tips', icon: <Stethoscope size={32} />, link: '/first-aid-tips', color: 'bg-teal-500' },
    ];

    return (
        <div className="bg-gradient-to-br from-blue-400 to-cyan-300 min-h-screen p-6 sm:p-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-10 text-white">Welcome to CitizenShield</h1>
                <p className="text-center text-lg sm:text-xl lg:text-2xl mb-10 sm:mb-16 text-white max-w-4xl mx-auto">
                    Your comprehensive emergency preparedness and response platform.
                    Stay informed, connected, and safe with our cutting-edge features.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16">
                    {emergencyCards.map((card, index) => (
                        <Link key={index} to={card.link} className="block">
                            <div className={`${card.color} text-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center flex flex-col justify-center items-center h-48 sm:h-56`}>
                                {React.cloneElement(card.icon, { className: 'mb-4' })}
                                <h2 className="text-xl sm:text-2xl font-semibold">{card.title}</h2>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="bg-white bg-opacity-90 border border-blue-200 rounded-xl shadow-lg p-6 sm:p-8">
                    <h3 className="text-2xl sm:text-3xl font-semibold text-blue-600 mb-4 sm:mb-6">Emergency Preparedness Tip</h3>
                    <p className="text-lg sm:text-xl mb-6 text-gray-700">
                        Always keep an emergency kit ready with essential items such as water, non-perishable food,
                        first-aid supplies, flashlights, and batteries. Regularly check and update your kit to ensure
                        all items are in good condition and not expired.
                    </p>
                    <Link to="/emergency-guide" className="inline-block bg-blue-500 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-lg sm:text-xl font-semibold">
                        Learn More Safety Tips
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;