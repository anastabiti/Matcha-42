import { useState } from 'react';
import { Filter } from 'lucide-react';
import { FilterOptions } from '../types/types';


type FilterDialogProps = {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
};

export const FilterDialog = ({
    filters,
    onFilterChange
}: FilterDialogProps) => {
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

export default FilterDialog;