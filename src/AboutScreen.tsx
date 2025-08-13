import React from 'react';
import { Link } from 'react-router-dom';
import { SCREEN_STYLES, createFullWidthBackground } from './constants';




const AboutScreen: React.FC = () => {
  return (
    <div>
      {/* HEADER SECTION */}
      <div style={SCREEN_STYLES.about.header}>
        <div style={SCREEN_STYLES.about.headerInner}>
          <img
            src="/90s about us.png"
            alt="Person ordering food"
            style={SCREEN_STYLES.about.headerImage}
          />
          <h1 style={SCREEN_STYLES.about.headerTitle}>
            About HowzEverything
          </h1>
          <p style={SCREEN_STYLES.about.headerSubtitle}>
            HowzEverything started from a simple, universal question: "What should I order?" We've all been there—staring at a long menu, overwhelmed by options, wishing we had a trusted friend's recommendation. <strong>This app is that friend.</strong>
          </p>
        </div>
      </div>




      {/* BODY SECTION */}
      <div style={SCREEN_STYLES.about.body}>
        <div style={SCREEN_STYLES.about.bodyInner}>
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