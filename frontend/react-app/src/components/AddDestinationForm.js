import React, { useState } from 'react';
import axios from 'axios';
import './AddDestinationForm.css'; // Import CSS for styling

const AddDestinationForm = ({ onAddDestination }) => {
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [price, setPrice] = useState('');
    const [mealType, setMealType] = useState('');
    const [stars, setStars] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [photoURL, setPhotoURL] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newDestination = {
                name,
                country,
                price: parseFloat(price),
                mealType,
                stars: parseInt(stars, 10),
                description,
                location,
                photoURL
            };
            const response = await axios.post('http://localhost:8800/create-destination', newDestination);
            onAddDestination(response.data); // Update parent state with new destination
            alert('Destination added successfully!');
            // Reload the page after successful submission
            window.location.reload();
        } catch (error) {
            console.error('Error adding destination:', error);
            alert('Failed to add destination. Please try again.');
        }
    };

    return (
        <div className="card add-destination-form">
            <h2>Add New Destination</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="country">Country:</label>
                    <input
                        type="text"
                        id="country"
                        className="form-control"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price:</label>
                    <input
                        type="number"
                        id="price"
                        className="form-control"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="mealType">Meal Type:</label>
                    <select
                        id="mealType"
                        className="form-control"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        required
                    >
                        <option value="">Select Meal Type</option>
                        <option value="All inclusive">All Inclusive</option>
                        <option value="Demipensiune">Demipensiune</option>
                        <option value="Mic dejun">Mic dejun</option>
                        <option value="Fara masa">Fara masa</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="stars">Stars:</label>
                    <select
                        id="stars"
                        className="form-control"
                        value={stars}
                        onChange={(e) => setStars(e.target.value)}
                        required
                    >
                        <option value="">Select Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="location">Location:</label>
                    <input
                        type="text"
                        id="location"
                        className="form-control"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="photoURL">Photo URL:</label>
                    <input
                        type="text"
                        id="photoURL"
                        className="form-control"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-button">Add Destination</button>
            </form>
        </div>
    );
};

export default AddDestinationForm;
