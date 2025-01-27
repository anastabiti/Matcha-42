import { useState } from "react";
import GoogleButton from "react-google-button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/password_reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Resetting passwrod successfully. Check your Email...");
        setFormData({
          email: "",
        });
        //redirect to login page

        // Delay redirect by 2 seconds to show success message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.log(data, " error");

        setError(data || "Resetting failed. Please try again.");
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
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Reset Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              {success && (
                <div className="text-green-500 text-sm">{success}</div>
              )}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
              >
                {"Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
