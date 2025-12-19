import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

export default function Home() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>🚀 Dayly</h1>
                {user && (
                    <div className="user-menu">
                        <span>Welcome, {user.name}!</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                )}
            </header>

            <main className="home-content">
                {user ? (
                    <div className="dashboard">
                        <h2>Welcome back, {user.name}! 👋</h2>
                        <p>Email: {user.email}</p>
                        
                        <div className="features-grid">
                            <div className="feature-card">
                                <h3>😊 Mood Tracking</h3>
                                <p>Track your daily mood</p>
                            </div>
                            <div className="feature-card">
                                <h3>😴 Sleep Tracking</h3>
                                <p>Monitor your sleep patterns</p>
                            </div>
                            <div className="feature-card">
                                <h3>📊 Analytics</h3>
                                <p>View your trends</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="login-prompt">
                        <h2>Please Login or Register</h2>
                        <div className="button-group">
                            <button onClick={() => navigate('/login')} className="btn-primary">
                                Login
                            </button>
                            <button onClick={() => navigate('/register')} className="btn-secondary">
                                Register
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
