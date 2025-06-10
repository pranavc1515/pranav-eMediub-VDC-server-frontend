import React from "react";
import Healthhygenic from "../assets/HealthHygenic.svg";
import SaltRichDiet from "../assets/SaltRichDiet.svg";
import MuchGoOnDiet from "../assets/MuchGoOnDiet.svg";
import Vector2 from "../assets/Vector2.svg";

const NewsArticles = () => {
  const articles = [
    {
      image: Healthhygenic,
      author: "Anita Jackson",
      title: "Health and Hygiene Tips",
      description: "Essential hygiene practices and health tips for maintaining optimal wellbeing in everyday life.",
    },
    {
      image: SaltRichDiet,
      author: "Anita Jackson",
      title: "Salt-Rich Diet Risks",
      description: "New research shows the potential dangers of consuming excessive salt and how it affects your health.",
    },
    {
      image: MuchGoOnDiet,
      author: "Anita Jackson",
      title: "Nutritional Meal Planning",
      description: "Expert guidance on creating balanced meal plans that support your health goals and lifestyle.",
    },
  ];

  return (
    <div className="py-16 px-6 md:px-12 lg:px-20 text-center">
      <h2 className="font-semibold text-[42px] leading-tight text-[#011632] tracking-normal text-center">News & Articles</h2>
      <img src={Vector2} alt="Divider" className="w-[322px] mx-auto mb-5" />
      <p className="font-normal text-[18px] text-[#3C4959] mx-auto mb-10 text-center xl:w-[650px]">
        We share the latest medical insights and health information to keep you informed about advancements in healthcare.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <div key={index} className="bg-[#E6F6FE] rounded-[12px] shadow-md pb-3 hover:shadow-lg transition-shadow">
            <img src={article.image} alt={article.title} className="w-full pl-9 pt-9 pr-9 rounded-[10px] mb-4" />
            <p className="text-[#011632] font-normal text-[16px] mt-4 mb-4 mr-7 text-right italic">~{article.author}</p>
            <h3 className="text-[20px] font-medium text-[#011632] mb-2 text-left ml-7">{article.title}</h3>
            <p className="text-[#3C4959] w-[250px] mb-6 text-left ml-7 text-[15px]">{article.description}</p>
            <button className="bg-[#011632] w-[286px] font-medium text-center text-[16px] h-[40px] text-[#FFFFFF] px-6 py-1 rounded-[5px] hover:bg-[#0a2254] transition-colors">
              Read More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsArticles;
