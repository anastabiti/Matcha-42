import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, MapPin, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Profile = {
	id: number;
	username: string;
	name: string;
	age: number;
	distance: string;
	pics: string[];
	preview: {
		interests: string[];
		bio: string;
	};
};

type FilterOptions = {
	minAge: number;
	maxAge: number;
	minFame: number;
	maxFame: number;
	sortBy: 'age' | 'fame' | 'common_tags';
	filterTags: string[];
};

const DiscoverPage = () => {
	const navigate = useNavigate();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
	const [currentPhoto, setCurrentPhoto] = useState(0);
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [filters, setFilters] = useState<FilterOptions>({
		minAge: 18,
		maxAge: 100,
		minFame: 0,
		maxFame: 100,
		sortBy: 'age',
		filterTags: []
	});

	useEffect(() => {
		fetchProfiles();
	}, [page, filters]);

	async function fetchProfiles() {
		try {
			setLoading(true);
			const response = await fetch("http://localhost:3000/potential-matches", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include',
				body: JSON.stringify({
					...filters,
					page,
					limit: 10
				})
			});

			const res = await response.json();
			if (res.success) {
				setProfiles(prev => page === 1 ? res.data : [...prev, ...res.data]);
				setHasMore(res.pagination.hasMore);
				setError(null);
			} else {
				setError(res.error || 'Failed to fetch profiles');
			}
		} catch (error) {
			console.error("Error fetching profiles:", error);
			setError('Failed to fetch profiles');
		} finally {
			setLoading(false);
		}
	}

	async function likeUser() {
		if (!profiles[currentIndex]) return;

		try {
			const response = await fetch("http://localhost:3000/like-user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include',
				body: JSON.stringify({
					likedUsername: profiles[currentIndex].username
				})
			});

			const res = await response.json();
			if (res.success) {
				handleSwipe('right');
			}
		} catch (error) {
			console.error("Error liking profile:", error);
		}
	}

	const handleProfileClick = (username: string) => {
		navigate(`/profile/${username}`);
	};

	const handleSwipe = (direction: 'left' | 'right') => {
		if (currentIndex < profiles.length - 1) {
			setExitDirection(direction);
			setTimeout(() => {
				setCurrentIndex(prev => prev + 1);
				setCurrentPhoto(0);
				setExitDirection(null);
			}, 300);

			// Fetch more profiles when nearing the end
			if (currentIndex >= profiles.length - 3 && hasMore) {
				setPage(prev => prev + 1);
			}
		} else if (hasMore) {
			// If we're at the end of the current profiles but there are more to fetch
			setPage(prev => prev + 1);
		}
	};


	if (loading && profiles.length === 0) {
		return (
			<div className="h-screen bg-[#1a1625] flex items-center justify-center">
				<div className="text-white">Loading profiles...</div>
			</div>
		);
	}

	if (error && profiles.length === 0) {
		return (
			<div className="h-screen bg-[#1a1625] flex items-center justify-center">
				<div className="text-red-500">{error}</div>
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-4rem)] bg-[#1a1625]">
			<div className="h-full max-w-[2000px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-6">
				<div className="flex-1 relative h-[70vh] lg:h-full">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative w-full max-w-xl aspect-[3/4] overflow-hidden">
							<AnimatePresence>
								{profiles.map((profile, index) => (
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
											className="absolute inset-0 cursor-pointer"
											style={{ zIndex: profiles.length - index }}
											onClick={() => handleProfileClick(profile.username)}
										>
											<ProfileCard
												profile={profile}
												currentPhoto={currentPhoto}
											/>
										</motion.div>
									)
								))}
							</AnimatePresence>
						</div>
					</div>
				</div>

				<div className="hidden lg:block w-96 h-[40vh] xl:w-[30rem]">
					{currentIndex < profiles.length && (
						<div className="h-full flex flex-col">
							<div className="bg-[#2a2435] rounded-3xl p-8 mb-6 border border-[#3a3445]">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h2 className="text-3xl font-bold text-white">
											{profiles[currentIndex].name}
										</h2>
										<div className="flex items-center mt-2 text-gray-400">
											<MapPin className="w-4 h-4 mr-1" />
											<span>{profiles[currentIndex].distance} km</span>
										</div>
									</div>
									<div className="text-5xl font-bold text-[#e94057]">
										{profiles[currentIndex].age}
									</div>
								</div>

								<div className="py-4 border-y border-[#3a3445]">
									<p className="text-gray-300 text-lg leading-relaxed">
										{profiles[currentIndex].preview.bio}
									</p>
									<button
										onClick={() => handleProfileClick(profiles[currentIndex].username)}
										className="mt-2 text-[#e94057] font-medium hover:underline"
									>
										View Full Profile
									</button>
								</div>

								<div className="mt-6">
									<h3 className="text-lg font-semibold mb-3 text-white">Interests</h3>
									<div className="flex flex-wrap gap-2">
										{profiles[currentIndex].preview.interests.map((interest: string) => (
											<span
												key={interest}
												className="px-4 py-2 bg-[#3a3445] rounded-full text-sm font-medium
                                                    text-white hover:bg-[#4a4455] transition-colors"
											>
												{interest}
											</span>
										))}
									</div>
								</div>
							</div>

							<div className="bg-[#2a2435] rounded-3xl p-8 border border-[#3a3445]">
								<ActionButtons onSwipe={handleSwipe} onLike={likeUser} />
							</div>
						</div>
					)}
				</div>

				<div className="lg:hidden">
					<ActionButtons onSwipe={handleSwipe} onLike={likeUser} />
				</div>

				<FilterDialog
					filters={filters}
					onFilterChange={(newFilters) => {
						setFilters(newFilters);
						setCurrentIndex(0);
						setPage(1);
					}}
				/>
			</div>
		</div>
	);
};

