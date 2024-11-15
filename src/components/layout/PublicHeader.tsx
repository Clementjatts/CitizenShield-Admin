import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Home, Mail, Menu as MenuIcon, X } from 'lucide-react';
import logo from '../../assets/logo.png';

interface PublicHeaderProps {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ isAuthenticated, setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleAuthClick = () => {
        if (isAuthenticated) {
            setIsAuthenticated(false);
            navigate('/');
        } else {
            navigate('/auth');
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md px-4 py-3">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="bg-white p-3 md:p-4 rounded-full shadow-md flex items-center justify-center">
                        <img
                            src={logo}
                            alt="CitizenShield Logo"
                            className="h-10 w-10 md:h-14 md:w-14 transition-transform duration-300 ease-in-out transform group-hover:scale-110"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-bold text-white">CitizenShield</span>
                        <span className="text-xs md:text-sm text-blue-200">Your Safety, Our Priority</span>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="flex items-center px-3 py-2 rounded-md text-blue-100 hover:bg-blue-500 hover:text-white transition-colors duration-200">
                        <Home size={20} className="mr-2" />
                        <span className="font-medium">Home</span>
                    </Link>
                    <Link to="/contact" className="flex items-center px-3 py-2 rounded-md text-blue-100 hover:bg-blue-500 hover:text-white transition-colors duration-200">
                        <Mail size={20} className="mr-2" />
                        <span className="font-medium">Contact Us</span>
                    </Link>
                    <button
                        className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        onClick={handleAuthClick}
                    >
                        <User size={20} className="mr-2" />
                        <span className="font-medium">{isAuthenticated ? 'Logout' : 'Login'}</span>
                    </button>
                </nav>
                <div className="md:hidden">
                    <button onClick={toggleMobileMenu} className="text-white hover:text-blue-200">
                        {mobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                    </button>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden mt-3 bg-blue-500 rounded-md shadow-lg overflow-hidden">
                    <Link to="/" className="block px-4 py-3 text-white hover:bg-blue-600 transition-colors duration-200">
                        <Home size={20} className="inline-block mr-2" />
                        Home
                    </Link>
                    <Link to="/contact" className="block px-4 py-3 text-white hover:bg-blue-600 transition-colors duration-200">
                        <Mail size={20} className="inline-block mr-2" />
                        Contact Us
                    </Link>
                    <button
                        className="w-full text-left px-4 py-3 bg-white text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                        onClick={handleAuthClick}
                    >
                        <User size={20} className="inline-block mr-2" />
                        {isAuthenticated ? 'Logout' : 'Login'}
                    </button>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;