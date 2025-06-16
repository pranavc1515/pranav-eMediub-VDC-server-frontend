import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import User from '../assets/Users.svg';
import GroupDoctor from '../assets/GroupDoctor.svg';
import UserDoctorCard from '../assets/UserDoctorCard.svg';

const UserDoctorCards = () => {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const handleUserCardClick = () => {
    navigate('/sign-in');
  };

  const handleDoctorCardClick = () => {
    navigate('/sign-in');
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center gap-6 p-4 mt-4">
      <div
        className="relative bg-gradient-to-r from-white to-blue-100 rounded-lg shadow-md p-6 flex items-center w-full xl:max-w-[48.5%] h-[150px] bg-cover bg-right cursor-pointer hover:shadow-lg transition-shadow"
        style={{ backgroundImage: `url(${UserDoctorCard})` }}
        onClick={handleUserCardClick}
      >
        {/* Left Content */}
        <div className="flex flex-col z-10">
          <div>
            <img src={User} className="w-[46px] h-[46px]" alt="Users Icon" />
            <h2 className="text-[30px] font-semibold text-[#071437] leading-tight">{translate('allUsers')}</h2>
          </div>
          <p className="text-[#78829D] text-[14px] font-medium mt-1">{translate('amazingMates')}</p>
        </div>
      </div>

      <div
        className="relative bg-gradient-to-r from-white to-blue-100 rounded-lg shadow-md p-6 flex items-center w-full xl:max-w-[48.5%] h-[150px] bg-cover bg-right cursor-pointer hover:shadow-lg transition-shadow"
        style={{ backgroundImage: `url(${UserDoctorCard})` }}
        onClick={handleDoctorCardClick}
      >
        {/* Left Content */}
        <div className="flex flex-col z-10">
          <div>
            <img src={GroupDoctor} className="w-[46px] h-[46px]" alt="Doctors Icon" />
            <h2 className="text-[30px] font-semibold text-[#071437] leading-tight">{translate('allDoctors')}</h2>
          </div>
          <p className="text-[#78829D] text-[14px] font-medium mt-1">{translate('professionalCare')}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDoctorCards;
