import { useEffect, useState } from 'react';
import { Heart, Star, X, MapPin, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Profile = {
    id: number;
    name: string;
    age: number;
    distance: string;
    bio: string;
    interests: string[];
    pics: string[];
    profile_picture: string;
};

const DiscoverPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const [user, setUser] = useState<any>([]);

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function likUser() {
        try {
            const response = await fetch("http://localhost:3000/like-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({
                    likedUsername: user[currentIndex].username
                })
            });

            const res = await response.json();
            console.log("res", res);
            
            // After successful like, move to next profile
            if (res.success) {
                handleSwipe('right');
            }
        }
        catch (error) {
            console.log("error", error);
        }
    }

    async function fetchProfiles() {
        try {
            const response = await fetch("http://localhost:3000/potential-matches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
            });

            const res = await response.json();
            if (res.success) {
                setUser(res.data);
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    const handleSwipe = (direction: 'left' | 'right') => {
        if (currentIndex < user.length - 1) {
            setExitDirection(direction);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setCurrentPhoto(0);
                setExitDirection(null);
            }, 300);
        }
    };

    const handleLike = async () => {
        await likUser();
    };

    const nextPhoto = () => {
        setCurrentPhoto(prev =>
            prev < user[currentIndex].pics.length - 1 ? prev + 1 : 0
        );
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#1a1625]">
            <div className="h-full max-w-[2000px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-6">
						<div className="flex-1 relative h-[70vh] lg:h-full">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative w-full max-w-xl aspect-[3/4] overflow-hidden">
							<AnimatePresence>
								{user.map((profile: any, index: any) => (
									index >= currentIndex && (
										<motion.div
											key={profile.id}
											initial={{ scale: index === currentIndex ? 1 : 0.95 }}
											animate={index === currentIndex ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.5 }}
											exit={exitDirection === 'left'
												? { x: '-100%', opacity: 0, rotate: -20 }
												: { x: '100%', opacity: 0, rotate: 20 }
											}
											transition={{ duration: 0.3 }}
											className="absolute inset-0"
											style={{ zIndex: user.length - index }}
										>
											<ProfileCard
												profile={profile}
												currentPhoto={currentPhoto}
												onPhotoClick={nextPhoto}
											/>
										</motion.div>
									)
								))}
							</AnimatePresence>
						</div>
					</div>
				</div>

 				<div className="hidden  lg:block w-96 h-[40vh] xl:w-[30rem] ">
 					{currentIndex < user.length && (
 						<div className="h-full flex flex-col">
 							<div className="bg-[#2a2435] rounded-3xl p-8 mb-6 border border-[#3a3445]">
 								<div className="flex items-center justify-between mb-6">
 									<div>
										<h2 className="text-3xl font-bold text-white">
											{user[currentIndex].name}
										</h2>
										<div className="flex items-center mt-2 text-gray-400">
											<MapPin className="w-4 h-4 mr-1" />
											<span>{user[currentIndex].distance} Km</span>
										</div>
									</div>
									<div className="text-5xl font-bold text-[#e94057]">
										{user[currentIndex].age}
									</div>
								</div>

								<div className="py-4 border-y border-[#3a3445]">
									<h3 className="text-xl font-semibold text-[#e94057] mb-2">
										{user[currentIndex].occupation}
									</h3>
									<p className="text-gray-300 text-lg leading-relaxed">
										{user[currentIndex].bio}
									</p>
								</div>

								<div className="mt-6">
									<h3 className="text-lg font-semibold mb-3 text-white">Interests</h3>
									<div className="flex flex-wrap gap-2">
										{user[currentIndex].interests.map((interest: string) => (
											<span
												key={interest}
												className="px-4 py-2 bg-[#3a3445] rounded-full text-sm font-medium
							hover:bg-[#4a4455] transition-colors cursor-pointer"
											>
												{interest}
											</span>
										))}
									</div>
								</div>
							</div>

							<div className="bg-[#2a2435] rounded-3xl p-8 border border-[#3a3445]">
								<ActionButtons onSwipe={handleSwipe}  onLike={handleLike}/>
							</div>
						</div>
					)}
				</div>
                <div className="lg:hidden">
                    <ActionButtons onSwipe={handleSwipe} onLike={handleLike} />
                </div>
            </div>
        </div>
    );
};

const ActionButtons = ({ 
    onSwipe, 
    onLike 
}: { 
    onSwipe: (direction: 'left' | 'right') => void;
    onLike: () => void;
}) => (
    <div className="flex items-center justify-center gap-x-16">
        <ActionButton
            onClick={() => onSwipe('left')}
            icon={<X className="w-7 h-7" />}
            variant="secondary"
        />
        <ActionButton
            onClick={onLike}
            icon={<Heart className="w-7 h-7" />}
            variant="primary"
        />
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
            w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-colors
            ${variant === 'primary'
                ? 'bg-[#e94057] text-white hover:bg-[#d93a4f]'
                : 'bg-[#3a3445] text-white/90 hover:bg-[#4a4455]'
            }
        `}
    >
        {icon}
    </motion.button>
);
const ProfileCard = ({
	profile,
	currentPhoto,
	onPhotoClick
}: {
	profile: Profile;
	currentPhoto: number;
	onPhotoClick: () => void;
}) => (
	<div className="w-full h-full rounded-3xl overflow-hidden relative group">
		<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

		<div className="absolute top-4 left-4 right-4 flex items-center justify-between">
			<div className="flex space-x-1">
				{profile.pics.map((_, idx) => (
					<div
						key={idx}
						className={`h-1 rounded-full transition-all duration-300 ${idx === currentPhoto
							? 'w-8 bg-white'
							: 'w-4 bg-white/50'
							}`}
					/>
				))}
			</div>
			<button
				onClick={onPhotoClick}
				className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center
			border border-white/10 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<Camera className="w-5 h-5" />
			</button>
		</div>

		<img
			src={profile.pics[currentPhoto]}
			alt={profile.name}
			className="w-full h-full object-cover"
		/>

		<div className="absolute inset-x-0 bottom-0 p-6">
			<div className="space-y-2">
				<h2 className="text-2xl lg:text-3xl font-bold text-white">
					{profile.name}, {profile.age}
				</h2>
				<div className="flex items-center space-x-4">
					<span className="text-lg text-white/90 font-medium">
						{/* {profile.occupation} */}
					</span>
					<span className="flex items-center text-white/75">
						<MapPin className="w-4 h-4 mr-1" />
						{profile.distance}
					</span>
				</div>
			</div>
		</div>
	</div>
);


export default DiscoverPage;