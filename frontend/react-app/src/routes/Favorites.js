import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Favorites.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user login status and details
    axios.get('http://localhost:8800/signin', { withCredentials: true })
      .then((response) => {
        setLoggedIn(response.data.loggedIn);
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error('Error fetching login status:', error);
        setLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    if (loggedIn && user) {
      // Fetch favorite destinations for the logged-in user
      axios.get(`http://localhost:8800/favorites/${user.userID}`)
        .then((response) => {
          setFavorites(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching favorite destinations:', error);
          setError('Failed to fetch favorite destinations');
          setLoading(false);
        });
    }
  }, [loggedIn, user]);

  const handleDeleteFavorite = async (destinationID) => {
    try {
      await axios.post('http://localhost:8800/delete-from-favorites', {
        destinationID,
        userID: user.userID,
      });
      // Remove the favorite from the local state
      setFavorites(favorites.filter(favorite => favorite.destinationID !== destinationID));
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="favorites-page">
        <h1>Your Favorite Destinations</h1>
        {favorites.length === 0 ? (
          <p>No favorite destinations found.</p>
        ) : (
          <div className="favorites-list">
            {favorites.map((destination) => (
              <div key={destination.destinationID} className="favorite-item">
                <h2>{destination.name}</h2>
                <p>{destination.location}, {destination.country}</p>
                <p>{destination.description}</p>
                <p>Price: {destination.price}€ per night</p>
                <p>Stars: {destination.stars}</p>
                <p>Meal Type: {destination.mealType}</p>
                <div className="button-container">
                  <Link to={`/destinations/${destination.destinationID}`}>View Details</Link>
                  <button onClick={() => handleDeleteFavorite(destination.destinationID)}>Delete from Favorites</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Favorites;
