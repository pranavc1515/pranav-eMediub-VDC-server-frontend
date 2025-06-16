import React from 'react';
import TeamSectionImage from '../assets/TeamSection.svg';
import Vector2 from '../assets/Vector2.svg';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const TeamSection = () => {
    const { translate } = useLanguage();
    
    return (
        <section className="bg-[#E6F6FE] py-12 md:py-16 text-center">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-semibold text-[#011632] mb-3">
                {translate('meetOurTeam')}
            </h2>
            <img src={Vector2} alt="Divider" className="w-[280px] md:w-[320px] mx-auto mb-6" />

            {/* Subtitle */}
            <p className="text-base md:text-lg text-[#3C4959] font-normal mx-auto px-4 md:px-6 max-w-4xl leading-relaxed">
                {translate('teamDesc')}
            </p>

            {/* Image Section */}
            <div className="flex justify-center mt-8 md:mt-10 w-full mx-auto">
                <img
                    src={TeamSectionImage}
                    alt="Our Team Members"
                    className="rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-4xl px-4 md:px-6 hover:shadow-xl transition-shadow"
                />
            </div>
        </section>
    );
};

export default TeamSection;
