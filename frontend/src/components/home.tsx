import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import FacebookIcon from "@mui/icons-material/Facebook";
// https://mui.com/material-ui/material-icons/?srsltid=AfmBOopJikFhdTyZ7jeW_GHSILmUTDSBVafswowgwSgwNmSJRP6PpTKQ&query=google&selected=Google
import GoogleIcon from "@mui/icons-material/Google";
const Home_page = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", //need it to save the session  cookie in the browser
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful!");
        setSuccess("Logged in successfully. Redirecting to your HomePage...");
        // Redirect to HomePage
        navigate("/home");
        setFormData({
          username: "",
          password: "",
        });
      } else {
        console.log(data, " error");

        setError(data || "Login failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlelogout = async (e) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", //need it to save the session  cookie in the browser
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Logout successful!");
        setSuccess("Logout successfully.");
        setFormData({
          username: "",
          password: "",
        });
        navigate("/login");
      } else {
        console.log(data, " error");

        setError(data || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        
      <div className="w-full max-w-md">
        
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="space-y-6 text-white">HOME PAGE</div>
          <button
            onClick={handlelogout}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
          >
            log out
          </button>
        
        </div>
      </div>
    </div>
  );
};

export default Home_page;
