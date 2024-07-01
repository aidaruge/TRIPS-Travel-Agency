import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import './SignIn.css';

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // State to store isAdmin status
    const navigate = useNavigate();
    const location = useLocation();

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get("http://localhost:8800/signin").then((response) => {
            // Check if user is logged in and set isAdmin status if available
            if (response.data.loggedIn) {
                setIsAdmin(response.data.user.userType === "admin");
            }
        })
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post('http://localhost:8800/signin', { username, password })
            .then(res => {
                if (res.data.Status === "Success") {
                    // Store isAdmin status in session or local storage
                    setIsAdmin(res.data.isAdmin);
                    const from = location.state?.from?.pathname || '/';
                    navigate(from);  // Redirect to the previous page or default to '/'
                } else {
                    alert("Error: " + res.data.Message);
                }
            })
            .catch(err => {
                console.error("Error signing in:", err);
                alert("Invalid username or password");
            });
    }

    return (
        <div>
            <Navbar />
            <div className="main-content">
                <div className="signin-container">
                    <h1 className="signin-title">Sign In to our page</h1>
                    <form onSubmit={handleSubmit} className="signin-form">
                        <label>Username</label>
                        <input type="text" value={username} onChange={handleUsernameChange} />
                        <label>Password</label>
                        <input type="password" value={password} onChange={handlePasswordChange} />
                        <button type="submit">Sign In</button>
                    </form>
                    <div>
                        <p>If you don't have an account already please <a href="/signup">press here</a></p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SignIn;
