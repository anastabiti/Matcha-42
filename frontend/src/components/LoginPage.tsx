import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  function handleDiscordLogin() {
    window.location.href = "http://localhost:3000/api/auth/discord";
  }

  function handleGoogleLogin() {
    window.location.href = "http://localhost:3000/api/auth/google";
  }

  function handleIntraLogin() {
    window.location.href = "http://localhost:3000/api/auth/intra42";
  }

  async function handleSubmit(e) {
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
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful!");
        setSuccess("Logged in successfully. Redirecting to your HomePage...");
        navigate("/discover");
        setFormData({
          username: "",
          password: "",
        });
      } else if (response.status === 201) {
        navigate("/setup");
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
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Login to Your Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                value={formData.username}
                onChange={handleInputChange}
                required
              />

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-500 text-sm">{success}</div>}

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={isLoading}
                sx={{ py: 1.5, borderRadius: 3 }}
              >
                {isLoading ? "Welcome back..." : "Log in"}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-4">
              <Button
                // variant="contained"
                onClick={handleDiscordLogin}
                startIcon={
                  <img
                    src="/discord-mark-white.svg"
                    alt="Discord"
                    style={{ width: 20, height: 20 }}
                  />
                }
                sx={{ borderRadius: 3 }}
              >
                Discord
              </Button>

              <Button
                // variant="contained"
                onClick={handleGoogleLogin}
                startIcon={<GoogleIcon />}
                sx={{ borderRadius: 3 }}
              >
                Google
              </Button>

              <Button
                // variant="contained"
                onClick={handleIntraLogin}
                startIcon={<img src="42-Final-sigle-seul.svg" width={25} alt="42" />}
                sx={{ borderRadius: 3 }}
              >
                Intra
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                component={Link}
                to="/resetPassword"
                variant="contained"
                color="inherit"
                fullWidth
                sx={{ py: 1, borderRadius: 3 }}
              >
                Reset Password
              </Button>
              
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1, borderRadius: 3 }}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;