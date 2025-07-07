import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS, SPACING, STYLES, TYPOGRAPHY } from './constants';

const AboutScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${SPACING[6]} ${SPACING[4]}`,
      paddingBottom: SPACING[12],
      color: COLORS.text,
    }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ ...TYPOGRAPHY.h1, textAlign: 'center', marginBottom: SPACING[8] }}>
          About HowzEverything
        </h1>

        <div style={{ ...TYPOGRAPHY.body, lineHeight: 1.7 }}>
          <p style={{ fontSize: TYPOGRAPHY.lg.fontSize, marginBottom: SPACING[6] }}>
            HowzEverything started from a simple, universal question: "What should I order?" We've all been there—staring at a long menu, overwhelmed by options, wishing we had a trusted friend's recommendation. This app is that friend.
          </p>

          <h2 style={{ ...TYPOGRAPHY.h2, marginTop: SPACING[8], marginBottom: SPACING[3] }}>
            Our Mission
          </h2>
          <p>
            Our mission is to end "menu anxiety" and help people make better dining decisions by focusing on what matters most: the food itself. While restaurant reviews are helpful, the quality of individual dishes can vary wildly. We empower a community of food lovers to rate and discover specific dishes, creating a global, dish-level guide to the world's best food.
          </p>

          <h2 style={{ ...TYPOGRAPHY.h2, marginTop: SPACING[8], marginBottom: SPACING[3] }}>
            How It Works
          </h2>
          <ol style={{ paddingLeft: SPACING[5], listStyle: 'decimal' }}>
            <li style={{ marginBottom: SPACING[3] }}>
              <strong>Search First:</strong> Find your restaurant and search for the dish you tried. This collaborative approach prevents duplicates and aggregates ratings effectively.
            </li>
            <li style={{ marginBottom: SPACING[3] }}>
              <strong>Rate Your Dish:</strong> Give the dish a star rating from 1 to 5. Was it a culinary masterpiece or blech? Your rating helps everyone (especially you, next time). You can add a photo and a comment too.
            </li>
            <li style={{ marginBottom: SPACING[3] }}>
              <strong>Discover with Confidence:</strong> Use the Discover screen to find the best-rated dishes near you. Filter by rating, distance, and cuisine to find exactly what you're craving.
            </li>
          </ol>

          <div style={{
            marginTop: SPACING[10],
            padding: SPACING[6],
            backgroundColor: COLORS.primaryLight,
            borderRadius: STYLES.borderRadiusLarge,
            textAlign: 'center'
          }}>
            <h3 style={{ ...TYPOGRAPHY.h3, marginTop: 0, marginBottom: SPACING[3], color: COLORS.primaryHover }}>
              Join the Community
            </h3>
            <p style={{ margin: `0 0 ${SPACING[4]} 0` }}>
              Your ratings make the experience better for everyone. Start by adding your favorite (and not-so-favorite) dishes today.
            </p>
            <Link to="/restaurants" style={{ ...STYLES.primaryButton }}>
              Start Dishing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;