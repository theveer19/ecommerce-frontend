import React from "react";
import { motion } from "framer-motion";
import { Truck, Clock, Globe } from "lucide-react";

// --- ANIMATION CONFIGURATION ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 } 
  }
};

export default function AboutUsPage() {
  return (
    <div style={pageStyle}>
      <motion.div 
        style={containerStyle}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* --- HEADER --- */}
        <motion.div style={headerStyle} variants={itemVariants}>
          <h1 style={titleStyle}>About OneT</h1>
          <p style={subtitleStyle}>Redefining Fashion, One Style at a Time</p>
        </motion.div>

        {/* --- 🚀 NEW: 3D DELIVERY HIGHLIGHT SECTION --- */}
        <motion.div 
          style={deliverySectionStyle} 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }} // Slight 3D lift
        >
          <div style={deliveryContentStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              <Truck size={48} color="#FFA500" />
              <h2 style={deliveryTitleStyle}>Lightning Fast Delivery</h2>
            </div>
            
            <p style={deliveryTextStyle}>
              We value your time as much as your style. Experience the future of shopping.
            </p>

            <div style={deliveryGridStyle}>
              {/* Gwalior Status */}
              <motion.div style={deliveryCardStyle} whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(138, 43, 226, 0.3)' }}>
                <Clock size={32} color="#8A2BE2" style={{ marginBottom: 10 }} />
                <h3 style={highlightText}>35 Minutes</h3>
                <p style={subText}>Delivery in <strong>Gwalior</strong></p>
                <div style={activeBadge}>● LIVE NOW</div>
              </motion.div>

              {/* Expansion Status */}
              <motion.div style={deliveryCardStyle} whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(255, 140, 0, 0.3)' }}>
                <Globe size={32} color="#FF8C00" style={{ marginBottom: 10 }} />
                <h3 style={highlightText}>Your City</h3>
                <p style={subText}>Expansion in Progress</p>
                <div style={comingSoonBadge}>EXPLORING...</div>
              </motion.div>
            </div>
          </div>
        </motion.div>


        {/* --- INFO GRID (3D Cards) --- */}
        <div style={contentGridStyle}>
          <TiltCard title="Our Mission">
             At OneT, we believe that fashion is more than just clothing—it's a form of self-expression. 
             Our mission is to provide high-quality, stylish products that empower individuals to express 
             their unique personality and confidence.
          </TiltCard>

          <TiltCard title="Our Story">
             Founded in 2025, OneT started as a small boutique with a big vision. Today, we've grown into 
             a premier fashion destination, offering curated collections that blend contemporary trends 
             with timeless elegance.
          </TiltCard>

          <TiltCard title="Our Values">
            <ul style={listStyle}>
              <li>Quality craftsmanship in every product</li>
              <li>Sustainable and ethical sourcing</li>
              <li>Customer satisfaction as our top priority</li>
              <li>Innovation in fashion and technology</li>
            </ul>
          </TiltCard>

          <TiltCard title="What We Offer">
            <ul style={listStyle}>
              <li>Premium fashion collections for men and women</li>
              <li>Exclusive deals and seasonal offers</li>
              <li>Fast and reliable shipping</li>
              <li>24/7 customer support</li>
              <li>Easy returns and exchanges</li>
            </ul>
          </TiltCard>
        </div>

        {/* --- TEAM --- */}
        <motion.div style={teamSectionStyle} variants={itemVariants}>
          <h2 style={sectionTitleStyle}>Meet The Founders</h2>
          <div style={teamGridStyle}>
            <TeamCard name="Veer Gurjar" role="Co-Founder & Tech Lead" emoji="👨‍💻" />
            <TeamCard name="Aman Shivhare" role="Co-Founder & Creative Director" emoji="👨‍🎨" />
            <TeamCard name="Team OneT" role="Operations & Support" emoji="🚀" />
          </div>
        </motion.div>

        {/* --- IMPACT STATS --- */}
        <motion.div style={statsSectionStyle} variants={itemVariants}>
          <h2 style={sectionTitleStyle}>Our Impact</h2>
          <div style={statsGridStyle}>
            <StatCard number="50K+" label="Happy Customers" />
            <StatCard number="100+" label="Brand Partners" />
            <StatCard number="25+" label="Cities Served" />
            <StatCard number="98%" label="Satisfaction Rate" />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

// --- 3D COMPONENTS ---

const TiltCard = ({ title, children }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ 
      scale: 1.05, 
      rotateX: 5, 
      rotateY: 5,
      boxShadow: "0px 20px 40px rgba(138, 43, 226, 0.2)" // Purple glow on hover
    }}
    style={cardStyle}
  >
    <h2 style={cardTitleStyle}>{title}</h2>
    <div style={cardTextStyle}>{children}</div>
  </motion.div>
);

