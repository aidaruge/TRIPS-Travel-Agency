import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import DestinationCard from "../components/DestinationCard";
import Footer from "../components/Footer";
import AddDestinationForm from "../components/AddDestinationForm";
import destinationsPhoto from "../photos/barcelona.jpg";
import "./DestinationsStyles.css";

function Destinations() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false); // Add loggedIn state
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [country, setCountry] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [mealType, setMealType] = useState("");
    const [stars, setStars] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        checkAdmin();
        checkLoggedIn(); // Add function to check loggedIn status
        loadFiltersFromLocalStorage();
        fetchDestinations();
        restoreScrollPosition();
    }, []);

    useEffect(() => {
        if (isDataLoaded) {
            applyFilters();
            saveFiltersToLocalStorage();
        }
    }, [searchQuery, country, maxPrice, mealType, stars, isDataLoaded]);

    const checkAdmin = async () => {
        try {
            const response = await axios.get("http://localhost:8800/check-admin", { withCredentials: true });
            console.log("isAdmin value from backend:", response.data.isAdmin);
            setIsAdmin(response.data.isAdmin);
        } catch (error) {
            console.error("Error checking admin status:", error);
        }
    };

    const checkLoggedIn = async () => {
        try {
            const response = await axios.get('http://localhost:8800/signin', { withCredentials: true });
            console.log("Signin response:", response.data);
            if (response.data.loggedIn) {
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            setLoggedIn(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const res = await axios.get("http://localhost:8800/destinations");
            setDestinations(res.data);
            setFilteredDestinations(res.data);
            setIsDataLoaded(true);
        } catch (err) {
            console.error(err);
        }
    };

    const applyFilters = () => {
        let filtered = [...destinations];

        if (searchQuery) {
            const trimmedQuery = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(destination => destination.name.toLowerCase().includes(trimmedQuery));
        }
        if (country) {
            filtered = filtered.filter(destination => destination.country === country);
        }
        if (maxPrice) {
            filtered = filtered.filter(destination => destination.price <= parseFloat(maxPrice));
        }
        if (mealType) {
            filtered = filtered.filter(destination => destination.mealType === mealType);
        }
        if (stars) {
            filtered = filtered.filter(destination => destination.stars === stars);
        }

        setFilteredDestinations(filtered);
    };

    const saveFiltersToLocalStorage = () => {
        const filters = {
            searchQuery,
            country,
            maxPrice,
            mealType,
            stars
        };
        localStorage.setItem("destinationFilters", JSON.stringify(filters));
    };

    const loadFiltersFromLocalStorage = () => {
        const savedFilters = JSON.parse(localStorage.getItem("destinationFilters"));
        if (savedFilters) {
            setSearchQuery(savedFilters.searchQuery || "");
            setCountry(savedFilters.country || "");
            setMaxPrice(savedFilters.maxPrice || "");
            setMealType(savedFilters.mealType || "");
            setStars(savedFilters.stars || "");
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setCountry("");
        setMaxPrice("");
        setMealType("");
        setStars("");
        localStorage.removeItem("destinationFilters");
        setFilteredDestinations(destinations);
    };

    const handleSearchInputChange = e => {
        setSearchQuery(e.target.value);
    };

    const handleDelete = async (destinationID) => {
        try {
            await axios.delete(`http://localhost:8800/destinations/${destinationID}`);
            setDestinations(destinations.filter(destination => destination.destinationID !== destinationID));
            setFilteredDestinations(filteredDestinations.filter(destination => destination.destinationID !== destinationID));
        } catch (error) {
            console.error('Error deleting destination:', error);
        }
    };

    const handleAddToFavorites = async (destinationID) => {
        try {
            await axios.post(`http://localhost:8800/favorites/${destinationID}`, {}, { withCredentials: true });
            console.log('Added to favorites');
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    const handleAddDestination = async (newDestination) => {
        try {
            const response = await axios.post('http://localhost:8800/create-destination', newDestination);
            const addedDestination = response.data;
            setDestinations(prevDestinations => [...prevDestinations, addedDestination]);
            setFilteredDestinations(prevFilteredDestinations => [...prevFilteredDestinations, addedDestination]);
            // Reload the page after adding a new destination
            window.location.reload();
        } catch (error) {
            console.error('Error adding destination:', error);
        }
    };

    const restoreScrollPosition = () => {
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition) {
            window.scrollTo(0, parseInt(scrollPosition));
        }
    };

    return (
        <>
            <Navbar setLoggedIn={setLoggedIn} setIsAdmin={setIsAdmin} />
            <Hero
                cName="hero-mid"
                heroImg={destinationsPhoto}
                title="Our destinations"
            />

            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                />
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="">Select Country</option>
                    <option value="Romania">Romania</option>
                    <option value="Turcia">Turcia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Egipt">Egipt</option>
                    <option value="Grecia">Grecia</option>
                </select>
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                    <option value="">Select Meal Type</option>
                    <option value="All inclusive">All Inclusive</option>
                    <option value="Demipensiune">Demipensiune</option>
                    <option value="Mic dejun">Mic dejun</option>
                    <option value="Fara masa">Fara Masa</option>
                </select>
                <select value={stars} onChange={(e) => setStars(e.target.value)}>
                    <option value="">Select Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                </select>
                <button onClick={clearFilters}>Clear Filters</button>
            </div>

            <div className="destination-list">
                {filteredDestinations.length > 0 ? (
                    filteredDestinations.map(destination => (
                        <DestinationCard
                            key={destination.destinationID}
                            destination={destination}
                            isAdmin={isAdmin}
                            loggedIn={loggedIn} // Pass loggedIn to DestinationCard
                            onDelete={handleDelete}
                            onAddToFavorites={handleAddToFavorites}
                        />
                    ))
                ) : (
                    <p>No hotels found</p>
                )}
            </div>

            {isAdmin && (
                <AddDestinationForm onAddDestination={handleAddDestination} />
            )}
            
            <Footer />
        </>
    );
}

export default Destinations;
