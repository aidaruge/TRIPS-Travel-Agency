import React from 'react';
import { Link } from 'react-router-dom';
import './DestinationCardStyles.css';

function DestinationCard({ destination, isAdmin, onDelete }) {
    const handleDelete = async () => {
        try {
            await onDelete(destination.destinationID);
        } catch (error) {
            console.error('Error deleting destination:', error);
        }
    };

    const saveScrollPosition = () => {
        sessionStorage.setItem('scrollPosition', window.scrollY);
    };

    return (
        <div className="destination-card" key={destination.destinationID}>
            <img src={destination.photoURL} alt={destination.name} className="destination-img" />
            <div className="destination-details">
                <h2>{destination.name}</h2>
                <h3>Country: {destination.country}</h3>
                <p>Location: {destination.location}</p>
                <p>Price: {destination.price}€ per person / per night</p>
                <p>Stars: {destination.stars}</p>
                <Link to={`/destinations/${destination.destinationID}`} onClick={saveScrollPosition}>
                    <button className="destination-btn">Details</button>
                </Link>
                {isAdmin ? (
                    <>
                        <Link to={`/edit/${destination.destinationID}`} onClick={saveScrollPosition}>
                            <button className="destination-btn">Edit</button>
                        </Link>
                        <button className="destination-btn" onClick={handleDelete}>Delete</button>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default DestinationCard;