const FilterDialog = ({
	filters,
	onFilterChange
}: {
	filters: FilterOptions;
	onFilterChange: (filters: FilterOptions) => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [tempFilters, setTempFilters] = useState(filters);

	const handleApply = () => {
		onFilterChange(tempFilters);
		setIsOpen(false);
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-24 right-4 lg:right-8 w-12 h-12 bg-[#e94057] rounded-full flex items-center justify-center text-white shadow-lg"
			>
				<Filter className="w-6 h-6" />
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="bg-[#2a2435] rounded-3xl p-8 w-full max-w-md">
						<h2 className="text-2xl font-bold text-white mb-6">Filter Preferences</h2>

						<div className="space-y-6">
							<div>
								<label className="text-white font-medium">Age Range</label>
								<div className="flex items-center gap-4 mt-2">
									<input
										type="number"
										value={tempFilters.minAge}
										onChange={(e) => setTempFilters(prev => ({
											...prev,
											minAge: parseInt(e.target.value)
										}))}
										className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
										min="18"
										max={tempFilters.maxAge}
									/>
									<span className="text-white">to</span>
									<input
										type="number"
										value={tempFilters.maxAge}
										onChange={(e) => setTempFilters(prev => ({
											...prev,
											maxAge: parseInt(e.target.value)
										}))}
										className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
										min={tempFilters.minAge}
										max="100"
									/>
								</div>
							</div>

							<div>
								<label className="text-white font-medium">Fame Rating Range</label>
								<div className="flex items-center gap-4 mt-2">
									<input
										type="number"
										value={tempFilters.minFame}
										onChange={(e) => setTempFilters(prev => ({
											...prev,
											minFame: parseInt(e.target.value)
										}))}
										className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
										min="0"
										max={tempFilters.maxFame}
									/>
									<span className="text-white">to</span>
									<input
										type="number"
										value={tempFilters.maxFame}
										onChange={(e) => setTempFilters(prev => ({
											...prev,
											maxFame: parseInt(e.target.value)
										}))}
										className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
										min={tempFilters.minFame}
										max="100"
									/>
								</div>
							</div>

							<div>
								<label className="text-white font-medium">Sort By</label>
								<select
									value={tempFilters.sortBy}
									onChange={(e) => setTempFilters(prev => ({
										...prev,
										sortBy: e.target.value as FilterOptions['sortBy']
									}))}
									className="w-full mt-2 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
								>
									<option value="age">Age</option>
									<option value="fame">Fame Rating</option>
									<option value="common_tags">Common Interests</option>
								</select>
							</div>
						</div>

						<div className="flex gap-4 mt-8">
							<button
								onClick={() => setIsOpen(false)}
								className="flex-1 px-6 py-3 bg-[#3a3445] rounded-xl text-white font-medium"
							>
								Cancel
							</button>
							<button
								onClick={handleApply}
								className="flex-1 px-6 py-3 bg-[#e94057] rounded-xl text-white font-medium"
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}
		</>
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
}: {
	profile: Profile;
	currentPhoto: number;
}) => (
	<div className="w-full h-full rounded-3xl overflow-hidden relative group">
		<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />


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

export default DiscoverPage;