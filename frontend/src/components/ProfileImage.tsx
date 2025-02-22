import React, { useMemo, useState } from 'react';
import { User, Camera, Star } from 'lucide-react';

interface ProfileImageProps {
  imageUrl?: string ;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  imageUrl, 
  alt, 
  className = '', 
  containerClassName = '' 
}) => {
  // Check if imageUrl is empty, undefined, null, or just whitespace
  const isValidUrl = Boolean(imageUrl?.trim?.());

  const FallbackAvatar: React.FC<{ className: string }> = ({ className }) => (
    <div className={`bg-[#3a3445] flex items-center justify-center ${className}`}>
      <User className="w-1/2 h-1/2 text-[#e94057]" />
    </div>
  );

  if (!isValidUrl) {
    return <FallbackAvatar className={containerClassName} />;
  }

  const handleImageError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const target = e.currentTarget;
    target.onerror = null;
    
    const fallbackContainer = document.createElement('div');
    fallbackContainer.className = `${containerClassName} bg-[#3a3445] flex items-center justify-center`;
    
    const userIcon = document.createElement('div');
    userIcon.className = 'w-1/2 h-1/2 text-[#e94057]';
    userIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`;
    
    fallbackContainer.appendChild(userIcon);
    
    if (target.parentElement) {
      target.parentElement.replaceChild(fallbackContainer, target);
    }
  };

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};



import { motion } from 'framer-motion';

interface PhotoSectionProps {
  pics: string[];
  firstName: string;
  lastName: string;
  age: number;
  fameRating: number;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({
  pics,
  firstName,
  lastName,
  age,
  fameRating
}) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  
  // Filter out empty strings and get valid photos
  const validPhotos = useMemo(() => {
    return pics.filter(url => url?.trim()?.length > 0);
  }, [pics]);


  // If no valid photos, show single avatar
  if (validPhotos.length === 0) {
    return (
      <div className="relative aspect-[3/4] bg-[#2a2435] rounded-3xl overflow-hidden group">
        <div className="w-full h-full flex items-center justify-center bg-[#3a3445]">
          <User className="w-1/3 h-1/3 text-[#e94057]" />
        </div>
        
        {/* Profile Name */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="text-4xl font-bold text-white mb-2">
            {firstName} {lastName}, {age}
          </h1>
          <div className="flex items-center space-x-2 text-[#e94057]">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">Fame Rating: {fameRating}</span>
          </div>
        </div>
      </div>
    );
  }

  // Show photo gallery with valid photos
  return (
    <div className="relative aspect-[3/4] bg-[#2a2435] rounded-3xl overflow-hidden group">
      <motion.div
        key={currentPhoto}
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <img 
          src={validPhotos[currentPhoto]} 
          alt={`${firstName}'s photo ${currentPhoto + 1}`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Photo Navigation - Only show if there are multiple valid photos */}
      {validPhotos.length > 1 && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex space-x-1">
            {validPhotos.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPhoto(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer
                  ${idx === currentPhoto ? 'w-8 bg-[#e94057]' : 'w-4 bg-white/50 hover:bg-[#e94057]/50'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentPhoto((prev) => (prev + 1) % validPhotos.length)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm 
              flex items-center justify-center border border-white/10 
              text-white/90 hover:bg-black/50 transition-all"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Profile Name */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          {firstName} {lastName}, {age}
        </h1>
        <div className="flex items-center space-x-2 text-[#e94057]">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">Fame Rating: {fameRating}</span>
        </div>
      </div>
    </div>
  );
};

