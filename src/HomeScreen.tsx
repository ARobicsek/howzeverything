import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SHADOWS, SPACING, STYLES, TYPOGRAPHY, UTILITIES } from './constants';
import { useTheme } from './hooks/useTheme';


const InfoCard: React.FC<{
  title: string;
  imageSrc: string;
  to: string;
}> = ({ title, imageSrc, to }) => {
  const [isHovering, setIsHovering] = React.useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();
 
  const handleClick = () => {
    navigate(to);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <button 
      onClick={handleClick}
      style={{ 
        textDecoration: 'none', 
        display: 'block',
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        width: '100%'
      }}
    >
      <div
        style={{
          ...STYLES.card,
          padding: 0,
          overflow: 'hidden',
          textAlign: 'center',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: isHovering ? 'scale(1.03)' : 'scale(1)',
          boxShadow: isHovering ? SHADOWS.large : SHADOWS.medium,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img src={imageSrc} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
        <div style={{ padding: SPACING[4] }}>
          <h3 style={{
            ...theme.fonts.heading,
            ...TYPOGRAPHY.h3,
            color: theme.colors.text,
            margin: 0,
          }}>
            {title}
          </h3>
        </div>
      </div>
    </button>
  );
};


const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    // This container is now set to fill the screen's height and has bottom padding.
    <div style={{
      ...UTILITIES.fullBleed,
      backgroundColor: theme.colors.navBarDark,
      minHeight: '100vh',
      boxSizing: 'border-box',
      paddingBottom: SPACING[8],
    }}>
      {/* HEADER SECTION */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: `calc(60px + ${SPACING[4]}) ${SPACING[4]} ${SPACING[6]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <p style={{
          ...theme.fonts.body,
          ...TYPOGRAPHY.lg,
          color: theme.colors.textWhite,
          lineHeight: 1.6,
          margin: 0,
        }}>
          Trying to figure out what to order? HowzEverything lets you embrace your inner food critic. Rate dishes yourself <i>and</i> see what the unwashed masses thought.
          <br />
          <strong>Never order a bad dish twice.</strong>
        </p>
      </div>


      {/* BODY SECTION - Added explicit horizontal padding for card margins. */}
      <main style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          paddingLeft: SPACING[4],
          paddingRight: SPACING[4],
        }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: SPACING[6],
        }}>
          <InfoCard
            title="Find a Restaurant and Start Dishing"
            imageSrc={theme.images.homeFindRestaurants}
            to="/find-restaurant"
          />
          <InfoCard
            title="Discover Dishes"
            imageSrc={theme.images.homeDiscoverDishes}
            to="/discover"
          />
        </div>
      </main>
    </div>
  );
};


export default HomeScreen;