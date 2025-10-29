import React from "react";

export default function AboutUsPage() {
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>About LUXE</h1>
          <p style={subtitleStyle}>Redefining Fashion, One Style at a Time</p>
        </div>

        <div style={contentGridStyle}>
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>🎯 Our Mission</h2>
            <p style={cardTextStyle}>
              At LUXE, we believe that fashion is more than just clothing—it's a form of self-expression. 
              Our mission is to provide high-quality, stylish products that empower individuals to express 
              their unique personality and confidence.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>⭐ Our Story</h2>
            <p style={cardTextStyle}>
              Founded in 2020, LUXE started as a small boutique with a big vision. Today, we've grown into 
              a premier fashion destination, offering curated collections that blend contemporary trends 
              with timeless elegance.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>💎 Our Values</h2>
            <ul style={listStyle}>
              <li>Quality craftsmanship in every product</li>
              <li>Sustainable and ethical sourcing</li>
              <li>Customer satisfaction as our top priority</li>
              <li>Innovation in fashion and technology</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>🚀 What We Offer</h2>
            <ul style={listStyle}>
              <li>Premium fashion collections for men and women</li>
              <li>Exclusive deals and seasonal offers</li>
              <li>Fast and reliable shipping</li>
              <li>24/7 customer support</li>
              <li>Easy returns and exchanges</li>
            </ul>
          </div>
        </div>

        <div style={teamSectionStyle}>
          <h2 style={sectionTitleStyle}>Meet Our Team</h2>
          <div style={teamGridStyle}>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>👨‍💼</div>
              <h3 style={memberNameStyle}>Alex Johnson</h3>
              <p style={memberRoleStyle}>CEO & Founder</p>
            </div>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>👩‍🎨</div>
              <h3 style={memberNameStyle}>Sarah Miller</h3>
              <p style={memberRoleStyle}>Creative Director</p>
            </div>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>👨‍💻</div>
              <h3 style={memberNameStyle}>Mike Chen</h3>
              <p style={memberRoleStyle}>Tech Lead</p>
            </div>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>👩‍💼</div>
              <h3 style={memberNameStyle}>Emily Davis</h3>
              <p style={memberRoleStyle}>Customer Success</p>
            </div>
          </div>
        </div>

        <div style={statsSectionStyle}>
          <h2 style={sectionTitleStyle}>Our Impact</h2>
          <div style={statsGridStyle}>
            <div style={statItemStyle}>
              <h3 style={statNumberStyle}>50K+</h3>
              <p style={statLabelStyle}>Happy Customers</p>
            </div>
            <div style={statItemStyle}>
              <h3 style={statNumberStyle}>100+</h3>
              <p style={statLabelStyle}>Brand Partners</p>
            </div>
            <div style={statItemStyle}>
              <h3 style={statNumberStyle}>25+</h3>
              <p style={statLabelStyle}>Countries Served</p>
            </div>
            <div style={statItemStyle}>
              <h3 style={statNumberStyle}>98%</h3>
              <p style={statLabelStyle}>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)',
  padding: '40px 0',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '50px',
};

const titleStyle = {
  fontSize: '3.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '10px',
};

const subtitleStyle = {
  fontSize: '1.3rem',
  color: '#d1d5db',
};

const contentGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px',
  marginBottom: '50px',
};

const cardStyle = {
  background: 'rgba(17, 25, 40, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '30px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  transition: 'transform 0.3s ease',
};

const cardTitleStyle = {
  fontSize: '1.5rem',
  color: '#fff',
  marginBottom: '15px',
};

const cardTextStyle = {
  color: '#d1d5db',
  lineHeight: '1.6',
  fontSize: '1rem',
};

const listStyle = {
  color: '#d1d5db',
  lineHeight: '1.8',
  paddingLeft: '20px',
};

const teamSectionStyle = {
  marginBottom: '50px',
};

const sectionTitleStyle = {
  fontSize: '2.5rem',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '30px',
  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const teamGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '30px',
};

const teamMemberStyle = {
  background: 'rgba(17, 25, 40, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '25px',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  transition: 'transform 0.3s ease',
};

const avatarStyle = {
  fontSize: '3rem',
  marginBottom: '15px',
};

const memberNameStyle = {
  fontSize: '1.2rem',
  color: '#fff',
  marginBottom: '5px',
};

const memberRoleStyle = {
  color: '#22c55e',
  fontSize: '0.9rem',
};

const statsSectionStyle = {
  marginBottom: '50px',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '30px',
};

const statItemStyle = {
  background: 'rgba(17, 25, 40, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '30px',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const statNumberStyle = {
  fontSize: '2.5rem',
  color: '#22c55e',
  fontWeight: 'bold',
  marginBottom: '10px',
};

const statLabelStyle = {
  color: '#d1d5db',
  fontSize: '1rem',
};