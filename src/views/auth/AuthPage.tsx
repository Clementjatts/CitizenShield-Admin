import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { signIn } from '../../services/authService';
import { auth, db } from '../../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';
import logo from '../../assets/logo.png';
import './AuthPage.css';

interface AuthPageProps {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthPage: React.FC<AuthPageProps> = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(formData.email, formData.password);
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (err) {
            setError(handleFirebaseError(err));
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            // Create the user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Create admin user document
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: formData.username,
                email: formData.email,
                role: 'admin',
                suspended: false,
                registrationDate: new Date(),
                lastLoginDate: new Date()
            });

            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (err) {
            setError(handleFirebaseError(err));
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <img src={logo} alt="CitizenShield Logo" className="auth-logo" />
                    <h2 className="auth-title">Admin Dashboard</h2>
                    <p className="auth-subtitle">
                        {isLogin ? 'Log in to manage CitizenShield' : 'Create an admin account'}
                    </p>
                </div>

                <div className="auth-toggle">
                    <button
                        className={`toggle-button ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`toggle-button ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <User className="input-icon" size={20} />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="form-input"
                                placeholder="Full Name"
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="form-input"
                            placeholder="Admin Email"
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            className="form-input"
                            placeholder="Password"
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <Lock className="input-icon" size={20} />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="form-input"
                                placeholder="Confirm Password"
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;