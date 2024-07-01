import React from 'react';
import Navbar from "../components/Navbar"
import Hero from "../components/Hero";
import contactPhoto from "../photos/bali.jpg";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

function Contact(){
    return(
        <>
        <Navbar/>
        <Hero
        cName="hero-mid"
        heroImg={contactPhoto}
        title="Get in contact with us"
        //text="Don't hasitate to send us an email if you have any questions or want a personalised offer"
        buttonText="Travel Destinations"
        url="/destinations"
        btnClass="hide"
        />
        <ContactForm />
        <Footer/>
        </>
    )
}

export default Contact;
