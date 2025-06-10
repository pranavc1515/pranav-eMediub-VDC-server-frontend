import React from 'react';
import TeamSectionImage from '../assets/TeamSection.svg';
import Vector2 from '../assets/Vector2.svg';

const TeamSection = () => {
    return (
        <section className="bg-[#E6F6FE] xl:h-[667px] py-16 text-center">
            {/* Title */}
            <h2 className="text-[36px] xl:text-[42px] font-semibold text-[#011632] mb-2">
                Meet Our Team
            </h2>
            <img src={Vector2} alt="Divider" className="w-[334px] mx-auto mb-6" />

            {/* Subtitle */}
            <p className="text-[#3C4959] text-[18px] font-normal mx-auto px-6 xl:w-[800px] leading-relaxed">
                Our healthcare professionals are dedicated to providing exceptional patient care. 
                With expertise across various medical specialties, our team works collaboratively 
                to deliver innovative solutions and personalized treatment plans.
            </p>

            {/* Image Section */}
            <div className="flex justify-center mt-10 w-full mx-auto">
                <img
                    src={TeamSectionImage}
                    alt="Our Team Members"
                    className="rounded-[10px] shadow-lg w-full px-6 xl:max-w-4xl hover:shadow-xl transition-shadow"
                />
            </div>
        </section>
    );
};

export default TeamSection;
