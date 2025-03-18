
import User from '../assets/Users.svg'
import GroupDoctor from '../assets/GroupDoctor.svg'
import UserDoctorCard from "../assets/UserDoctorCard.svg"
import GooglePlay from "../assets/GooglePlay.svg"
import AppStore from "../assets/AppStore.svg"

const UserDoctorCards = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-center items-center gap-6 p-4 ">
   
      <div
        className="relative bg-gradient-to-r from-white to-blue-100 rounded-lg shadow-md p-6 flex items-center w-full xl:max-w-[48.5%] h-[150px] bg-cover bg-right"
        style={{ backgroundImage: `url(${UserDoctorCard})` }}
      >
        {/* Left Content */}
        <div className="flex flex-col  z-10">
          <div className=" ">
            <img src={User} className=" w-[46px] h-[46px]" alt='' />
            <h2 className="text-[30px] font-semibold  text-[#071437] ">All Users</h2>
          </div>
          <p className="text-[#78829D] text-[13px] font-[500] ">Amazing mates</p>
        </div>
      </div>

    
      <div
        className="relative bg-gradient-to-r from-white to-blue-100 rounded-lg shadow-md p-6 flex items-center w-full xl:max-w-[48.5%] h-[150px] bg-cover bg-right "
        style={{ backgroundImage: `url(${UserDoctorCard})` }}
      >
       <div className="hidden lg:flex absolute top-[-75px] right-[-23px]  flex-col space-y-2">
          <img src={GooglePlay} alt="Google Play" className="w-32" />
          <img src={AppStore} alt="App Store" className="w-32" />
        </div>
        {/* Left Content */}
        <div className="flex flex-col  z-10">
          <div className="">
            <img src={GroupDoctor} className="w-[46px] h-[46px]" alt='' />
            <h2 className="text-[30px] font-semibold  text-[#071437]">All Doctor</h2>
          </div>
          <p className="text-[#78829D] text-[13px] font-[500]">Lessons Views</p>
        </div>
      </div>
    </div>
  );
};

export default UserDoctorCards;
