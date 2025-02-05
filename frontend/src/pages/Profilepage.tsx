import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, ArrowLeft, Heart, MessageCircle, Phone, Video, Camera, MapPinned, Calendar, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';

type Profile = {
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  biography: string;
  location: string;
  distance: number;
  profile_picture: string;
  pics: string[];
  interests: string[];
  fame_rating: number;
  city: string;
};

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkIfLiked();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/profile/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await fetch(`http://localhost:3000/check-like/${username}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const toggleLike = async () => {
    try {
      const endpoint = isLiked ? 'unlike-user' : 'like-user';
      const response = await fetch(`http://localhost:3000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ likedUsername: username })
      });

      const data = await response.json();
      if (data.success) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <div className="text-[#e94057] bg-[#e94057]/10 px-4 py-2 rounded-lg">
          {error || 'Profile not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625] mt-14">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/discover')}
          className="mb-6 flex items-center text-white hover:text-[#e94057] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Go Back

        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photos Section */}
          <div className="relative aspect-[3/4] bg-[#2a2435] rounded-3xl overflow-hidden group">
            <motion.img
              key={currentPhoto}
              src={profile.pics[currentPhoto]}
              alt={`${profile.first_name}'s photo`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

            {/* Photo Navigation */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex space-x-1">
                {profile.pics.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentPhoto(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer
                      ${idx === currentPhoto ? 'w-8 bg-[#e94057]' : 'w-4 bg-white/50 hover:bg-[#e94057]/50'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentPhoto((prev) => (prev + 1) % profile.pics.length)}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm 
                  flex items-center justify-center border border-white/10 
                  text-white/90 hover:bg-black/50 transition-all"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Name */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profile.first_name} {profile.last_name}, {profile.age}
              </h1>
              <div className="flex items-center space-x-2 text-[#e94057]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">Fame Rating: {profile.fame_rating}</span>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-[#2a2435] rounded-3xl p-6 ">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={profile.profile_picture}
                      alt={profile.first_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#e94057]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e94057] flex items-center justify-center text-white text-xs font-bold">
                      {profile.age}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">@{profile.username}</h2>
                    <div className="text-[#e94057] text-sm font-medium">Online Now</div>
                  </div>
                </div>
              </div>

            </div>


            {/* Connect */}
            <div className='bg-[#2a2435] rounded-3xl p-6'>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-[#e94057]" />
                Connect
              </h3>
              <div className="flex space-x-3 gap-4 px-4">
                <ActionButton
                  onClick={toggleLike}
                  icon={<Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />}
                  variant={isLiked ? "primary" : "secondary"}
                />
                <ActionButton
                  onClick={() => navigate(`/chat/${username}`)}
                  icon={<MessageCircle className="w-6 h-6" />}
                  variant="secondary"
                />
                <ActionButton
                  onClick={() => navigate(`/call/audio/${username}`)}
                  icon={<Phone className="w-6 h-6" />}
                  variant="secondary"
                />
                <ActionButton
                  onClick={() => navigate(`/call/video/${username}`)}
                  icon={<Video className="w-6 h-6" />}
                  variant="secondary"
                />
              </div>

            </div>

            {/* Basic Info */}
            <div className="bg-[#2a2435] rounded-3xl p-6 ">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#e94057]" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={<User className="w-5 h-5" />}
                  label="Gender"
                  value={profile.gender}
                />
                <InfoCard
                  icon={<Calendar className="w-5 h-5" />}
                  label="Age"
                  value={`${profile.age} years`}
                />
                <InfoCard
                  icon={<MapPin className="w-5 h-5" />}
                  label="Distance"
                  value={`${profile.distance} km away`}
                />
                <InfoCard
                  icon={<MapPinned className="w-5 h-5" />}
                  label="Location"
                  value={`${profile.city}, ${profile.location}`}
                />
              </div>
            </div>

            {/* About Section */}
            <div className="bg-[#2a2435] rounded-3xl p-6 ">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-[#e94057]" />
                About Me
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {profile.biography}
              </p>
            </div>

            {/* Interests Section */}
            <div className="bg-[#2a2435] rounded-3xl p-6 ">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-[#e94057]" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-[#3a3445] rounded-full text-sm 
                      font-medium text-white hover:bg-[#e94057] transition-colors
                      border border-[#e94057]/10 hover:border-transparent cursor-pointer"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center space-x-3 bg-[#3a3445] rounded-xl p-3 border border-[#e94057]/10 hover:border-[#e94057]/20 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-[#4a4455] flex items-center justify-center text-[#e94057]">
      {icon}
    </div>
    <div>
      <div className="text-white/50 text-sm">{label}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
  </div>
);

const ActionButton = ({
  onClick,
  icon,
  variant = 'secondary'
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary';
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all
      ${variant === 'primary'
        ? 'bg-[#e94057] text-white hover:bg-[#e94057]/90 ring-2 ring-[#e94057]/50'
        : 'bg-[#3a3445] text-white/90 hover:bg-[#4a4455] hover:text-[#e94057]'
      }
    `}
  >
    {icon}
  </motion.button>
);

export default ProfilePage;

