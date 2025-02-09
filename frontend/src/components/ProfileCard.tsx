import { MapPin, User } from 'lucide-react';
import { Profile } from '../types/types';


type ProfileCardProps = {
    profile: Profile;
    currentPhoto: number;
};

export const ProfileCard = ({
    profile,
    currentPhoto,
}: ProfileCardProps) => {
    const hasPhotos = profile.pics[0] && profile.pics[0].length > 0;

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

            {hasPhotos ? (
                <img
                    src={profile.pics[currentPhoto]}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-32 h-32 text-gray-400" />
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-6">
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