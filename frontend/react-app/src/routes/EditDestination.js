import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditDestination.css'; // Import the CSS file

const EditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState({
    name: '',
    description: '',
    price: '',
    photoURL: '',
  });
  const [photoURL, setPhotoURL] = useState('');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/destinations/${id}`);
        setDestination(response.data);
      } catch (error) {
        console.error('Error fetching destination:', error);
      }
    };

    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/destinationphotos/${id}`);
        setPhotos(response.data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchDestination();
    fetchPhotos();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDestination({
      ...destination,
      [name]: value,
    });
  };

  const handleUpdateDestination = async () => {
    try {
      await axios.put(`http://localhost:8800/destinations/${id}`, destination);
      navigate(`/destinations/${id}`);
    } catch (error) {
      console.error('Error updating destination:', error);
    }
  };

  const addPhoto = async () => {
    try {
      await axios.post('http://localhost:8800/add-photo', { destinationID: id, photoURL });
      setPhotoURL('');
      const response = await axios.get(`http://localhost:8800/destinationphotos/${id}`);
      setPhotos(response.data);
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  const deletePhoto = async (photoURL) => {
    try {
      await axios.delete('http://localhost:8800/delete-photo', { data: { destinationID: id, photoURL } });
      const response = await axios.get(`http://localhost:8800/destinationphotos/${id}`);
      setPhotos(response.data);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="edit-container">
      <h2>Edit Destination</h2>
      <form className="edit-form">
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={destination.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={destination.description}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={destination.price}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Photo URL:</label>
          <input
            type="text"
            name="photoURL"
            value={destination.photoURL}
            onChange={handleInputChange}
          />
        </div>
      </form>
      <button className="edit-button" type="button" onClick={handleUpdateDestination}>Save Changes</button>

      <h3>Manage Photos</h3>
      <div className="photo-container">
        {photos.map(photo => (
          <div key={photo.photoURL}>
            <img src={photo.photoURL} alt="destination" />
            <button onClick={() => deletePhoto(photo.photoURL)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="photo-url-input">
        <input 
          type="text" 
          value={photoURL} 
          onChange={(e) => setPhotoURL(e.target.value)} 
          placeholder="Photo URL" 
        />
        <button type="button" onClick={addPhoto}>Add Photo</button>
      </div>
    </div>
  );
};

export default EditDestination;
