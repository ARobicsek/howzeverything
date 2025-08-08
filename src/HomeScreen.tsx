import React from 'react';
import { Link } from 'react-router-dom';

const InfoCard: React.FC<{
  title: string;
  imageSrc: string;
  to: string;
}> = ({ title, imageSrc, to }) => (
  <Link to={to} className="no-underline block group">
    <div className="bg-cardBg p-0 overflow-hidden text-center transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-lg shadow-md rounded-lg">
      <img src={imageSrc} alt={title} className="w-full h-auto block" />
      <div className="p-4">
        <h3 className="font-heading text-xl text-text m-0">{title}</h3>
      </div>
    </div>
  </Link>
);

const HomeScreen: React.FC = () => {
  return (
    <div className="bg-navBarDark -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)] min-h-screen box-border pb-8">
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-6 flex flex-col items-center text-center">
        <p className="font-body text-lg text-textWhite leading-relaxed m-0">
          Trying to figure out what to order? HowzEverything lets you embrace your inner food critic. Rate dishes yourself <i>and</i> see what the unwashed masses thought.
          <br />
          <strong className="font-bold">Never order a bad dish twice.</strong>
        </p>
      </div>

      <main className="max-w-xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-6">
          <InfoCard
            title="Find a Restaurant and Start Dishing"
            imageSrc="/critic_2.png"
            to="/find-restaurant"
          />
          <InfoCard
            title="Discover Dishes"
            imageSrc="/explorer_2.png"
            to="/discover"
          />
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;