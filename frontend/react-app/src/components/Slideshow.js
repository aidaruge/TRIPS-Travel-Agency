import React, { useState, useEffect } from 'react';
import './Slideshow.css'; // Import your CSS file for styling

function Slideshow({ images }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to move to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? images.length - 1 : prevSlide - 1));
  };

  // Function to move to the next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [images.length]);

  return (
    <div className="slideshow">
      <button className="arrow left" onClick={prevSlide}>&#10094;</button>
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Slide ${index + 1}`}
          className={index === currentSlide ? 'active' : ''}
        />
      ))}
      <button className="arrow right" onClick={nextSlide}>&#10095;</button>
    </div>
  );
}

export default Slideshow;
