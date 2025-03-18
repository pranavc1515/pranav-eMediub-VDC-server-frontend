// import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import Location from '../assets/location.svg'
import Search from '../assets/Search.svg'

const SearchBar = () => {
    return (
        <div className="bg-[#C1DEEF] p-6 rounded-lg w-[96%] mx-auto flex justify-center relative top-[-60px]">
            <div className="bg-[#FFFFFF] flex items-center w-[90%] md:w-[60%] lg:w-[95%] p-5 rounded-lg shadow-md">
                {/* Location Section */}
                <div className="flex items-center space-x-2 text-gray-400 px-3">
                    <img src={Location} alt="Location" />
                    <span>Location</span>
                </div>
                {/* Vertical Divider */}
                <div className="w-[1px] h-6 bg-gray-300 mx-3"></div>
                {/* Search Input */}
                <div className="flex items-center w-full">
                    <img src={Search} alt="Location" />
                    <input
                        type="text"
                        placeholder="Search For Nearby Clinic, Hospital Or Specialist"
                        className="w-full border-none outline-none text-gray-500 px-3 bg-transparent"
                    />
                </div>
            </div>
        </div>
    )
}
export default SearchBar
//
