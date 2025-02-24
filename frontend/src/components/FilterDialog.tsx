import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { FilterOptions } from '../types/types';

type FilterDialogProps = {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    suggestedTags?: string[];
};

type ValidationErrors = {
    minAge?: string;
    maxAge?: string;
    minFame?: string;
    maxFame?: string;
    maxDistance?: string;
    minCommonTags?: string;
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
        maxDistance: filters.maxDistance.toString(),
        minCommonTags: filters.minCommonTags.toString(),
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

    const validateField = (field: string, value: string): string | undefined => {
        const numValue = Number(value);
        
        switch (field) {
            case 'minAge':
                if (numValue < 18) return 'Minimum age must be 18 or higher';
                if (numValue > Number(inputValues.maxAge)) return 'Minimum age cannot exceed maximum age';
                break;
            case 'maxAge':
                if (numValue > 100) return 'Maximum age cannot exceed 100';
                if (numValue < Number(inputValues.minAge)) return 'Maximum age cannot be less than minimum age';
                break;
            case 'minFame':
                if (numValue < 0) return 'Minimum fame cannot be negative';
                if (numValue > Number(inputValues.maxFame)) return 'Minimum fame cannot exceed maximum fame';
                break;
            case 'maxFame':
                if (numValue > 100) return 'Maximum fame cannot exceed 100';
                if (numValue < Number(inputValues.minFame)) return 'Maximum fame cannot be less than minimum fame';
                break;
            case 'maxDistance':
                if (numValue < 1) return 'Distance must be at least 1 km';
                if (numValue > 20000) return 'Distance cannot exceed 20,000 km';
                break;
            case 'minCommonTags':
                if (numValue < 0) return 'Minimum common tags cannot be negative';
                if (numValue > 20) return 'Maximum common tags cannot exceed 20';
                break;
        }
        return undefined;
    };

    const handleInputChange = (field: keyof typeof inputValues, value: string) => {
        setTouchedFields(prev => new Set(prev).add(field));
        setInputValues(prev => ({
            ...prev,
            [field]: value
        }));

        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));

        if (value !== '' && !error) {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
                setTempFilters(prev => ({
                    ...prev,
                    [field]: numValue
                }));
            }
        }
    };

    const handleApply = () => {
        // Validate all fields before applying
        const newErrors: ValidationErrors = {};
        Object.entries(inputValues).forEach(([field, value]) => {
            const error = validateField(field, value);
            if (error) newErrors[field as keyof ValidationErrors] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouchedFields(new Set(Object.keys(inputValues)));
            return;
        }

        const validatedFilters = {
            ...tempFilters,
            minAge: Math.max(18, Math.min(100, Number(inputValues.minAge) || 18)),
            maxAge: Math.max(18, Math.min(100, Number(inputValues.maxAge) || 100)),
            minFame: Math.max(0, Math.min(100, Number(inputValues.minFame) || 0)),
            maxFame: Math.max(0, Math.min(100, Number(inputValues.maxFame) || 100)),
            maxDistance: Math.max(1, Math.min(20000, Number(inputValues.maxDistance) || 100)),
            minCommonTags: Math.max(0, Math.min(20, Number(inputValues.minCommonTags) || 0)),
        };

        onFilterChange(validatedFilters);
        setIsOpen(false);
    };

    const handleReset = () => {
        const defaultFilters = {
            minAge: 18,
            maxAge: 100,
            minFame: 0,
            maxFame: 100,
            maxDistance: 100,
            minCommonTags: 0,
            sortBy: 'distance' as const,
            filterTags: [],
        };

        setTempFilters(defaultFilters);
        setInputValues({
            minAge: '18',
            maxAge: '100',
            minFame: '0',
            maxFame: '100',
            maxDistance: '100',
            minCommonTags: '0',
        });
        setErrors({});
        setTouchedFields(new Set());
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

    const renderInputWithValidation = (
        field: keyof typeof inputValues,
        label: string,
        props: React.InputHTMLAttributes<HTMLInputElement>
    ) => (
        <div>
            <label className="text-white font-medium">{label}</label>
            <div className="mt-2">
                <input
                    type="number"
                    value={inputValues[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className={`w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white 
                        ${touchedFields.has(field) && errors[field] ? 'border border-red-500' : ''}`}
                    {...props}
                />
                {touchedFields.has(field) && errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 lg:right-8 w-12 h-12 bg-[#e94057] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#d63a4f] transition-colors"
                aria-label="Open filters"
            >
                <Filter className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#2a2435] rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Filter Preferences</h2>
                            <button
                                onClick={handleReset}
                                className="text-[#e94057] text-sm font-medium hover:underline"
                            >
                                Reset All
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Age Range Section */}
                            <div>
                                <label className="text-white font-medium">Age Range</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={inputValues.minAge}
                                            onChange={(e) => handleInputChange('minAge', e.target.value)}
                                            className={`w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white
                                                ${touchedFields.has('minAge') && errors.minAge ? 'border border-red-500' : ''}`}
                                            min="18"
                                            max={tempFilters.maxAge}
                                            placeholder="Min"
                                        />
                                        {touchedFields.has('minAge') && errors.minAge && (
                                            <p className="text-red-500 text-sm mt-1">{errors.minAge}</p>
                                        )}
                                    </div>
                                    <span className="text-white">to</span>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={inputValues.maxAge}
                                            onChange={(e) => handleInputChange('maxAge', e.target.value)}
                                            className={`w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white
                                                ${touchedFields.has('maxAge') && errors.maxAge ? 'border border-red-500' : ''}`}
                                            min={tempFilters.minAge}
                                            max="100"
                                            placeholder="Max"
                                        />
                                        {touchedFields.has('maxAge') && errors.maxAge && (
                                            <p className="text-red-500 text-sm mt-1">{errors.maxAge}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fame Rating Section */}
                            <div>
                                <label className="text-white font-medium">Fame Rating</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={inputValues.minFame}
                                            onChange={(e) => handleInputChange('minFame', e.target.value)}
                                            className={`w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white
                                                ${touchedFields.has('minFame') && errors.minFame ? 'border border-red-500' : ''}`}
                                            min="0"
                                            max={tempFilters.maxFame}
                                            placeholder="Min"
                                        />
                                        {touchedFields.has('minFame') && errors.minFame && (
                                            <p className="text-red-500 text-sm mt-1">{errors.minFame}</p>
                                        )}
                                    </div>
                                    <span className="text-white">to</span>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={inputValues.maxFame}
                                            onChange={(e) => handleInputChange('maxFame', e.target.value)}
                                            className={`w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white
                                                ${touchedFields.has('maxFame') && errors.maxFame ? 'border border-red-500' : ''}`}
                                            min={tempFilters.minFame}
                                            max="100"
                                            placeholder="Max"
                                        />
                                        {touchedFields.has('maxFame') && errors.maxFame && (
                                            <p className="text-red-500 text-sm mt-1">{errors.maxFame}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Distance Section */}
                            {renderInputWithValidation('maxDistance', 'Maximum Distance (km)', {
                                min: "1",
                                max: "20000",
                                placeholder: "Maximum distance"
                            })}

                            {/* Common Tags Section */}
                            {renderInputWithValidation('minCommonTags', 'Minimum Common Tags', {
                                min: "0",
                                max: "20",
                                placeholder: "Minimum common tags"
                            })}

                            {/* Interest Tags Section */}
                            <div>
                                <label className="text-white font-medium">Filter by Tags</label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Add tags (start with #)"
                                        className="w-full px-3 py-2 bg-[#3a3445] rounded-lg text-white mb-2"
                                    />

                                    {/* Selected Tags */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tempFilters.filterTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 bg-[#3a3445] rounded-full flex items-center gap-1 text-sm 
                                                font-medium text-white group hover:bg-[#e94057] transition-colors
                                                border border-[#e94057]/10"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="group-hover:text-white"
                                                    aria-label={`Remove ${tag} tag`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Suggested Tags */}
                                    <div className="text-white text-sm">
                                        <span className="font-medium">Suggested:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {filteredSuggestions.slice(0, 6).map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleAddTag(tag)}
                                                    className="px-3 py-1.5 bg-[#3a3445] rounded-full text-sm 
                                                    font-medium text-white hover:bg-[#e94057] transition-colors
                                                    border border-[#e94057]/10"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sort By Section */}
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
                                    <option value="distance">Distance</option>
                                    <option value="age">Age</option>
                                    <option value="fame">Fame Rating</option>
                                    <option value="common_tags">Common Interests</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-6 py-3 bg-[#3a3445] rounded-xl text-white font-medium 
                                hover:bg-[#4a4455] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-6 py-3 bg-[#e94057] rounded-xl text-white font-medium 
                                hover:bg-[#d63a4f] transition-colors"
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