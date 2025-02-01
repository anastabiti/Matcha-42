import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import RegistrationForm from './components/RegistrationForm'
import LoginPage from './components/LoginPage'

import Home_page from './components/home'
import Setup_page from './components/setup_page'
import Layout from './Layout'
import ResetPassword from './components/resetPassword'

import Profile from './pages/Profile'
import IsLogged from './components/Is_Logged'
import Chat from './components/Chat'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>

          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/resetPassword" element={<ResetPassword />} />

          {/* <Route element={<Layout />}>
            <Route path="/home" element={<Home_page />} />
            <Route path="/setup" element={<Setup_page />} />
            <Route path="/profile" element={<Profile />} />
          </Route> */}
           <Route element={<Layout />}>
          <Route element={<IsLogged />}>
            <Route path="/home" element={<Home_page />} />
            <Route path="/setup" element={<Setup_page />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App