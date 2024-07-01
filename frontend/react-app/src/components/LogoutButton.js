import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const LogoutButton = () => {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      // Clear session cookie
      await axios.get('http://localhost:8800/logout');
      
      // Redirect the user to the same page or any other desired page
      history.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Optional: Perform logout immediately when component mounts
  useEffect(() => {
    handleLogout();
  }, []);

  return null; // You can render a button or any UI element here if needed
};

export default LogoutButton;
