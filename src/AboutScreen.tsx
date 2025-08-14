import React from 'react';
import { Link } from 'react-router-dom';
import { SCREEN_STYLES } from './constants';
import { useTheme } from './hooks/useTheme';




const AboutScreen: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div style={{ backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      {/* HEADER SECTION */}
      <div style={{
        background: theme.colors.background === '#0D0515' 
          ? 'linear-gradient(135deg, #0D0515 0%, #2d1b69 50%, #0D0515 100%)'
          : theme.colors.primary,
        paddingTop: '84px',
        paddingBottom: '32px',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '512px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img
            src={theme.images.aboutHero}
            alt="Person ordering food"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'contain',
              marginBottom: '24px',
              border: theme.colors.background === '#0D0515' 
                ? 'none'
                : `3px solid ${theme.colors.white}`,
              borderRadius: theme.colors.background === '#0D0515' 
                ? '0px'
                : '16px',
              boxShadow: theme.colors.background === '#0D0515' 
                ? 'none'
                : '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
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
        padding: '24px 0'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <h2 style={SCREEN_STYLES.about.sectionTitle}>
            Our Mission
          </h2>
          <p>
            Hate wasting money on lousy food? Us too! Our mission is to end "menu anxiety" and help people make better dining decisions by focusing on what matters most: the food itself. While restaurant reviews are helpful, the quality of individual dishes can vary wildly. We empower a community of food lovers to rate and discover specific dishes, creating a global, dish-level guide to restaurant food.
          </p>




          <h2 style={SCREEN_STYLES.about.sectionTitleSpaced}>
            How It Works
          </h2>
          <ol style={SCREEN_STYLES.about.list}>
            <li style={SCREEN_STYLES.about.listItem}>
              <strong>Search First:</strong> Find your restaurant. See which dishes other people liked (and hated). Go ahead and order. (Good luck!)
            </li>
            <li style={SCREEN_STYLES.about.listItem}>
              <strong>Rate Your Dish:</strong> Culinary masterpiece or blech? Your rating helps everyone (especially you, next time). You can add a photo and a comment too. Don't see the dish? Add it!
            </li>
          </ol>

          <h2 style={SCREEN_STYLES.about.sectionTitleSpaced}>
            Also...
          </h2>
          <p>
            <strong>Discover with Confidence:</strong> Hankering for a specific dish? Use the Discover Dishes screen to find the best-rated version near you.
          </p>

          <div style={SCREEN_STYLES.about.communityBox}>
            <h3 style={SCREEN_STYLES.about.communityTitle}>
              Join the Community
            </h3>
            <p style={SCREEN_STYLES.about.communityText}>
              Your ratings make restauranting better for everyone. Start by rating your favorite (and not-so-favorite) dishes today.
            </p>
            <Link to="/find-restaurant" style={SCREEN_STYLES.about.communityLink}>
              Start Dishing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};




export default AboutScreen;