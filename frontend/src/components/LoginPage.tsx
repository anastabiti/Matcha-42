import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GoogleButton from "react-google-button";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

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
      });

      const data = await response.json();

      if (response.ok) {
        console.log(
          "Login successful!"
        );
        setSuccess(
          "Logged in successfully. Redirecting to your HomePage..."
        );
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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Login to  Your Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
             

              <input
                type="text"
                placeholder="Username"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />

            

              <div className="relative">
                <input
                  type="text"
                  placeholder="Password"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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
                disabled={isLoading}
              >
                {isLoading ? "Welcome back  ..." : "Log in"}
              </button>
            </form>
            <div className="flex items-center justify-center">
              <GoogleButton
                label="Sign up"
                onClick={() => {
                  //new link
                  window.location.href = "http://localhost:3000/api/auth/google";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
