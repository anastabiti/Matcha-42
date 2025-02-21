import { useState } from "react";
import {  useNavigate } from "react-router-dom";

// https://mui.com/material-ui/material-icons/?srsltid=AfmBOopJikFhdTyZ7jeW_GHSILmUTDSBVafswowgwSgwNmSJRP6PpTKQ&query=google&selected=Google
const Home_page = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");

  // Handle form submission
 
  const handlelogout = async () => {


    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", //need it to save the session  cookie in the browser
      });


      if (response.ok) {
        setFormData({
          username: "",
          password: "",
        });
        navigate("/login");
      } else {

      }
    } catch (error) {
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
