import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

export const useJwtDecode = () => {
  const [decodedToken, setDecodedToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
        setIsAdmin(decoded.role === 'admin');
      } catch (error) {
        console.error('Error decoding token:', error);
        setDecodedToken(null);
        setIsAdmin(false);
      }
    } else {
      setDecodedToken(null);
      setIsAdmin(false);
    }
  }, []);

  return { decodedToken, isAdmin };
}; 