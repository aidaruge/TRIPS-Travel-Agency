import React from 'react';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import aboutPhoto from "../photos/night.jpg";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom'; // Ensure you have React Router for navigation
import './About.css'; // Assuming you have a CSS file for additional styling

function About() {
    return (
        <>
            <Navbar />
            <Hero
                cName="hero-mid"
                heroImg={aboutPhoto}
                title="About us"
                btnClass="hide"
            />
            <div className="about-us">
                <section className="about-intro">
                    <h2>Who We Are</h2>
                    <p>
                        Welcome to TRIPS, your number one source for all things travel. We're dedicated to giving you the very best of travel experiences, with a focus on reliability, customer service, and uniqueness.
                    </p>
                </section>

                <section className="mission">
                    <h2>Our Mission</h2>
                    <p>
                        Our mission is to make travel accessible and enjoyable for everyone. We believe in creating unforgettable experiences by offering personalized travel plans that cater to your needs and interests.
                    </p>
                </section>

                <section className="destinations">
                    <h2>Explore Our Destinations</h2>
                    <p>
                        Discover a world of adventure with our carefully curated travel destinations. Whether you seek the tranquility of pristine beaches, the excitement of bustling cities, or the charm of quaint villages, TRIPS has something for everyone. 
                        Each destination is selected to provide you with unique experiences and lasting memories.
                    </p>
                    <p>
                        Learn more about our amazing destinations and find the perfect spot for your next getaway. <Link to="/destinations">Explore Destinations</Link>
                    </p>
                </section>

                <section className="map">
                    <h2>Our Location</h2>
                    <div className="map-container">
                        <iframe
                            title="Oradea Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2749.3191549610654!2d21.92404721537665!3d47.0465008359824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474636e6f4d8d3d3%3A0x3256d1b162626f55!2sOradea%2C%20Romania!5e0!3m2!1sen!2sus!4v1624999516355!5m2!1sen!2sus"
                            width="600"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                        ></iframe>
                    </div>
                </section>

                <section className="cta">
                    <h2>Get in Touch</h2>
                    <p>
                        Have any questions or need help planning your next adventure? <Link to="/contact">Contact us</Link> for more information.
                    </p>
                </section>
            </div>
            <Footer />
        </>
    );
}

export default About;
