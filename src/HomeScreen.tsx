import React from 'react';
import { Link } from 'react-router-dom';
import { SCREEN_STYLES, STYLE_FUNCTIONS } from './constants';


const InfoCard: React.FC<{
  title: string;
  imageSrc: string;
  to: string;
}> = ({ title, imageSrc, to }) => {
  const [isHovering, setIsHovering] = React.useState(false);
 
  return (
    <Link to={to} style={SCREEN_STYLES.home.infoCard.link}>
      <div
        style={STYLE_FUNCTIONS.getHomeScreenInfoCardStyle(isHovering)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img src={imageSrc} alt={title} style={SCREEN_STYLES.home.infoCard.image} />
        <div style={SCREEN_STYLES.home.infoCard.content}>
          <h3 style={SCREEN_STYLES.home.infoCard.title}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
};


const HomeScreen: React.FC = () => {
  return (
    // This container is now set to fill the screen's height and has bottom padding.
    <div style={SCREEN_STYLES.home.container}>
      {/* HEADER SECTION */}
      <div style={SCREEN_STYLES.home.headerContainer}>
        <p style={SCREEN_STYLES.home.headerText}>
          Trying to figure out what to order? HowzEverything lets you embrace your inner food critic. Rate dishes yourself <i>and</i> see what the unwashed masses thought.
          <br />
          <strong>Never order a bad dish twice.</strong>
        </p>
      </div>


      {/* BODY SECTION - Added explicit horizontal padding for card margins. */}
      <main style={SCREEN_STYLES.home.mainContent}>
        <div style={SCREEN_STYLES.home.gridContainer}>
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