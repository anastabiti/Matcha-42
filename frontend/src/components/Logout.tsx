import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/logout`, {
        method: "POST", 
        credentials: "include", 
      });

      if (response.ok) {
        console.log("log out done")
        window.location.href = "/login"; 
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="hidden md:flex items-center text-gray-400 hover:text-[#e94057] transition-colors"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
};

export default LogoutButton;
