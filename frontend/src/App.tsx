import "./App.css";
import {
  Route,
  Routes,
  BrowserRouter,

} from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import LoginPage from "./components/LoginPage";
import Setup_page from "./components/setup_page";
import Layout from "./Layout";
import ResetPassword from "./components/resetPassword";
import Profile from "./pages/Profile";
import DiscoverPage from "./pages/Discover";
import IsLogged from "./components/Is_Logged";
import Chat from "./components/Chat";
import ProfilePage from "./pages/Profilepage";
import MatchedPage from "./pages/matches";
import ChatUserList from "./components/ChatUserList";
import Home from "./pages/Home";
import RequireSetup from "./components/RequireSetup_middleware";

// const Logged_so_no_access_to_loginpage = () => {
//   const [user, setUser] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_BACKEND_IP}/api/user/is_logged`,
//           {
//             method: "GET",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json"
//             }
//           }
//         );

//         if (response.ok) {
//           setUser(true);
//         } else {
//           setUser(false);
//         }
//       } catch (error) {
//         setUser(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   // If the user is authenticated , render the nested routes using <Outlet />.
//   // If the user is not authenticated , redirect them to the login page using <Navigate />.
//   return user ? <Navigate to="/discover" /> : <Outlet />;
// };

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          {/* <Route element={<Logged_so_no_access_to_loginpage />}> */}
            <Route path="/login" element={<LoginPage />} />
          {/* </Route> */}
          <Route path="/resetPassword" element={<ResetPassword />} />

            <Route element={<IsLogged />}>
              <Route path="/setup" element={<Setup_page />} />
          <Route element={<Layout />}>
              <Route element={<RequireSetup />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/messages" element={<ChatUserList />} />
              <Route path="matches" element={<MatchedPage />} />
              <Route path="/"  element={<Home/>}/>
              <Route path="/chat/:username" element={<Chat />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
