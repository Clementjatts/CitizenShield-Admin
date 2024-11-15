import React, { useState } from 'react';
import {
    Menu,
    Search,
    ChevronDown,
    User,
    Lock,
    X,
    Mail
} from 'lucide-react';
import avatar from '../../assets/avatar.png';

interface HeaderProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    dropdownOpen: boolean;
    setDropdownOpen: (open: boolean) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({
    collapsed,
    setCollapsed,
    dropdownOpen,
    setDropdownOpen,
    searchTerm,
    setSearchTerm
}) => {
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [profileData, setProfileData] = useState({ fullName: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleEditProfile = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Profile updated:', profileData);
        setShowEditProfile(false);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Password changed:', passwordData);
        setShowChangePassword(false);
    };

    const Modal: React.FC<{ show: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ show, onClose, title, children }) => {
        if (!show) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg w-96 max-w-md mx-auto overflow-hidden shadow-xl transform transition-all sm:max-w-lg">
                    <div className="px-6 py-4 bg-blue-600 dark:bg-blue-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }> = ({ icon, ...props }) => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input {...props} className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
        </div>
    );

    return (
        <header className="flex justify-between items-center h-16 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                <button
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="relative">
                    <button
                        className="flex items-center space-x-2 focus:outline-none"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-xl z-10">
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                    setShowEditProfile(true);
                                    setDropdownOpen(false);
                                }}
                            >
                                Edit Profile
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                    setShowChangePassword(true);
                                    setDropdownOpen(false);
                                }}
                            >
                                Change Password
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
                <form onSubmit={handleEditProfile} className="space-y-6">
                    <Input
                        icon={<User size={18} />}
                        type="text"
                        placeholder="Full Name"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        required
                    />
                    <Input
                        icon={<Mail size={18} />}
                        type="email"
                        placeholder="Email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowEditProfile(false)}
                            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
                <form onSubmit={handleChangePassword} className="space-y-6">
                    <Input
                        icon={<Lock size={18} />}
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                    />
                    <Input
                        icon={<Lock size={18} />}
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                    />
                    <Input
                        icon={<Lock size={18} />}
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowChangePassword(false)}
                            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </form>
            </Modal>
        </header>
    );
};

export default Header;