import { useEffect, useState } from 'react';
import { Heart, Star, X, MapPin, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { use } from 'framer-motion/client';

type Profile = {
	id: number;
	name: string;
	age: number;
	distance: string;
	bio: string;
	interests: string[];
	photos: string[];
	profile_picture: string;
};

const DiscoverPage = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
	const [currentPhoto, setCurrentPhoto] = useState(0);
	const [user, setUser] = useState<any>([]);
	// const [profiles, setProfiles] = useState<any>([]);

	useEffect(() => {
		fetchProfiles();
	}, []);


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

			if (res.success){
				// setProfiles(res.data);

				// console.log("profiles", res.data)
				setUser(res.data)

				res.data.map((profile: any, index: any) => {

					console.log("id", profile.id)
					console.log("index", index)
					console.log("profile", profile.bio)
				})
				// res.data.map((profile: any) => {

				// 	console.log("profile", profile.bio)
				// })

			}

		} catch (error) { }
		finally {
			console.log("finally")
		}

	}






	const [profiles] = useState([
		{
			id: 1,
			name: "Jessica Parker",
			age: 23,
			occupation: "Professional model",
			distance: "1 km",
			bio: "Love exploring new places and meeting new people",
			interests: ["Photography", "Travel", "Fashion"],
			photos: [
				"https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80",
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
			]
		},
		{
			id: 2,
			name: "Camila Snow",
			age: 23,
			occupation: "Marketing Manager",
			distance: "4 km",
			bio: "Coffee addict and fitness enthusiast",
			interests: ["Fitness", "Coffee", "Books"],
			photos: [
				"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"
			]
		},
		{
			id: 3,
			name: "Emma Wilson",
			age: 25,
			occupation: "Software Developer",
			distance: "2 km",
			bio: "Tech lover and adventure seeker",
			interests: ["Coding", "Hiking", "Photography"],
			photos: [
				"https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=800&q=80",
				"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80"
			]
		},
		{
			id: 4,
			name: "Jessica Parker",
			age: 23,
			occupation: "Professional model",
			distance: "1 km",
			bio: "Love exploring new places and meeting new people",
			interests: ["Photography", "Travel", "Fashion"],
			photos: [
				"https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80",
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
			]
		},
		{
			id: 5,
			name: "Camila Snow",
			age: 23,
			occupation: "Marketing Manager",
			distance: "4 km",
			bio: "Coffee addict and fitness enthusiast",
			interests: ["Fitness", "Coffee", "Books"],
			photos: [
				"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"
			]
		},
		{
			id: 6,
			name: "Emma Wilson",
			age: 25,
			occupation: "Software Developer",
			distance: "2 km",
			bio: "Tech lover and adventure seeker",
			interests: ["Coding", "Hiking", "Photography"],
			photos: [
				"https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=800&q=80",
				"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80"
			]
		}
	]);

	const handleSwipe = (direction: 'left' | 'right') => {
		if (currentIndex < profiles.length - 1) {
			setExitDirection(direction);
			setTimeout(() => {
				setCurrentIndex(prev => prev + 1);
				setCurrentPhoto(0);
				setExitDirection(null);
			}, 300);
		}
	};

	const nextPhoto = () => {
		setCurrentPhoto(prev =>
			prev < profiles[currentIndex].photos.length - 1 ? prev + 1 : 0
		);
	};

	return (
		<div className="h-[calc(100vh-4rem)] bg-[#1a1625]">
			<div className="h-full max-w-[2000px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-6">
				<div className="flex-1 relative h-[70vh] lg:h-full">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative w-full max-w-xl aspect-[3/4] overflow-hidden">
							<AnimatePresence>
								{user.map((profile:any, index:any) => (
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
											style={{ zIndex: profiles.length - index }}
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
										{profiles[currentIndex].occupation}
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
								<ActionButtons onSwipe={handleSwipe} />
							</div>
						</div>
					)}
				</div>

				<div className="lg:hidden">
					<ActionButtons onSwipe={handleSwipe} />
				</div>
			</div>
		</div>
	);
};

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
				{/* {profile.photos.map((_, idx) => (
					<div
						key={idx}
						className={`h-1 rounded-full transition-all duration-300 ${idx === currentPhoto
							? 'w-8 bg-white'
							: 'w-4 bg-white/50'
							}`}
					/>
				))} */}
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
			// src={profile.photos[currentPhoto]}
			src={profile.profile_picture}
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

const ActionButtons = ({ onSwipe }: { onSwipe: (direction: 'left' | 'right') => void }) => (
	<div className="flex justify-center items-center space-x-6">
		<ActionButton
			onClick={() => onSwipe('left')}
			icon={<X className="w-7 h-7" />}
			variant="secondary"
		/>
		<ActionButton
			onClick={() => onSwipe('right')}
			icon={<Heart className="w-7 h-7" />}
			variant="primary"
		/>
		<ActionButton
			icon={<Star className="w-7 h-7" />}
			variant="secondary"
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

export default DiscoverPage;