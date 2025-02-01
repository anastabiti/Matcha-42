import { Heart, User, MessageCircle, Search, LogOut, Bell } from 'lucide-react';
import { NavLink as RouterLink } from 'react-router-dom';

// import { useNavigate } from "react-router-dom";
import { Settings } from 'lucide-react';

// const handlelogout = async () => {
//   const navigate = useNavigate()


//   try {
//     const response = await fetch("http://localhost:3000/api/logout", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       }, 
//       credentials: "include",
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log("Logout successful!");
     
//       navigate("/login");
//     } else {
//       console.log(data, " error");

//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const Navigation = () => (
  <nav className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between bg-[#2a2435] border-b border-[#3a3445] fixed top-0 w-full z-50">
    <RouterLink to="/" className="text-[#e94057] text-2xl lg:text-3xl font-bold">
      Matcha
    </RouterLink>

    <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-auto space-x-12">
      <NavLink to="/discover" icon={<Search />} text="Discover" />
      <NavLink to="/matches" icon={<Heart />} text="Matches" />
      <NavLink to="/messages" icon={<MessageCircle />} text="Messages" />
      <NavLink to="/profile" icon={<User />} text="Profile" />
      <NavLink to="/notifications" icon={<Bell />} text="" />


    </div>

    <div className="flex md:hidden items-center space-x-8">
      <MobileNavLink to="/discover" icon={<Search />} />
      <MobileNavLink to="/matches" icon={<Heart />} />
      <MobileNavLink to="/messages" icon={<MessageCircle />} />
      <MobileNavLink to="/notifications" icon={<Bell />} />
      <MobileNavLink to="/profile" icon={<User />} />
    </div>

    <button  className="hidden md:flex items-center text-gray-400 hover:text-[#e94057] transition-colors">
      <LogOut className="w-5 h-5" />
    </button>
    
  </nav>
);

const NavLink = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => (
  <RouterLink
    to={to}
    className={({ isActive }) => `
      flex items-center space-x-2 text-base lg:text-lg font-medium
      ${isActive ? 'text-[#e94057]' : 'text-gray-400 hover:text-[#e94057]'}
      transition-colors
    `}
  >
    <span className="w-5 h-5">{icon}</span>
    <span>{text}</span>
  </RouterLink>
);

const MobileNavLink = ({ to, icon }: { to: string; icon: React.ReactNode }) => (
  <RouterLink
    to={to}
    className={({ isActive }) => `
      block w-6 h-6
      ${isActive ? 'text-[#e94057]' : 'text-gray-400'}
    `}
  >
    {icon}
  </RouterLink>
);

export default Navigation;