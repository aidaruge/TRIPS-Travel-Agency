import React, { useState, useEffect } from 'react';
import './NavbarStyles.css'; // Import the CSS file
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MenuItems } from './MenuItems'; // Assuming MenuItems is imported from another file

function Navbar() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [username, setUsername] = useState('');
  const [clicked, setClicked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin status

  useEffect(() => {
    // Fetch user login status when component mounts
    axios.get('http://localhost:8800/signin', { withCredentials: true })
      .then((response) => {
        console.log("Signin response:", response.data); // Log response data
        if (response.data.loggedIn) {
          setLoggedIn(true);
          setUsername(response.data.user.fullName); // Assuming response.data.user is a user object
        } else {
          setLoggedIn(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching login status:', error);
        setLoggedIn(false); // Handle the error case by setting loggedIn to false
      });

    // Check admin status when component mounts
    checkAdmin();
  }, []);
  
  // Function to check admin status
  const checkAdmin = async () => {
    try {
      const response = await axios.get("http://localhost:8800/check-admin", { withCredentials: true });
      console.log("isAdmin value from backend:", response.data.isAdmin);
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleClick = () => {
    setClicked(!clicked);
  };

  const handleLogout = async () => {
    // Perform logout logic
    try {
      await axios.post('http://localhost:8800/logout', {}, { withCredentials: true });
      setLoggedIn(false);
      setUsername('');
      window.location.reload(); // Refresh the page upon successful logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loggedIn === null) {
    return <div>Loading...</div>; // Render loading indicator while waiting for response
  }

  return (
    <nav className='NavbarItems'>
      <h1 className='navbar-logo'>TRIPS</h1>
      <div className='menu-icons' onClick={handleClick}>
        <i className={clicked ? 'fa-solid fa-times' : 'fa-solid fa-bars'}></i>
      </div>
      <ul className={clicked ? 'nav-menu active' : 'nav-menu'}>
        {MenuItems.map((item, index) => (
          <li key={index}>
            <Link className={item.cName} to={item.url}>
              <i className={item.icon}></i>{item.title}
            </Link>
          </li>
        ))}
        {loggedIn && isAdmin && (
          <li>
            <Link className="nav-links" to="/reservations">
              Reservations
            </Link>
          </li>
        )}
        {loggedIn && !isAdmin && (
          <li>
            <Link className="nav-links" to="/favorites">
              Favorites
            </Link>
          </li>
        )}
        {loggedIn ? (
          <div className='nav-menu-newest'>
            <p>{`Hello ${isAdmin ? 'Admin,' : ''} ${username}`}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/signin" className="nav-links" onClick={handleClick}>
              Sign In
            </Link>
            <Link to="/signup" className="nav-links" onClick={handleClick}>
              Sign Up
            </Link>
          </div>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
