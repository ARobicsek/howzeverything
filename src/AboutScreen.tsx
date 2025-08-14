import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SCREEN_STYLES, UTILITIES } from './constants';
import { useTheme } from './hooks/useTheme';




const AboutScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleStartDishing = () => {
    navigate('/find-restaurant');
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  return (
    <div style={{ 
      width: '100vw',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: theme.colors.background, 
      minHeight: '100vh'
    }}>
      {/* HEADER SECTION */}
      <div style={
        theme.colors.background === '#0D0515' 
          ? {
              background: 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)',
              paddingTop: '84px',
              paddingBottom: '32px',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center'
            }
          : {
              backgroundColor: theme.colors.navBarDark,
              width: '100%',
              paddingTop: '84px',
              paddingBottom: '32px'
            }
      }>
        <div style={
          theme.colors.background === '#0D0515' 
            ? {
                width: '100%',
                maxWidth: '512px',
                margin: '0 auto',
                padding: '0 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }
            : {
                maxWidth: '700px',
                margin: '0 auto',
                padding: '0 32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }
        }>
          <img
            src={theme.images.aboutHero}
            alt="Person ordering food"
            style={
              theme.colors.background === '#0D0515' 
                ? {
                    width: '200px',
                    height: '200px',
                    objectFit: 'contain',
                    marginBottom: '24px',
                    border: 'none',
                    borderRadius: '0px'
                  }
                : {
                    width: '180px',
                    height: 'auto',
                    objectFit: 'contain',
                    marginBottom: '24px',
                    border: `2px solid ${theme.colors.white}`,
                    borderRadius: '12px'
                  }
            }
          />
          <h1 style={{
            ...theme.fonts.heading,
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.colors.white,
            margin: 0,
            marginBottom: '24px',
            textAlign: 'center',
            ...(theme.colors.background === '#0D0515' && {
              textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff'
            })
          }}>
            About HowzEverything
          </h1>
          <p style={{
            ...theme.fonts.body,
            fontSize: '1.125rem',
            color: theme.colors.white,
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.6',
            maxWidth: '500px'
          }}>
            HowzEverything started from a simple, universal question: "What should I order?" We've all been there—staring at a long menu, overwhelmed by options, wishing we had a trusted friend's recommendation. <strong>This app is that friend.</strong>
          </p>
        </div>
      </div>




      {/* BODY SECTION */}
      <div style={{
        backgroundColor: theme.colors.background,
        minHeight: '100vh',
        padding: theme.colors.background === '#0D0515' ? '24px 0' : '64px 0 96px',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        overflowX: 'hidden'
      }}>
        <div style={
          theme.colors.background === '#0D0515' 
            ? {
                maxWidth: '700px',
                margin: '0 auto',
                padding: '0 24px'
              }
            : {
                maxWidth: '700px',
                margin: '0 auto',
                padding: '0 32px',
                lineHeight: '1.7'
              }
        }>
          <h2 style={
            theme.colors.background === '#0D0515' 
              ? {
                  ...theme.fonts.heading,
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: theme.colors.white,
                  marginTop: 0,
                  marginBottom: '24px',
                  textShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff'
                }
              : {
                  fontSize: '2rem',
                  fontWeight: '600',
                  lineHeight: '2.5rem',
                  color: theme.colors.gray900,
                  marginTop: 0,
                  marginBottom: '24px'
                }
          }>
            Our Mission
          </h2>
          <p style={
            theme.colors.background === '#0D0515' 
              ? {
                  ...theme.fonts.body,
                  fontSize: '1.125rem',
                  color: theme.colors.white,
                  lineHeight: '1.7',
                  marginBottom: '32px'
                }
              : {
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: theme.colors.text,
                  marginBottom: '32px'
                }
          }>
            Hate wasting money on lousy food? Us too! Our mission is to end "menu anxiety" and help people make better dining decisions by focusing on what matters most: the food itself. While restaurant reviews are helpful, the quality of individual dishes can vary wildly. We empower a community of food lovers to rate and discover specific dishes, creating a global, dish-level guide to restaurant food.
          </p>

          <h2 style={
            theme.colors.background === '#0D0515' 
              ? {
                  ...theme.fonts.heading,
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: theme.colors.white,
                  marginTop: '64px',
                  marginBottom: '24px',
                  textShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff'
                }
              : {
                  fontSize: '2rem',
                  fontWeight: '600',
                  lineHeight: '2.5rem',
                  color: theme.colors.gray900,
                  marginTop: '64px',
                  marginBottom: '24px'
                }
          }>
            How It Works
          </h2>
          <ol style={
            theme.colors.background === '#0D0515' 
              ? {
                  paddingLeft: '32px',
                  listStyle: 'decimal',
                  margin: 0
                }
              : {
                  paddingLeft: '32px',
                  listStyle: 'decimal',
                  margin: 0
                }
          }>
            <li style={
              theme.colors.background === '#0D0515' 
                ? {
                    ...theme.fonts.body,
                    fontSize: '1.125rem',
                    color: theme.colors.white,
                    lineHeight: '1.7',
                    marginBottom: '24px'
                  }
                : {
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    color: theme.colors.text,
                    marginBottom: '24px'
                  }
            }>
              <strong>Search First:</strong> Find your restaurant. See which dishes other people liked (and hated). Go ahead and order. (Good luck!)
            </li>
            <li style={
              theme.colors.background === '#0D0515' 
                ? {
                    ...theme.fonts.body,
                    fontSize: '1.125rem',
                    color: theme.colors.white,
                    lineHeight: '1.7',
                    marginBottom: '24px'
                  }
                : {
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    color: theme.colors.text,
                    marginBottom: '24px'
                  }
            }>
              <strong>Rate Your Dish:</strong> Culinary masterpiece or blech? Your rating helps everyone (especially you, next time). You can add a photo and a comment too. Don't see the dish? Add it!
            </li>
          </ol>

          <h2 style={
            theme.colors.background === '#0D0515' 
              ? {
                  ...theme.fonts.heading,
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: theme.colors.white,
                  marginTop: '64px',
                  marginBottom: '24px',
                  textShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff'
                }
              : {
                  fontSize: '2rem',
                  fontWeight: '600',
                  lineHeight: '2.5rem',
                  color: theme.colors.gray900,
                  marginTop: '64px',
                  marginBottom: '24px'
                }
          }>
            Also...
          </h2>
          <p style={
            theme.colors.background === '#0D0515' 
              ? {
                  ...theme.fonts.body,
                  fontSize: '1.125rem',
                  color: theme.colors.white,
                  lineHeight: '1.7',
                  marginBottom: '40px'
                }
              : {
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: theme.colors.text,
                  marginBottom: '40px'
                }
          }>
            <strong>Discover with Confidence:</strong> Hankering for a specific dish? Use the Discover Dishes screen to find the best-rated version near you.
          </p>

          <div style={
            theme.colors.background === '#0D0515' 
              ? {
                  marginTop: '80px',
                  padding: '48px',
                  backgroundColor: 'rgba(255, 0, 255, 0.1)',
                  borderRadius: '24px',
                  textAlign: 'center',
                  border: '2px solid #ff00ff',
                  boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1)'
                }
              : {
                  marginTop: '80px',
                  padding: '48px',
                  backgroundColor: '#cac2af',
                  borderRadius: '24px',
                  textAlign: 'center'
                }
          }>
            <h3 style={
              theme.colors.background === '#0D0515' 
                ? {
                    ...theme.fonts.heading,
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    marginTop: 0,
                    marginBottom: '24px',
                    color: '#fecd06',
                    textShadow: '0 0 15px #fecd06, 0 0 30px #fecd06'
                  }
                : {
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    lineHeight: '2rem',
                    marginTop: 0,
                    marginBottom: '24px',
                    color: theme.colors.accent
                  }
            }>
              Join the Community
            </h3>
            <p style={
              theme.colors.background === '#0D0515' 
                ? {
                    ...theme.fonts.body,
                    fontSize: '1.125rem',
                    margin: '0 0 32px 0',
                    lineHeight: '1.6',
                    color: theme.colors.white
                  }
                : {
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    margin: '0 0 32px 0',
                    color: theme.colors.text
                  }
            }>
              Your ratings make restauranting better for everyone. Start by rating your favorite (and not-so-favorite) dishes today.
            </p>
            <button onClick={handleStartDishing} style={
              theme.colors.background === '#0D0515' 
                ? {
                    ...theme.fonts.body,
                    display: 'inline-block',
                    padding: '16px 32px',
                    backgroundColor: '#ff00ff',
                    color: theme.colors.white,
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 20px #ff00ff, 0 4px 15px rgba(255, 0, 255, 0.4)'
                  }
                : {
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.white,
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }
            }>
              Start Dishing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default AboutScreen;