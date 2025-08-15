import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div style={{
              background: theme.colors.aboutHeaderBackground,
              paddingTop: '84px',
              paddingBottom: '32px',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              width: '100%'
      }}>
        <div style={{
                width: '100%',
                maxWidth: theme.colors.aboutContainerMaxWidth,
                margin: '0 auto',
                padding: theme.colors.aboutContainerPadding,
                paddingBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
        }}>
          <img
            src={theme.images.aboutHero}
            alt="Person ordering food"
            style={{
                    width: theme.colors.aboutHeroImageWidth,
                    height: 'auto',
                    objectFit: 'contain',
                    marginBottom: '24px',
                    border: theme.colors.aboutHeroImageBorder,
                    borderRadius: theme.colors.aboutHeroImageBorderRadius
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
            textShadow: theme.colors.aboutHeadingTextShadow
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
        padding: theme.colors.aboutSectionPadding,
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        overflowX: 'hidden'
      }}>
        <div style={{
                maxWidth: theme.colors.aboutContainerMaxWidth,
                margin: '0 auto',
                padding: theme.colors.aboutContainerPadding,
                lineHeight: '1.7'
        }}>
          <h2 style={{
                  ...theme.fonts.heading,
                  fontSize: '2rem',
                  fontWeight: theme.colors.aboutHeadingFontWeight,
                  color: theme.colors.aboutHeadingColor,
                  lineHeight: theme.colors.aboutHeadingLineHeight,
                  marginTop: 0,
                  marginBottom: '24px',
                  textShadow: theme.colors.aboutHeadingTextShadow
          }}>
            Our Mission
          </h2>
          <p style={{
                  ...theme.fonts.body,
                  fontSize: theme.colors.aboutBodyFontSize,
                  color: theme.colors.aboutBodyColor,
                  lineHeight: '1.7',
                  marginBottom: '32px'
          }}>
            Hate wasting money on lousy food? Us too! Our mission is to end "menu anxiety" and help people make better dining decisions by focusing on what matters most: the food itself. While restaurant reviews are helpful, the quality of individual dishes can vary wildly. We empower a community of food lovers to rate and discover specific dishes, creating a global, dish-level guide to restaurant food.
          </p>

          <h2 style={{
                  ...theme.fonts.heading,
                  fontSize: '2rem',
                  fontWeight: theme.colors.aboutHeadingFontWeight,
                  color: theme.colors.aboutHeadingColor,
                  lineHeight: theme.colors.aboutHeadingLineHeight,
                  marginTop: '64px',
                  marginBottom: '24px',
                  textShadow: theme.colors.aboutHeadingTextShadow
          }}>
            How It Works
          </h2>
          <ol style={{
                  paddingLeft: '32px',
                  listStyle: 'decimal',
                  margin: 0
          }}>
            <li style={{
                    ...theme.fonts.body,
                    fontSize: theme.colors.aboutBodyFontSize,
                    color: theme.colors.aboutBodyColor,
                    lineHeight: '1.7',
                    marginBottom: '24px'
            }}>
              <strong>Search First:</strong> Find your restaurant. See which dishes other people liked (and hated). Go ahead and order. (Good luck!)
            </li>
            <li style={{
                    ...theme.fonts.body,
                    fontSize: theme.colors.aboutBodyFontSize,
                    color: theme.colors.aboutBodyColor,
                    lineHeight: '1.7',
                    marginBottom: '24px'
            }}>
              <strong>Rate Your Dish:</strong> Culinary masterpiece or blech? Your rating helps everyone (especially you, next time). You can add a photo and a comment too. Don't see the dish? Add it!
            </li>
          </ol>

          <h2 style={{
                  ...theme.fonts.heading,
                  fontSize: '2rem',
                  fontWeight: theme.colors.aboutHeadingFontWeight,
                  color: theme.colors.aboutHeadingColor,
                  lineHeight: theme.colors.aboutHeadingLineHeight,
                  marginTop: '64px',
                  marginBottom: '24px',
                  textShadow: theme.colors.aboutHeadingTextShadow
          }}>
            Also...
          </h2>
          <p style={{
                  ...theme.fonts.body,
                  fontSize: theme.colors.aboutBodyFontSize,
                  color: theme.colors.aboutBodyColor,
                  lineHeight: '1.7',
                  marginBottom: '40px'
          }}>
            <strong>Discover with Confidence:</strong> Hankering for a specific dish? Use the Discover Dishes screen to find the best-rated version near you.
          </p>

          <div style={{
                  marginTop: '80px',
                  padding: '48px',
                  backgroundColor: theme.colors.aboutCtaCardBackground,
                  borderRadius: '24px',
                  textAlign: 'center',
                  border: theme.colors.aboutCtaCardBorder,
                  boxShadow: theme.colors.aboutCtaCardBoxShadow
          }}>
            <h3 style={{
                    ...theme.fonts.heading,
                    fontSize: theme.colors.aboutCtaHeadingFontSize,
                    fontWeight: theme.colors.aboutCtaHeadingFontWeight,
                    lineHeight: theme.colors.aboutCtaHeadingLineHeight,
                    marginTop: 0,
                    marginBottom: '24px',
                    color: theme.colors.aboutCtaHeadingColor,
                    textShadow: theme.colors.aboutHeadingTextShadow
            }}>
              Join the Community
            </h3>
            <p style={{
                    ...theme.fonts.body,
                    fontSize: theme.colors.aboutBodyFontSize,
                    margin: '0 0 32px 0',
                    lineHeight: theme.colors.aboutCtaBodyLineHeight,
                    color: theme.colors.aboutBodyColor
            }}>
              Your ratings make restauranting better for everyone. Start by rating your favorite (and not-so-favorite) dishes today.
            </p>
            <button onClick={handleStartDishing} style={{
                    ...theme.fonts.body,
                    display: 'inline-block',
                    padding: theme.colors.aboutCtaButtonPadding,
                    backgroundColor: theme.colors.aboutCtaButtonBackground,
                    color: theme.colors.white,
                    textDecoration: 'none',
                    borderRadius: theme.colors.aboutButtonBorderRadius,
                    fontSize: theme.colors.aboutButtonFontSize,
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    textShadow: theme.colors.aboutCtaButtonTextShadow,
                    boxShadow: theme.colors.aboutCtaButtonBoxShadow
            }}>
              Start Dishing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default AboutScreen;