import React, { useState } from "react";
import axios from 'axios';
import Navbar from "../components/Navbar";
import './SignUp.css'; // Import CSS file for styling
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";


function SignUp() {
    const [values, setValues] = useState({
        username: '',
        password: '',
        email: '',
        fullName: ''
    });

    const navigate = useNavigate();

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!values.fullName || !values.email || !values.username || !values.password) {
            alert("All fields are required!");
            return;
        }
        axios.post('http://localhost:8800/signup', values)
            .then(res => {
                if(res.data.Status === "Success"){
                    navigate('/signin');
                } else {
                    alert("Signup error: " + (res.data.Error || "Unknown error"));
                }
            })
            .catch(err => {
                console.error("Signup error:", err);
                alert("Signup error: " + err.message);
            });
    }

    return (
        <div className="signup-body">
            <div className="navbar">
                <Navbar/>
            </div>
            <div className="main-content">
                <div className="signup-container">
                    <h1 className="signup-title">Sign Up to our page</h1>
                    <form onSubmit={handleSubmit} className="signup-form">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={values.fullName} onChange={handleChange} />
                        <label>Email</label>
                        <input type="email" name="email" value={values.email} onChange={handleChange} />
                        <label>Username</label>
                        <input type="text" name="username" value={values.username} onChange={handleChange} />
                        <label>Password</label>
                        <input type="password" name="password" value={values.password} onChange={handleChange} />
                        <button type="submit">Sign Up</button>
                    </form>
                    <p>Already have an account? <a href="/signin">Sign In</a></p>
                </div>
            </div>
            <Footer/>
        </div>
    );
}

export default SignUp;
