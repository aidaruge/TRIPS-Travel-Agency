import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar"
import homePhoto from "../photos/ocean.jpg"

function Home(){
    return(
        <>
        <Navbar/>
        <Hero
        cName="hero"
        heroImg={homePhoto}
        title="Your Journey Starts Now"
        //text="Choose your favorite destination"
        buttonText="Travel Destinations"
        url="/destinations"
        btnClass="show"
        />
        <Footer/>
        </>
    )
}

export default Home;