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
    window.location.href = `${import.meta.env.VITE_BACKEND_IP}/api/auth/discord`;
  }

  function handleGoogleLogin() {
    window.location.href = `${import.meta.env.VITE_BACKEND_IP}/api/auth/google`;
  }

  function handleIntraLogin() {
    window.location.href = `${import.meta.env.VITE_BACKEND_IP}/api/auth/intra42`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/login`, {
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
                minLength={6}
                maxLength={20}
                placeholder="Username"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username" //to fix this [DOM] Input elements should have autocomplete attributes (suggested: "username"): (More info: https://goo.gl/9p2vKq) <input type=​"text" name=​"username" minlength=​"6" maxlength=​"20" placeholder=​"Username" class=​"w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400" required value>​
                required
              />

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  maxLength={50}
                  placeholder="Password"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password" //fix [DOM] Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) <input type=​"password" name=​"password" minlength=​"8" maxlength=​"50" placeholder=​"Password" class=​"w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400" required value>​
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