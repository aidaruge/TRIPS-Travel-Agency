import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Reservations.css';

const Reservations = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is logged in
    axios.get('http://localhost:8800/signin', { withCredentials: true })
      .then(response => {
        setLoggedIn(response.data.loggedIn);
        setUser(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching login status:', error);
        setLoggedIn(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loggedIn && user) {
      // Fetch bookings if authenticated
      axios.get(`http://localhost:8800/bookings`, { withCredentials: true })
        .then(response => {
          setBookings(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching bookings:', error);
          setError('Error fetching bookings.');
          setLoading(false);
        });
    }
  }, [loggedIn, user]);

  const handleConfirm = (bookingID) => {
    axios.post(`http://localhost:8800/bookings/${bookingID}/confirm`)
      .then(response => {
        setBookings(bookings.map(booking =>
          booking.bookingID === bookingID ? { ...booking, status: 'confirmed' } : booking
        ));
      })
      .catch(error => {
        console.error('Error confirming booking:', error);
      });
  };

  const handleCancel = (bookingID) => {
    axios.delete(`http://localhost:8800/bookings/${bookingID}/cancel`)
      .then(response => {
        setBookings(bookings.filter(booking => booking.bookingID !== bookingID));
      })
      .catch(error => {
        console.error('Error cancelling booking:', error);
      });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!loggedIn) {
    return <div className="error">You are logged out. Please log in to see the reservations.</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="reservations-container">
        <h1>All Reservations</h1>
        {bookings.length > 0 ? (
          <div className="reservations-list">
            {bookings.map(booking => (
              <div key={booking.bookingID} className="reservation-card">
                <img src={booking.destinationPhoto} alt={booking.destinationName} className="reservation-photo" />
                <div className="reservation-details">
                  <h2>{booking.destinationName}</h2>
                  <p>{booking.destinationLocation}</p>
                  <p>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                  <p>Guests: {booking.numGuests}</p>
                  <p>Price: ${booking.finalPrice}</p>
                  <p>Status: {booking.status}</p>
                  {booking.status !== 'confirmed' && (
                    <div className="reservation-actions">
                      <button className="confirm-button" onClick={() => handleConfirm(booking.bookingID)}>Confirm</button>
                      <button className="cancel-button" onClick={() => handleCancel(booking.bookingID)}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No reservations found.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Reservations;
