import React, { useState, useEffect } from 'react';
import { Eye, Heart, History, User } from 'lucide-react';
import { motion } from 'framer-motion';

type UserInteraction = {
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  lastViewedAt: string;
};

const Home = () => {
  const [activeTab, setActiveTab] = useState('views');
  const [viewers, setViewers] = useState<UserInteraction[]>([]);
  const [likes, setLikes] = useState<UserInteraction[]>([]);
  const [history, setHistory] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [viewersResponse, likesResponse, historyResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_IP}/profile-viewers`, {
          credentials: 'include',
        }),
        fetch(`${import.meta.env.VITE_BACKEND_IP}/profile-likes`, {
          credentials: 'include',
        }),
        fetch(`${import.meta.env.VITE_BACKEND_IP}/visit-history`, {
          credentials: 'include',
        })
      ]);

      const [viewersData, likesData, historyData] = await Promise.all([
        viewersResponse.json(),
        likesResponse.json(),
        historyResponse.json()
      ]);

      if (viewersData.success) {
        setViewers(viewersData.viewers);
      }
      if (likesData.success) {
        setLikes(likesData.likes);
      }
      if (historyData.success) {
        setHistory(historyData.history);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch profile interactions');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'views', label: 'Profile Views', icon: Eye, count: viewers.length },
    { id: 'likes', label: 'Likes Received', icon: Heart, count: likes.length },
    { id: 'history', label: 'Visit History', icon: History, count: history.length }
  ];

  const TabButton = ({ id, label, icon: Icon, count, isActive }:any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-between w-full p-4 rounded-xl transition-all
        ${isActive ? 'bg-[#e94057] text-white' : 'bg-[#2a2435] text-white/70 hover:bg-[#3a3445]'}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#e94057]'}`} />
        <span className="font-medium">{label}</span>
      </div>
      <span className="px-3 py-1 rounded-full bg-black/20 text-sm">
        {count}
      </span>
    </button>
  );

  const InteractionCard = ({ user }: { user: UserInteraction }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2a2435] rounded-xl p-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={user.profile_picture}
            alt={user.first_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#e94057]"
          />
        </div>
        <div>
          <h3 className="text-white font-medium">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-white/50">@{user.username}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-white/30">
          {new Date(user.lastViewedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </motion.div>
  );

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

  const getEmptyStateMessage = (tab: string) => {
    switch (tab) {
      case 'views':
        return "When someone views your profile, they'll appear here";
      case 'likes':
        return "When someone likes your profile, they'll appear here";
      case 'history':
        return "Profiles you've viewed will appear here";
      default:
        return "No data to display";
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625] mt-14">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Profile Interactions</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              count={tab.count}
              isActive={activeTab === tab.id}
            />
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 'views' && viewers.map((viewer) => (
            <InteractionCard key={`viewer-${viewer.username}`} user={viewer} />
          ))}
          
          {activeTab === 'likes' && likes.map((like) => (
            <InteractionCard key={`like-${like.username}`} user={like} />
          ))}
          
          {activeTab === 'history' && history.map((visit) => (
            <InteractionCard key={`visit-${visit.username}`} user={visit} />
          ))}
          
          {((activeTab === 'views' && viewers.length === 0) || 
            (activeTab === 'likes' && likes.length === 0) ||
            (activeTab === 'history' && history.length === 0)) && (
            <div className="bg-[#2a2435] rounded-xl p-8 text-center">
              <User className="w-12 h-12 text-[#e94057] mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">
                No {activeTab.replace('views', 'profile views')} yet
              </h3>
              <p className="text-white/50">
                {getEmptyStateMessage(activeTab)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;