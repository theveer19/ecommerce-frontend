import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, image, url }) {
  const siteTitle = "OneT | Premium Streetwear";
  const defaultDescription = "Shop the latest premium streetwear, oversized t-shirts, and fashion accessories at OneT. High-quality fabric and unique designs.";
  
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title ? `${title} | OneT` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || "streetwear, fashion, oversized t-shirts, premium clothing, OneT"} />
      
      {/* Open Graph / Facebook (Crucial for sharing) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || "/banner-image.jpg"} />
      <meta property="og:url" content={url || window.location.href} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || "/banner-image.jpg"} />
      
      {/* Canonical URL (Stops Google from getting confused by duplicate links) */}
      <link rel="canonical" href={url || window.location.href} />
    </Helmet>
  );
}