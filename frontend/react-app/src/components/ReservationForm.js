// src/components/ReservationForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReservationForm.css';

function ReservationForm({ destination }) {
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numGuests: '',
  });
  const [userID, setUserID] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8800/signin', { withCredentials: true })
      .then((response) => {
        if (response.data.loggedIn) {
          setUserID(response.data.user.userID);
        }
      })
      .catch((error) => {
        console.error('Error fetching login status:', error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:8800/submit-booking', {
        ...formData,
        destinationID: destination.destinationID,
        userID: userID,
      });
      setConfirmationMessage(data.message);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div>
        <p>{confirmationMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Make A Reservation Here:</h2>
      <label>
        Check-in Date:
        <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required />
      </label>
      <label>
        Check-out Date:
        <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} required />
      </label>
      <label>
        Number of Guests:
        <input type="number" name="numGuests" value={formData.numGuests} onChange={handleChange} min="1" required />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ReservationForm;
