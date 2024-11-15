import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import Sider from '../components/layout/Sider';
import Header from '../components/layout/Header';
import AlertsView from '../views/dashboard/AlertsView';
import UsersView from '../views/dashboard/UsersView';
import BlogView from '../views/dashboard/BlogView';
import ForumView from '../views/dashboard/ForumView';
import MessagesView from '../views/dashboard/MessagesView';
import NotificationsView from '../views/dashboard/NotificationsView';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { handleFirebaseError } from '../utils/errorHandler';

interface AdminDashboardProps {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setIsAuthenticated }) => {
    const [activeTab, setActiveTab] = useState<string>('alerts');
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsAuthenticated(false);
            navigate('/');
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'alerts':
                return <AlertsView searchTerm={searchTerm} />;
            case 'users':
                return <UsersView searchTerm={searchTerm} />;
            case 'blog':
                return <BlogView searchTerm={searchTerm} />;
            case 'forum':
                return <ForumView searchTerm={searchTerm} />;
            case 'messages':
                return <MessagesView searchTerm={searchTerm} />;
            case 'notifications':
                return <NotificationsView searchTerm={searchTerm} />;
            default:
                return <AlertsView searchTerm={searchTerm} />;
        }
    };

    return (
        <div className="flex h-screen">
            <Sider
                collapsed={collapsed}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
            />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
                            {error}
                        </Alert>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;