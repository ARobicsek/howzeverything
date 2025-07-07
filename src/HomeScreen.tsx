import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from './constants';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${SPACING[6]} ${SPACING[4]}`,
      paddingBottom: SPACING[12], // Extra bottom padding
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        
        {/* Hero Text */}
        <p style={{
          ...FONTS.body,
          ...TYPOGRAPHY.lg,
          color: COLORS.textSecondary,
          lineHeight: 1.6,
          marginBottom: SPACING[10],
        }}>
          Trying to figure out what to order? HowzEverything lets you embrace your inner food critic, rating dishes and seeing what everyone else thought. 
          <br />
          Never order a bad dish twice!
        </p>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: SPACING[6],
        }}>
          <InfoCard 
            title="Start Dishing"
            imageSrc="/critic.png"
            to="/restaurants"
          />
          <InfoCard 
            title="Discover Dishes"
            imageSrc="/discover_dishes.png"
            to="/discover"
          />
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;