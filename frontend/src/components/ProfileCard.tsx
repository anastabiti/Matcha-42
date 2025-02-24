import  { useState } from 'react';
import { MapPin, User } from 'lucide-react';

import { Profile } from '../types/types';

type ProfileCardProps = {
    profile: Profile;
    currentPhoto: number;
};

const LoadingDots = () => {
    return (
        <div className="flex space-x-2 justify-center items-center h-full">
            <div className="w-3 h-3 bg-[#e94057] rounded-full animate-[bounce_1s_infinite_0ms]"></div>
            <div className="w-3 h-3 bg-[#e94057] rounded-full animate-[bounce_1s_infinite_200ms]"></div>
            <div className="w-3 h-3 bg-white/80 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
        </div>
    );
};

export const ProfileCard = ({
    profile,
    currentPhoto,
}: ProfileCardProps) => {
    const [imageLoading, setImageLoading] = useState(true);
    const hasPhotos = profile.pics[0] && profile.pics[0].length > 0;

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-10" />

            {hasPhotos ? (
                <>
                    {imageLoading && (
                        <div className="absolute inset-0 bg-[#2a2435] flex items-center justify-center z-20">
                            <LoadingDots />
                        </div>
                    )}
                    <img
                        src={profile.pics[currentPhoto]}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onLoad={handleImageLoad}
                        style={{ opacity: imageLoading ? 0 : 1 }}
                    />
                </>
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-32 h-32 text-gray-400" />
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                <div className="space-y-2">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">
                        {profile.name}, {profile.age}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-lg text-white/90 font-medium">
                            {profile.preview.interests.slice(0, 2).join(', ')}
                        </span>
                        <span className="flex items-center text-white/75">
                            <MapPin className="w-4 h-4 mr-1" />
                            {profile.distance} km
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;