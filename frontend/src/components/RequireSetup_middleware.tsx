import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const RequireSetup = () => {
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_IP}/api/user/has_completed_setup`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (response.ok) {
          setSetupCompleted(true);
        } else {
          setSetupCompleted(false);
        }
      } catch (error) {
        setSetupCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, []);

  if (loading) return <div>Loading...</div>;

  // If the setup is complete, render the nested routes.
  // Otherwise, redirect to the setup page.
  return setupCompleted ? <Outlet /> : <Navigate to="/setup" replace />;
};

export default RequireSetup;
