import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Button
} from "@mui/material";
import axios from "axios";
type Coordinates = {
  latitude: number;
  longitude: number;
  city?: string
  country?: string
};

const Gps = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
    /*
    getCurrentPosition(success)
    getCurrentPosition(success, error)
    getCurrentPosition(success, error, options)
 */
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        try {
          let coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(coords);
          await saveLocation(coords);
        } catch (err) {
          setError("Failed to save location to server");
        } finally {
          setLoading(false);
        }
      },
      function (_error) {
        setError(
          "Unable to retrieve your location. Please enable location services in your browser."
        );
        fetch(`${import.meta.env.VITE_BACKEND_IP}/api/location/WTK`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        }).catch(function () { });
        setLoading(false);
      }
    );
  }, []);
  const getCityName = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const address = response.data.address;
      return address.city || address.town || address.village || "Unknown Location";
    } catch (err) {
      // console.error("Failed to get city name:", err);
      return "Unknown Location";
    }
  };
  const getCountryName = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const address = response.data.address;
      return address.country
    } catch (err) {
      console.error("Failed to get city name:", err);
      return "Unknown Location";
    }
  };


  const saveLocation = async (coords: Coordinates) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_IP}/api/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(coords)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save location");
      }


      // Get city name
      const city = await getCityName(coords.latitude, coords.longitude);
      const country = await getCountryName(coords.latitude, coords.longitude);

      setLocation({ ...coords, city, country });
      setLoading(false);
      return
    } catch (err) {
      setError("Failed to save location to server");
    }
  };

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async function (position) {
        try {
          let coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(coords);
          await saveLocation(coords);
        } catch (err) {
          setError("Failed to save location to server");
        } finally {
          setLoading(false);
        }
      },
      function (_error) {
        setError(
          "Unable to retrieve your location. Please enable location services in your browser."
        );
        fetch(`${import.meta.env.VITE_BACKEND_IP}/api/location/WTK`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        }).catch(function () { });
        setLoading(false);
      }
    );
  };


/*
 * [Violation Fix] Browser Geolocation Security Policy
 * 
 * Issue:
 * Browser throws violation warning when geolocation is requested automatically on component mount
 * Error: "[Violation] Only request geolocation information in response to a user gesture."
 * 
 * Solution:
 * - Removed automatic geolocation request from useEffect
 * - Added explicit user interaction (button click) to trigger location request
 * - Location data is now only fetched after user clicks "Get My Location" button
 * 
 * This change complies with browser security policies that require user consent
 * and explicit interaction before accessing sensitive APIs like geolocation.
 * 
 * @ https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
 */
  return (
    <div className="max-w-[600px] mx-auto p-3">
      <div className="flex flex-col space-y-3">
        <Button
          variant="contained"
          onClick={handleGetLocation}
          disabled={loading} //revents multiple simultaneous location requests and provides visual feedback to users. 
          fullWidth
        >
          {loading ? "Getting Location..." : "Get My Location"}
        </Button>

        {loading && (
          <div className="flex justify-center p-2">
            <CircularProgress />
          </div>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {location && (
          <Card>
            <CardContent>
              <Typography variant="body1" className="mb-2">
                City: {location.city}
              </Typography>
              <Typography variant="body1" className="mb-2">
                Country: {location.country}
              </Typography>
              <Typography variant="h6" className="mb-2">
                Your Current Location
              </Typography>
              <Typography>Latitude: {location.latitude}</Typography>
              <Typography>Longitude: {location.longitude}</Typography>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Gps;
