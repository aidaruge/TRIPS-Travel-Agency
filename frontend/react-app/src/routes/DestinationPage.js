import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Slideshow from '../components/Slideshow';
import ReservationForm from '../components/ReservationForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './DestinationPage.css';

function DestinationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [destination, setDestination] = useState(null);
  const [photoURLs, setPhotoURLs] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const destinationResponse = await axios.get(`http://localhost:8800/destinations/${id}`);
        setDestination(destinationResponse.data);

        const photosResponse = await axios.get(`http://localhost:8800/destinationphotos/${id}`);
        setPhotoURLs(photosResponse.data.map((photo) => photo.photoURL));
      } catch (error) {
        console.error('Error fetching destination:', error);
      }
    };

    fetchDestination();
  }, [id]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8800/signin', { withCredentials: true });
        setLoggedIn(response.data.loggedIn);
        setUser(response.data.user);

        if (response.data.loggedIn) {
          const favoritesResponse = await axios.get(`http://localhost:8800/favorites/${response.data.user.userID}`);
          const favoriteDestinations = favoritesResponse.data;
          const isFav = favoriteDestinations.some(fav => fav.destinationID === parseInt(id));
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error('Error fetching login status or favorites:', error);
      }
    };

    fetchUserStatus();
  }, [id]);

  const handleAddToFavorites = async () => {
    try {
      const response = await axios.post('http://localhost:8800/add-to-favorites', {
        destinationID: destination.destinationID,
        userID: user.userID
      });
      console.log("Add to favorites response:", response.data);
      setIsFavorite(true); // Hide the button after adding to favorites
    } catch (error) {
      console.error('Error adding to favorites:', error);
      console.error("Error message:", error.message);
      console.error("Request:", error.config);
      console.error("Response:", error.response);
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      const response = await axios.post('http://localhost:8800/delete-from-favorites', {
        destinationID: destination.destinationID,
        userID: user.userID
      });
      console.log("Remove from favorites response:", response.data);
      setIsFavorite(false); // Show the button again after removing from favorites
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (!destination) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="destination-page">
        <Slideshow images={photoURLs} />
        <div className="destination-details">
          <h1>{destination.name}</h1>
          <p className="location">{destination.location}, {destination.country}</p>
          <p className="description">{destination.description}</p>
          <p>Transportul nu este inclus. Pretul presupune doar cazarea si masa.</p>
          <p className="price">Price: {destination.price}€ per night</p>
          <p>Un hotel de {destination.stars} stele</p>
          <p>Tipul de masa inclusa: {destination.mealType}</p>
          {loggedIn && <ReservationForm destination={destination} userID={user.userID} />}
          {!loggedIn && <p>Sign in <Link to="/signin" state={{ from: location }}>here</Link> if you want to make a reservation.</p>}
          {loggedIn && !isFavorite && (
            <button onClick={handleAddToFavorites}>Add to Favorites</button>
          )}
          {loggedIn && isFavorite && (
            <button onClick={handleRemoveFromFavorites}>Remove from Favorites</button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default DestinationPage;
