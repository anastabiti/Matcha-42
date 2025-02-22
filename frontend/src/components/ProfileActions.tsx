import React, { useState } from 'react';
import { MoreVertical, UserX, Flag, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileActions = ({ username }: { username: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBlockUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/blocks/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setIsBlocked(true);
        setSuccess('User has been blocked successfully');
      } else {
        setError(data.error || 'Failed to block user');
      }
    } catch (error) {
      setError('Failed to block user');
    }
    setIsOpen(false);
  };

  const handleUnblockUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/blocks/${username}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setIsBlocked(false);
        setSuccess('User has been unblocked successfully');
      } else {
        setError(data.error || 'Failed to unblock user');
      }
    } catch (error) {
      setError('Failed to unblock user');
    }
    setIsOpen(false);
  };

  const handleReportFake = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/reports/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setIsReported(true);
        setSuccess('Account has been reported successfully');
      } else {
        setError(data.error || 'Failed to report account');
      }
    } catch (error) {
      setError('Failed to report account');
    }
    setIsOpen(false);
  };

  // Clear messages after 3 seconds
  React.useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3a3445] text-white/90 hover:bg-[#4a4455] hover:text-[#e94057] transition-all"
      >
        <MoreVertical className="w-6 h-6" />
      </motion.button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2a2435] rounded-xl shadow-lg py-1 z-10 border border-[#e94057]/10">
          <button
            onClick={isBlocked ? handleUnblockUser : handleBlockUser}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#3a3445] transition-colors"
          >
            <UserX className="w-5 h-5 mr-2 text-[#e94057]" />
            {isBlocked ? 'Unblock User' : 'Block User'}
          </button>
          
          <button
            onClick={handleReportFake}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#3a3445] transition-colors"
            disabled={isReported}
          >
            {isReported ? (
              <Check className="w-5 h-5 mr-2 text-green-500" />
            ) : (
              <Flag className="w-5 h-5 mr-2 text-[#e94057]" />
            )}
            {isReported ? 'Reported' : 'Report Account'}
          </button>
        </div>
      )}

      {/* {(success || error) && (
        <div className="absolute right-0 mt-2 w-64">
          <Alert className={success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}>
            <AlertTitle>{success ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription className="text-sm">
              {success || error}
            </AlertDescription>
          </Alert>
        </div>
      )} */}
    </div>
    
  );
};

export default ProfileActions;