const TeamCard = ({ name, role, emoji }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -10, scale: 1.05 }}
    style={teamMemberStyle}
  >
    <div style={avatarStyle}>{emoji}</div>
    <h3 style={memberNameStyle}>{name}</h3>
    <p style={memberRoleStyle}>{role}</p>
  </motion.div>
);

const StatCard = ({ number, label }) => (
  <motion.div 
    variants={itemVariants} 
    whileHover={{ scale: 1.1 }}
    style={statItemStyle}
  >
    <h3 style={statNumberStyle}>{number}</h3>
    <p style={statLabelStyle}>{label}</p>
  </motion.div>
);


// --- STYLES ---

const pageStyle = {
  minHeight: '100vh',
  background: '#0a0a0a', 
  backgroundImage: 'radial-gradient(circle at 50% 0%, #1a0b2e 0%, #000000 100%)', // Subtle purple glow at top
  padding: '120px 0 40px 0',
  color: 'white',
  overflowX: 'hidden',
  fontFamily: '"Inter", sans-serif'
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '60px',
};

const titleStyle = {
  fontSize: '4rem',
  fontWeight: 900,
  letterSpacing: '-2px',
  background: 'linear-gradient(90deg, #8A2BE2, #FF8C00)', // Purple to Orange Gradient
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '10px',
  textShadow: '0 10px 30px rgba(138, 43, 226, 0.3)'
};

const subtitleStyle = {
  fontSize: '1.2rem',
  color: '#888',
  letterSpacing: '1px'
};

/* DELIVERY SECTION STYLES */
const deliverySectionStyle = {
  marginBottom: '60px',
  textAlign: 'center',
  padding: '40px',
  background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(30, 30, 30, 0.9))',
  borderRadius: '24px',
  border: '1px solid rgba(138, 43, 226, 0.3)', // Purple border
  backdropFilter: 'blur(20px)',
  boxShadow: '0 0 50px rgba(138, 43, 226, 0.1)'
};

// ✅ ADDED THIS MISSING STYLE
const deliveryContentStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
};

const deliveryTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#fff',
  margin: 0
};

const deliveryTextStyle = {
  fontSize: '1.1rem',
  color: '#ccc',
  marginBottom: '30px',
  maxWidth: '600px',
  margin: '0 auto 30px auto'
};

const deliveryGridStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '30px',
  flexWrap: 'wrap'
};

const deliveryCardStyle = {
  background: 'rgba(255,255,255,0.03)',
  padding: '25px',
  borderRadius: '16px',
  minWidth: '240px',
  border: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'default'
};

const highlightText = {
  fontSize: '1.8rem',
  fontWeight: 800,
  color: '#fff',
  margin: '10px 0 5px 0'
};

const subText = {
  color: '#aaa',
  fontSize: '0.9rem',
  marginBottom: '15px'
};

const activeBadge = {
  background: 'rgba(34, 197, 94, 0.2)',
  color: '#22c55e',
  padding: '6px 16px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '800',
  border: '1px solid rgba(34, 197, 94, 0.4)'
};

const comingSoonBadge = {
  background: 'rgba(255, 140, 0, 0.2)',
  color: '#FF8C00',
  padding: '6px 16px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '800',
  border: '1px solid rgba(255, 140, 0, 0.4)'
};

/* GRID STYLES */
const contentGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px',
  marginBottom: '60px',
};

const cardStyle = {
  background: 'rgba(20, 20, 20, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '40px',
  cursor: 'pointer',
  height: '100%'
};

const cardTitleStyle = {
  fontSize: '1.8rem',
  color: '#fff',
  marginBottom: '20px',
  fontWeight: 700
};

const cardTextStyle = {
  color: '#bbb',
  lineHeight: '1.7',
  fontSize: '1rem',
};

const listStyle = {
  color: '#bbb',
  lineHeight: '1.8',
  paddingLeft: '20px',
};

/* TEAM STYLES */
const teamSectionStyle = {
  marginBottom: '60px',
};

const sectionTitleStyle = {
  fontSize: '2.5rem',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '40px',
  fontWeight: 800
};

const teamGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '30px',
};

const teamMemberStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '30px',
  textAlign: 'center',
  cursor: 'pointer'
};

const avatarStyle = {
  fontSize: '4rem',
  marginBottom: '15px',
};

const memberNameStyle = {
  fontSize: '1.4rem',
  color: '#fff',
  fontWeight: 700,
  marginBottom: '5px',
};

const memberRoleStyle = {
  color: '#8A2BE2', // Purple accent
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

/* STATS STYLES */
const statsSectionStyle = {
  marginBottom: '50px',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
};

const statItemStyle = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '30px',
  textAlign: 'center',
  cursor: 'pointer'
};

const statNumberStyle = {
  fontSize: '3rem',
  color: '#FF8C00', // Orange accent
  fontWeight: 900,
  marginBottom: '5px',
};

const statLabelStyle = {
  color: '#888',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px'
};