import { useState } from 'react';
import { Filter, X } from 'lucide-react';

export type FilterOptions = {
    minAge: number;
    maxAge: number;
    minFame: number;
    maxFame: number;
    sortBy: 'age' | 'fame' | 'common_tags';
    filterTags: string[];
};

type FilterDialogProps = {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    suggestedTags?: string[];
};

export const FilterDialog = ({
    filters,
    onFilterChange,
    suggestedTags = ['#Music', '#Sports', '#Travel', '#Food', '#Art', '#Gaming', '#Movies', '#Books', '#Photography', '#Fitness']
}: FilterDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const [tagInput, setTagInput] = useState('');
    const [inputValues, setInputValues] = useState({
        minAge: filters.minAge.toString(),
        maxAge: filters.maxAge.toString(),
        minFame: filters.minFame.toString(),
        maxFame: filters.maxFame.toString(),
    });

    const handleApply = () => {
        const validatedFilters = {
            ...tempFilters,
            minAge: Number(inputValues.minAge) || 18,
            maxAge: Number(inputValues.maxAge) || 100,
            minFame: Number(inputValues.minFame) || 0,
            maxFame: Number(inputValues.maxFame) || 100,
        };
        onFilterChange(validatedFilters);
        setIsOpen(false);
    };

    const handleInputChange = (field: keyof typeof inputValues, value: string) => {
        setInputValues(prev => ({
            ...prev,
            [field]: value
        }));

        if (value !== '') {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
                setTempFilters(prev => ({
                    ...prev,
                    [field]: numValue
                }));
            }
        }
    };

    const handleAddTag = (tag: string) => {
        const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
        if (!tempFilters.filterTags.includes(formattedTag)) {
            setTempFilters(prev => ({
                ...prev,
                filterTags: [...prev.filterTags, formattedTag]
            }));
        }
        setTagInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            handleAddTag(tagInput.trim());
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTempFilters(prev => ({
            ...prev,
            filterTags: prev.filterTags.filter(tag => tag !== tagToRemove)
        }));
    };

    const filteredSuggestions = suggestedTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tempFilters.filterTags.includes(tag)
    );

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
                    <div className="bg-[#2a2435] rounded-3xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-6">Filter Preferences</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-white font-medium">Age Range</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <input
                                        type="number"
                                        value={inputValues.minAge}
                                        onChange={(e) => handleInputChange('minAge', e.target.value)}
                                        className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
                                        min="18"
                                        max={tempFilters.maxAge}
                                    />
                                    <span className="text-white">to</span>
                                    <input
                                        type="number"
                                        value={inputValues.maxAge}
                                        onChange={(e) => handleInputChange('maxAge', e.target.value)}
                                        className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
                                        min={tempFilters.minAge}
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-white font-medium">Fame Rating</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <input
                                        type="number"
                                        value={inputValues.minFame}
                                        onChange={(e) => handleInputChange('minFame', e.target.value)}
                                        className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
                                        min="0"
                                        max={tempFilters.maxFame}
                                    />
                                    <span className="text-white">to</span>
                                    <input
                                        type="number"
                                        value={inputValues.maxFame}
                                        onChange={(e) => handleInputChange('maxFame', e.target.value)}
                                        className="w-24 px-3 py-2 bg-[#3a3445] rounded-lg text-white"
                                        min={tempFilters.minFame}
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-white font-medium">Tags</label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Add tags (start with #)"
                                        className="w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white mb-2"
                                    />

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tempFilters.filterTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-4 py-2 bg-[#3a3445] rounded-full flex items-center gap-1 text-sm 
                                                font-medium text-white hover:bg-[#e94057] transition-colors
                                                border border-[#e94057]/10 hover:border-transparent cursor-pointer"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:text-[#e94057]"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-white text-sm">
                                        <span className="font-medium">Suggested:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {filteredSuggestions.slice(0, 6).map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleAddTag(tag)}
                                                    className="px-4 py-2 bg-[#3a3445] rounded-full text-sm 
                                                    font-medium text-white hover:bg-[#e94057] transition-colors
                                                    border border-[#e94057]/10 hover:border-transparent cursor-pointer"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
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