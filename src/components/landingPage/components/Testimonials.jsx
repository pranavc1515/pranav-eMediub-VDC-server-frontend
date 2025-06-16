import React, { useEffect, useState } from "react";
import testimonial from "../assets/Testinomial.svg";
import Ellipse from "../assets/Ellipse1097.svg";
import DoctorImage1 from "../assets/DoctorImage1.svg";
import { useLanguage } from '../contexts/LanguageContext.jsx';

const testimonials = [
  {
    name: "Aarav Mehta",
    quote:
      "The service was outstanding! Everything was handled professionally, and the results were beyond my expectations. Highly recommend!",
    image: DoctorImage1,
    profession: "Patient"
  },
  {
    name: "Shilpa Rodrigues",
    quote:
      "Great experience working with this team! Their creativity and attention to detail truly made a difference. Would love to collaborate again.",
    image: DoctorImage1,
    profession: "Healthcare Professional"
  },
  {
    name: "Rohan Desai",
    quote:
      "Impressed with the quality and efficiency! The team delivered exactly what I needed, and the process was smooth from start to finish.",
    image: DoctorImage1,
    profession: "Medical Researcher"
  },
];

const TestimonialsSlider = () => {
  const { translate } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="flex flex-col items-center justify-center h-[700px] py-12"
      style={{
        backgroundImage: `url(${testimonial})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Section Title */}
      <h2 className="text-3xl md:text-4xl font-semibold text-[#011632] mb-3 z-50">
        {translate('testimonials')}
      </h2>
      <p className="text-[#3C4959] w-[80%] xl:w-[450px] text-base md:text-lg font-normal mb-10 text-center">
        {translate('testimonialsDesc')}
      </p>

      {/* Slider Container - Desktop */}
      <div className="relative w-[90%] md:w-[80%] h-[380px] hidden lg:block mt-8 bg-[#011632] rounded-[10px] shadow-lg">
        {/* Testimonial Card Wrapper */}
        <div className="overflow-hidden relative h-full">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`
                absolute inset-0 flex justify-between w-full h-full bg-[#011632]
                transition-opacity duration-[2000ms] rounded-[10px]
                ${index === currentIndex ? "" : "hidden"}
              `}
            >
              {/* Testimonial Card */}
              <div className="flex justify-between w-full h-full p-8 md:p-10 flex-col md:flex-row font-semibold text-[#FFFFFF] rounded-lg">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-3xl md:text-4xl mb-1 transition-all duration-[3000ms] ease-in text-[#FFFFFF]">
                    {item.name}
                  </h3>
                  <p className="text-base md:text-lg text-blue-300 mb-4">{item.profession}</p>
                  <p className="text-xl md:text-2xl lg:w-[388px] xl:w-[60%] font-medium text-[#FFFFFF] italic mb-6 transition-all duration-[3000ms]">
                    "{item.quote}"
                  </p>
                  <button className="bg-[#0190CA] items-center w-[140px] h-[45px] text-[#FFFFFF] rounded-[5px] transition-all hover:bg-[#0177a7] font-medium">
                    {translate('viewStory')}
                  </button>
                  {/* Dot Indicators */}
                  <div className="flex ml-[30px] space-x-3 mt-6">
                    {testimonials.map((_, dotIndex) => (
                      <span
                        key={dotIndex}
                        onClick={() => setCurrentIndex(dotIndex)}
                        className={`cursor-pointer bg-[#CFCFCF] mt-3 h-2.5 w-2.5 rounded-full transition-colors duration-[3000ms] 
                          ${currentIndex === dotIndex ? "bg-blue-500" : ""}
                        `}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-[320px] h-full flex-shrink-0 relative">
                  <img
                    src={Ellipse}
                    alt="Background Ellipse"
                    className="w-full object-cover rounded-full"
                  />
                  <img
                    src={item.image}
                    alt={`${item.name} testimonial`}
                    className="w-full rounded-full absolute z-50 h-[350px] top-[0px] mb-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slider Container - Mobile */}
      <div className="w-[90%] md:w-[80%] h-full lg:hidden mt-8 bg-[#011632] rounded-[10px] shadow-lg">
        <div>
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`
                inset-0 flex justify-between w-full h-full 
                transition-opacity duration-[2000ms] rounded-[10px]
                ${index === currentIndex ? "" : "hidden"}
              `} 
            >
              {/* Testimonial Card */}
              <div className="relative flex flex-col font-semibold text-[#FFFFFF] rounded-lg">
                <div className="w-full mb-4 pt-5 flex justify-center items-center">
                  <img
                    src={Ellipse}
                    alt="Background Ellipse"
                    className="object-cover absolute h-[220px] rounded-full mb-2"
                  />
                  <img
                    src={item.image}
                    alt={`${item.name} testimonial`}
                    className="h-[220px] relative rounded-full"
                  />
                </div>
                <div className="flex flex-col w-full mb-5 text-center px-4">
                  <h3 className="font-semibold text-2xl md:text-3xl mb-1 text-[#FFFFFF]">
                    {item.name}
                  </h3>
                  <p className="text-sm md:text-base text-blue-300 mb-3">{item.profession}</p>
                  <p className="text-base md:text-lg px-2 font-medium text-[#FFFFFF] italic mb-5">
                    "{item.quote}"
                  </p>
                  <button className="bg-[#0190CA] items-center w-[140px] h-[45px] mx-auto text-[#FFFFFF] rounded-[5px] mb-4 hover:bg-[#0177a7] font-medium">
                    {translate('viewStory')}
                  </button>
                  <div className="flex justify-center space-x-3 mb-6">
                    {testimonials.map((_, dotIndex) => (
                      <span
                        key={dotIndex}
                        onClick={() => setCurrentIndex(dotIndex)}
                        className={`cursor-pointer bg-[#CFCFCF] mt-3 h-2.5 w-2.5 rounded-full transition-colors duration-[3000ms] 
                          ${currentIndex === dotIndex ? "bg-blue-500" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
