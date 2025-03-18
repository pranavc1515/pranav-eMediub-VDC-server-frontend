import React from "react";
import Vector from "../assets/Vector.svg";
import Vector2 from "../assets/Vector2.svg";
import healthinsurance from "../assets/HealthInsurence.svg";
import FitnessClasses from "../assets/FitnessClasses.svg";
const OurServicesCardthree = () => {
  return (
    <section className=" flex justify-center flex-col items-center  mx-auto py-12 px-4 w-[97%]  ">
      {/* Section: Book Your Appointment */}
      <div className="flex flex-col lg:flex-row justify-between items-center mt-12 mb-[120px]  w-full">
        {/* Text Content */}
        <div className="lg:w-1/2 text-left">
          <h3 className="text-[42px] font-semibold text-[#011632]">
            Health Insurance
          </h3>
          <img src={Vector} alt="" className="w-[200px]" />
          <p className="text-[#3C4959] font-normal text-[18px] 2xl:w-[687px]  mt-4">
            Explore, compare, and purchase health insurance plans tailored to
            your needs, ensuring financial security during medical emergencies.
            Choose from a variety of coverage options, including
            hospitalization, critical illness, and wellness benefits. Get expert
            guidance to find the best plan at the most affordable rates. Enjoy
            cashless treatments, quick claim approvals, and comprehensive health
            coverage for you and your family.
          </p>

          <button className="mt-4 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]">
            Book an appointment
          </button>
        </div>

        {/* Image */}
        <div className=" flex justify-center relative mt-6 lg:mt-0  ">
          <div className="bg-blue-200  xl:p-2 absolute    w-[413px] h-[326px] top-[-2px] rounded-[10px] bg-[linear-gradient(52.56deg,_rgba(37,_180,_248,_0)_0%,_rgba(37,_180,_248,_0.473958)_64.42%,_#25B4F8_126.21%)] "></div>
          <img
            src={healthinsurance}
            alt="Doctor Writing"
            className="rounded-lg shadow-md xl:w-[410px] xl:-left-[35px]  h-[326px] object-cover relative xl:top-[35px] "
          />
        </div>
      </div>

      {/* Section: Online Doctor Consultation */}
      <div className=" bg-blue-100 p-8 rounded-lg flex flex-col lg:flex-row items-center w-full xl:h-[554px]">
        {/* Image */}
        <div className="lg:w-1/2 flex justify-center">
          <img
            src={FitnessClasses}
            alt="Online Consultation"
            className="rounded-lg shadow-md xl:w-[414px] xl:h-[444px] object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="lg:w-1/2 text-left lg:pl-8 mt-6 lg:mt-0">
          <h3 className="text-[42px] font-semibold text-[#011632]">
            Online Fitness Classes
          </h3>
          <img src={Vector2} alt="" className="xl:ml-[60px] mt-[-15px] " />
          <p className="text-[#3C4959] text-[18px] font-normal xl:w-[444px] mt-4">
            Join expert-led virtual fitness sessions, including yoga, strength
            training, and wellness programs, for a healthier lifestyle.
          </p>

          <button className="mt-8 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]">
            Book an appointment
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurServicesCardthree;
