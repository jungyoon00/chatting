import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Main.css";

function Main() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login");
    };

    return (
        <div className="login-page">
            <header className="app-header">
                <h1>Welcome to Chaaatting</h1>
                <p>Connect, communicate, and share your moments with ease.</p>
            </header>
            <section className="content-section">
                <div className="intro">
                    <h2>What is Chaaatting?</h2>
                    <p>
                        Chaaatting is your go-to platform for instant communication and connection. 
                        Share messages, photos, and experiences with friends and family like never before.
                    </p>
                </div>
                <div className="features">
                    <h2>Why Choose Us?</h2>
                    <ul>
                        <li>📱 Easy-to-use interface</li>
                        <li>🔒 Secure and private messaging</li>
                        <li>🌍 Connect with people worldwide</li>
                    </ul>
                </div>
                <div className="cta">
                    <button className="login-btn" onClick={handleLoginClick}>
                        Get Started
                    </button>
                </div>
            </section>
            <footer className="app-footer">
                <img 
                    src="./imgs/logo.ico" 
                    alt="Chaaatting Logo" 
                    className="app-logo" 
                />
                <p>Connecting you to the world of instant communication.</p>
            </footer>
        </div>
    );
}

export default Main;
