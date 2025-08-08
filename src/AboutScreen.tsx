import React from 'react';
import { Link } from 'react-router-dom';

const AboutScreen: React.FC = () => {
  return (
    <div>
      <div className="bg-navBarDark -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)]">
        <div className="max-w-3xl mx-auto px-8 py-12 pt-24 flex flex-col items-center text-center">
          <img
            src="/ordering.png"
            alt="Person ordering food"
            className="w-48 h-auto object-contain mb-4 border-2 border-white rounded-md"
          />
          <h1 className="text-3xl text-textWhite mb-4 font-heading">
            About HowzEverything
          </h1>
          <p className="text-base text-textWhite leading-relaxed">
            HowzEverything started from a simple, universal question: "What should I order?" We've all been there—staring at a long menu, overwhelmed by options, wishing we had a trusted friend's recommendation. <strong>This app is that friend.</strong>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 px-4 pb-12 text-text">
        <div className="font-body leading-relaxed">
          <h2 className="text-2xl mt-0 mb-3 font-heading">
            Our Mission
          </h2>
          <p>
            Hate wasting money on lousy food? Us too! Our mission is to end "menu anxiety" and help people make better dining decisions by focusing on what matters most: the food itself. While restaurant reviews are helpful, the quality of individual dishes can vary wildly. We empower a community of food lovers to rate and discover specific dishes, creating a global, dish-level guide to restaurant food.
          </p>

          <h2 className="text-2xl mt-8 mb-3 font-heading">
            How It Works
          </h2>
          <ol className="pl-5 list-decimal">
            <li className="mb-3">
              <strong>Search First:</strong> Find your restaurant. See which dishes other people liked (and hated). Go ahead and order. (Good luck!)
            </li>
            <li className="mb-3">
              <strong>Rate Your Dish:</strong> Culinary masterpiece or blech? Your rating helps everyone (especially you, next time). You can add a photo and a comment too. Don't see the dish? Add it!
            </li>
          </ol>

          <h2 className="text-2xl mt-8 mb-3 font-heading">
            Also...
          </h2>
          <p>
            <strong>Discover with Confidence:</strong> Hankering for a specific dish? Use the Discover Dishes screen to find the best-rated version near you.
          </p>

          <div className="mt-10 p-6 bg-[#cac2af] rounded-lg text-center">
            <h3 className="text-xl mt-0 mb-3 text-accent font-heading">
              Join the Community
            </h3>
            <p className="mb-4">
              Your ratings make restauranting better for everyone. Start by rating your favorite (and not-so-favorite) dishes today.
            </p>
            <Link to="/find-restaurant" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-accent text-white no-underline transition-colors hover:bg-accent-dark">
              Start Dishing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;