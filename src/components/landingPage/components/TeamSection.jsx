import React from 'react'
import TeamSectionImage from '../assets/TeamSection.svg'
import Vector2 from '../assets/Vector2.svg'

const TeamSection = () => {
    return (
        // bg-[#EAF6FF]
        <section className=" bg-[#E6F6FE] xl:h-[667px] py-12 text-center">
            {/* Title */}
            <h2 className="text-[42px] font-semibold text-[#011632] ">
                Meet Our Teams
            </h2>
            <img src={Vector2} alt="" className=" w-[334px] mx-auto mb-4" />

            {/* Subtitle */}
            <p className="text-[#3C4959] text-[18px] font-[400] mx-auto w-[800px]">
                The visionary leaders guiding our mission, shaping the future,
                and driving strategic decisions. Their expertise and leadership
                ensure our growth, innovation, and long-term success.
            </p>

            {/* Image Section */}
            <div className="flex justify-center mt-8">
                <img
                    src={TeamSectionImage}
                    alt="Team"
                    className="rounded-[10px] shadow-lg w-full max-w-4xl"
                />
            </div>
        </section>
    )
}

export default TeamSection
