import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Location from '../assets/location.svg';
import Search from '../assets/Search.svg';

const SearchBar = () => {
    const { translate } = useLanguage();
    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userLocation, setUserLocation] = useState(translate('location'));
    const [loading, setLoading] = useState(false);
    
    // Dummy data for Indian healthcare locations
    const dummySuggestions = [
        'Apollo Hospital, Delhi',
        'Fortis Healthcare, Mumbai',
        'AIIMS, New Delhi',
        'Max Super Speciality Hospital, Saket',
        'Dr. Mehta\'s Hospitals, Chennai',
        'Manipal Hospital, Bangalore',
        'Medanta The Medicity, Gurgaon',
        'Kokilaben Dhirubhai Ambani Hospital, Mumbai',
        'Dr. Batra\'s Homeopathy Clinic, Pune',
        'Sri Ganga Ram Hospital, Delhi'
    ];

    // Function to get user location
    const getUserLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocoding to get city name
                    fetchCityFromCoordinates(latitude, longitude);
                },
                error => {
                    console.error("Error getting location:", error);
                    setLoading(false);
                    // Fallback to default cities in India
                    setUserLocation(getRandomIndianCity());
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            setLoading(false);
            setUserLocation(getRandomIndianCity());
        }
    };

    // Function to fetch city name from coordinates
    const fetchCityFromCoordinates = async (latitude, longitude) => {
        try {
            // In a real app, you would use a geocoding service API
            // For this demo, we'll simulate with sample Indian cities
            setUserLocation(getRandomIndianCity());
            setLoading(false);
        } catch (error) {
            console.error("Error fetching city:", error);
            setLoading(false);
            setUserLocation(getRandomIndianCity());
        }
    };

    // Function to return a random Indian city (fallback)
    const getRandomIndianCity = () => {
        const indianCities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 
            'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
            'Jaipur', 'Lucknow'
        ];
        return indianCities[Math.floor(Math.random() * indianCities.length)];
    };

    // Get user location on component mount
    useEffect(() => {
        getUserLocation();
    }, []);

    return (
        <div className="bg-[#C1DEEF] p-6 rounded-lg w-[96%] mx-auto flex justify-center relative top-[-60px]">
            <div className="bg-[#FFFFFF] flex items-center w-[90%] md:w-[60%] lg:w-[95%] p-5 rounded-lg shadow-md">
                {/* Location Section */}
                <div 
                    className="flex items-center space-x-2 text-gray-400 px-3 cursor-pointer touch-manipulation hover:text-gray-600 transition-colors" 
                    onClick={getUserLocation}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && getUserLocation()}
                    aria-label="Get current location"
                >
                    <img src={Location} alt="Location" />
                    <span>{loading ? translate('detecting') : userLocation}</span>
                </div>
                {/* Vertical Divider */}
                <div className="w-[1px] h-6 bg-gray-300 mx-3"></div>
                {/* Search Input */}
                <div className="flex items-center w-full relative">
                    <img src={Search} alt="Search" />
                    <input
                        type="text"
                        placeholder={translate('searchPlaceholder')}
                        className="w-full border-none outline-none text-gray-500 px-3 bg-transparent"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-10 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                            {dummySuggestions.map((suggestion, index) => (
                                <div 
                                    key={index}
                                    className="p-2 hover:bg-gray-100 cursor-pointer touch-manipulation"
                                    onClick={() => {
                                        setSearchInput(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setSearchInput(suggestion);
                                            setShowSuggestions(false);
                                        }
                                    }}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
