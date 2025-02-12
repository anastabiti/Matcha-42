import React from 'react';
import { Heart, Star, User, MessageCircle, Search, LogOut } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="h-16 px-6 flex items-center justify-between bg-[#2a2435] border-b border-[#3a3445]">
      {/* Logo & Location */}
      <div className="flex items-center">
        <h1 className="text-[#e94057] text-2xl font-bold mr-8">Matcha</h1>
        <div className="hidden md:flex items-center text-gray-400">
          <span className="text-sm">Chicago, Il</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 hidden md:flex justify-center items-center space-x-8">
        <a href="#discover" className="flex items-center text-[#e94057] hover:text-[#e94057]/80 transition-colors">
          <Search className="w-5 h-5 mr-2" />
          <span>Discover</span>
        </a>
        <a href="#matches" className="flex items-center text-gray-400 hover:text-[#e94057] transition-colors">
          <Heart className="w-5 h-5 mr-2" />
          <span>Matches</span>
        </a>
        <a href="#messages" className="flex items-center text-gray-400 hover:text-[#e94057] transition-colors">
          <MessageCircle className="w-5 h-5 mr-2" />
          <span>Messages</span>
        </a>
        <a href="#profile" className="flex items-center text-gray-400 hover:text-[#e94057] transition-colors">
          <User className="w-5 h-5 mr-2" />
          <span>Profile</span>
        </a>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <button className="hidden md:flex items-center text-gray-400 hover:text-[#e94057] transition-colors">
          <LogOut className="w-5 h-5" />
        </button>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-6">
          <a href="#discover" className="text-[#e94057]">
            <Search className="w-6 h-6" />
          </a>
          <a href="#matches" className="text-gray-400">
            <Heart className="w-6 h-6" />
          </a>
          <a href="#messages" className="text-gray-400">
            <MessageCircle className="w-6 h-6" />
          </a>
          <a href="#profile" className="text-gray-400">
            <User className="w-6 h-6" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;