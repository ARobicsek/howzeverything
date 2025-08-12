import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY, UTILITIES } from './constants';


const InfoCard: React.FC<{
  title: string;
  imageSrc: string;
  to: string;
}> = ({ title, imageSrc, to }) => {
  const [isHovering, setIsHovering] = React.useState(false);
 
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          ...STYLES.card,
          padding: 0,
          overflow: 'hidden',
          textAlign: 'center',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: isHovering ? 'scale(1.03)' : 'scale(1)',
          boxShadow: isHovering ? STYLES.shadowLarge : STYLES.shadowMedium,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img src={imageSrc} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
        <div style={{ padding: SPACING[4] }}>
          <h3 style={{
            ...FONTS.heading,
            ...TYPOGRAPHY.h3,
            color: COLORS.text,
            margin: 0,
          }}>
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
    <div style={{
      ...UTILITIES.fullBleed,
      backgroundColor: COLORS.navBarDark,
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
          ...FONTS.body,
          ...TYPOGRAPHY.lg,
          color: COLORS.textWhite,
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