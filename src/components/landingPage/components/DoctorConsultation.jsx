import React from 'react'
import Vector2 from '../assets/Vector2.svg'
import Marketing from '../assets/Marketing.svg'
import call from '../assets/call.svg'
const ConsultationSection = () => {
    return (
        <div className="ConsultationsSection bg-red py-16 px-6 md:px-12 lg:px-20  lg:flex-row items-center justify-between ">
            <div className="  w-full items-center ">
                <div className=" ConsultationsDiv w-full flex flex-col justify-center items-center mb-3">
                    <h2 className="text-[#011632] text-[42px] font-semibold ">
                        Marketing
                    </h2>
                    <img src={Vector2} alt="" className="w-[206px]  " />
                    <p className="text-[#3C4959] font-normal text-[18px]  xl:w-[505px]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </p>
                </div>
            </div>
            <div className="w-full lg:flex justify-between  ">
                <div className="ConsultationsDivTwo">
                    <h1 className="text-[42px] lg:w-[507px]  font-semibold text-[#011632] ">
                        Consult Top Doctors Anytime, Anywhere!
                    </h1>
                    <p className="text-[#3C4959] text-[18px] font-normal lg:w-[530px] mb-6">
                        Get expert medical advice from certified doctors without
                        leaving your home. Fast, secure, and reliable healthcare
                        at your fingertips.
                    </p>
                    <div className="flex items-center pl-[30px] h-[55px] border rounded-lg overflow-hidden shadow-sm max-w-md mx-auto lg:mx-0">
                        <img src={call} className='mr-2' alt="" />
                        <input
                            type="text"
                            placeholder="Enter your Phone Number"
                            className="w-full py-3 px-4 outline-none text-gray-700"
                        />
                        <button className="bg-[#1376F8] text-[#FFFFFF] text-[16px] px-6 py-3 h-[55px] font-medium">
                            Submit
                        </button>
                    </div>
                </div>
               
                <div className="ourServicesCard flex justify-center relative lg:mt-0    mt-6  w-full lg:w-[40%] h-[320px]">
                        <div className="ourServicesGreenCard bg-blue-200  absolute right-0    w-full  lg:w-[350px] h-[280px]  rounded-[10px] bg-[linear-gradient(52.56deg,_rgba(37,_180,_248,_0)_0%,_rgba(37,_180,_248,_0.473958)_64.42%,_#25B4F8_126.21%)] "></div>
                        <div className=' ourServicesImageCard absolute bottom-1 right-[30px] top-[30px] lg:w-[350px]      '>
                        <img
                          src={Marketing}
                          alt="Doctor Writing"
                          className="rounded-lg shadow-md   object-cover relative  "
                        />
                        </div>
                      </div>
            </div>
        </div>
    )
}

export default ConsultationSection
