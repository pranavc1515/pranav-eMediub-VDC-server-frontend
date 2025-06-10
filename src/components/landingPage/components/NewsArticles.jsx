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
    <div className="py-12 md:py-16 px-4 md:px-6 text-center">
      <h2 className="font-semibold text-3xl md:text-4xl leading-tight text-[#011632] tracking-normal text-center mb-3">News & Articles</h2>
      <img src={Vector2} alt="Divider" className="w-[280px] md:w-[320px] mx-auto mb-5" />
      <p className="font-normal text-base md:text-lg text-[#3C4959] mx-auto mb-8 md:mb-10 text-center max-w-2xl">
        We share the latest medical insights and health information to keep you informed about advancements in healthcare.
      </p>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article, index) => (
          <div key={index} className="bg-[#E6F6FE] rounded-lg shadow-md pb-4 hover:shadow-lg transition-shadow">
            <img src={article.image} alt={article.title} className="w-full p-6 rounded-t-lg mb-2" />
            <p className="text-[#011632] font-normal text-sm md:text-base mt-2 mb-2 px-6 text-right italic">~{article.author}</p>
            <h3 className="text-lg md:text-xl font-medium text-[#011632] mb-2 text-left px-6">{article.title}</h3>
            <p className="text-[#3C4959] px-6 mb-5 text-left text-sm md:text-base">{article.description}</p>
            <div className="px-6">
              <button className="bg-[#011632] w-full font-medium text-center text-sm md:text-base h-[40px] text-[#FFFFFF] px-4 py-1 rounded-md hover:bg-[#0a2254] transition-colors">
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsArticles;
