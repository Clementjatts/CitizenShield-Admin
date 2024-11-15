import React from 'react';
import { AlertCircle, Users, MessageSquare, Book, Mail, Bell, LogOut, Sun, Moon } from 'lucide-react';
import logo from '../../assets/logo.png';

interface SiderProps {
    collapsed: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    darkMode: boolean;
    toggleTheme: () => void;
    handleLogout: () => void;
}

const Sider: React.FC<SiderProps> = ({
    collapsed,
    activeTab,
    setActiveTab,
    darkMode,
    toggleTheme,
    handleLogout
}) => {
    const menuItems = [
        { key: 'alerts', icon: AlertCircle, label: 'Alerts' },
        { key: 'users', icon: Users, label: 'Users' },
        { key: 'forum', icon: MessageSquare, label: 'Forum' },
        { key: 'blog', icon: Book, label: 'Blog' },
        { key: 'messages', icon: Mail, label: 'Messages' },
        { key: 'notifications', icon: Bell, label: 'Notifications' },
    ];

    return (
        <div className="flex">
            <div className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800`}>
                <div className={`flex items-center justify-center ${collapsed ? 'h-16' : 'h-32'} transition-all duration-300 py-4 ${collapsed ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                    <img
                        src={logo}
                        alt="CitizenShield Logo"
                        className={`transition-all duration-300 ${collapsed ? 'w-8 h-8' : 'w-40 h-auto'} object-contain`}
                    />
                </div>
                <nav className="mt-5 flex-grow">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`flex items-center w-full p-4 ${activeTab === item.key ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300'
                                } hover:bg-blue-400 hover:text-white transition-colors duration-200`}
                        >
                            <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-4'}`} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center w-full p-4 text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {!collapsed && <span className="ml-4">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full p-4 text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="ml-4">Logout</span>}
                    </button>
                </div>
            </div>
            <div className="w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        </div>
    );
};

export default Sider;