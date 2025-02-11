import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isResetPage, setIsResetPage] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setIsResetPage(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isResetPage) {
      try {
        const token = searchParams.get("token");
        const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/reset_it`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess("Password updated successfully!");
          setFormData({
            email: "",
            password: "",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError(data || "Password update failed. Please try again.");
        }
      } catch (error) {
        console.log(error);
        setError("Unable to connect to server. Please try again later.");
      }
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/password_reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Resetting password successfully. Check your Email...");
        setFormData({
          email: "",
          password: "",
        });
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              {isResetPage ? "Set New Password" : "Reset Password"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isResetPage ? (
                <div>
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
              ) : (
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                    value={formData.password}
                    autoComplete="new-password" 
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && (
                <div className="text-green-500 text-sm">{success}</div>
              )}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
              >
                {isResetPage ? "Update Password" : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;