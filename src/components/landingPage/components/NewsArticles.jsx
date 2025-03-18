import React from "react";
import Healthhygenic from "../assets/HealthHygenic.svg"
import SaltRichDiet from "../assets/SaltRichDiet.svg"
import MuchGoOnDiet from "../assets/MuchGoOnDiet.svg"
import Vector2 from "../assets/Vector2.svg";

const NewsArticles = () => {
  const articles = [
    {
      image: `${Healthhygenic}`,
      author: "Anita Jackson",
      title: "Health and Hygiene",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt.",
    },
    {
      image: `${SaltRichDiet}`,
      author:"Anita Jackson",
      title: "Salt-rich diet gets a lashing",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt.",
    },
    {
      image: `${MuchGoOnDiet}`,
      author: "Anita Jackson",
      title: "Much go on diet",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt.",
    },
  ];

  return (
    <div className="bg-white py-16 px-6 md:px-12 lg:px-20 text-center w-[97%]">
      
        <h2 className="font-inter font-semibold text-[42px] leading-[125%] text-[#011632] tracking-normal text-center capitalize">News & Articles</h2>
        <img src={Vector2} alt="" className="w-[322px] mx-auto  mb-5 " />
      <p className="font-inter font-normal text-[18px] text-[#3C4959] mx-auto mb-10 text-center capitalize xl:w-[650px]">
        We use only the best quality materials on the market in order to provide the best products to our patients.
      </p>
      <div className="grid md:grid-cols-3  gap-8">
        {articles.map((article, index) => (
          <div key={index} className="bg-[#E6F6FE] p-8 rounded-[12px] lg:h-[557px]  shadow-md">
            <img src={article.image} alt={article.title} className="w-full h-[230px]  rounded-[10px] mb-4" />
            <p className="text-[#011632] font-normal text-[16px] mt-6 mb-6 mr-7 text-right">~{article.author}</p>
           
            <h3 className="text-[18px] font-[500] font-inter text-[#011632] mb-2 text-left ml-7">{article.title}</h3>
            <p className="text-[#3C4959] w-[250px] mb-4 text-left ml-7">{article.description}</p>
            <button className="bg-[#011632] w-[286px] font-[500]  text-center text-[16px] h-[35px] text-[#FFFFFF] px-6 py-1 rounded-[5px]">know more</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsArticles;
