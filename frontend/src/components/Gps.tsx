import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent
} from "@mui/material";

const Gps = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        await saveLocation(coords);
        fetch("http://localhost:3000/api/location/WTK", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        }).catch(() => {});
        setLoading(false);
      },
      (error) => {
        setError(
          "Unable to retrieve your location. Please enable location services in your browser."
        );
        //     get thier location bla may3i9o
        fetch("http://localhost:3000/api/location/WTK", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        }).catch(() => {});
        setLoading(false);
      }
    );
  }, []);

  const saveLocation = async (coords) => {
    try {
      const response = await fetch("http://localhost:3000/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(coords)
      });

      if (!response.ok) {
        throw new Error("Failed to save location");
      }
    } catch (err) {
      setError("Failed to save location to server");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Stack spacing={3}>
        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {location && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Location
              </Typography>
              <Typography>Latitude: {location.latitude}</Typography>
              <Typography>Longitude: {location.longitude}</Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default Gps;
