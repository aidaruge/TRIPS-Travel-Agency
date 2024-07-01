import React from 'react';
import axios from 'axios';
//import './DestinationDetails.css';

function DestinationDetails({ destination, loggedIn, userID }) {
    const handleAddToFavorites = async () => {
        try {
            // Make a request to add the destination to favorites
            await axios.post('http://localhost:8800/add-to-favorites', {
                destinationID: destination.destinationID,
                userID: userID
            });
            console.log('Added to favorites');
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    return (
        <div className="destination-details-container">
            <div className="slideshow">
                {/* Implement slideshow here */}
                {/* You can use libraries like react-responsive-carousel for slideshow */}
            </div>
            <div className="destination-details">
                <h1>{destination.name}</h1>
                <h2>Price: {destination.price}€</h2>
                <p>Description: {destination.description}</p>
                <p>Location: {destination.location}, {destination.country}</p>
                {loggedIn && (
                    <button onClick={handleAddToFavorites}>Add to Favorites</button>
                )}
            </div>
        </div>
    );
}

export default DestinationDetails;
