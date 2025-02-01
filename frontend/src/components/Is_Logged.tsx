import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const IsLogged = () => {
    const [user, setUser] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user/is_logged', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setUser(true);
        } else {
          setUser(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(false);
      } finally {
        setLoading(false); 
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
// If the user is authenticated , render the nested routes using <Outlet />.
// If the user is not authenticated , redirect them to the login page using <Navigate />.
  return user ? <Outlet /> : <Navigate to="/login" replace />;//https://www.youtube.com/watch?v=pyfwQUc5Ssk
};

export default IsLogged;