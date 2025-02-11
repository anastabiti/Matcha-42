import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Video, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

type Match = {
  id: string;
  username: string;
  name: string;
  age: number;
  profile_picture: string;
  isOnline: boolean;
};

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/matches`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setMatches(data.data);
      } else {
        setError(data.error || 'Failed to fetch matches');
      }
    } catch (error) {
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 rounded-full bg-[#e94057]/20"></div>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-[#e94057]/20 rounded"></div>
            <div className="h-4 w-32 bg-[#e94057]/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <div className="text-[#e94057] bg-[#e94057]/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <div className="text-center px-4">
          <Heart className="w-16 h-16 text-[#e94057] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No matches yet</h2>
          <p className="text-gray-400 mb-6">Keep exploring to find your perfect match!</p>
          <button
            onClick={() => navigate('/discover')}
            className="px-6 py-3 bg-[#e94057] text-white rounded-full font-medium hover:bg-[#e94057]/90 transition-colors"
          >
            Discover People
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625] pt-16">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-8">Your Matches</h1>

        <div className="space-y-4">
          {matches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#2a2435] rounded-2xl p-4 border border-[#3a3445]"
            >
              <div className="flex items-center justify-between">
                {/* Profile Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={match.profile_picture}
                      alt={match.name}
                      className="w-14 h-14 rounded-full object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${match.username}`)}
                    />
                    {match.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2a2435]" />
                    )}
                  </div>
                  <h3
                    className="text-white font-medium cursor-pointer hover:text-[#e94057]"
                    onClick={() => navigate(`/profile/${match.username}`)}
                  >
                    {match.name}, {match.age}
                  </h3>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <ActionButton
                    icon={<MessageCircle className="w-5 h-5" />}
                    onClick={() => navigate(`/chat/${match.username}`)}
                    tooltip="Send Message"
                  />
                  <ActionButton
                    icon={<Phone className="w-5 h-5" />}
                    onClick={() => navigate(`/call/audio/${match.username}`)}
                    tooltip="Voice Call"
                  />
                  <ActionButton
                    icon={<Video className="w-5 h-5" />}
                    onClick={() => navigate(`/call/video/${match.username}`)}
                    tooltip="Video Call"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({
  icon,
  onClick,
  tooltip
}: {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="w-10 h-10 rounded-full bg-[#3a3445] hover:bg-[#e94057] 
      text-white flex items-center justify-center transition-colors
      relative group"
  >
    {icon}
    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 
      bg-[#3a3445] text-xs rounded opacity-0 group-hover:opacity-100 
      whitespace-nowrap transition-opacity">
      {tooltip}
    </span>
  </motion.button>
);

export default Matches;