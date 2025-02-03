import Navigation from "./components/Navigation"
import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#1a1625] text-white">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout