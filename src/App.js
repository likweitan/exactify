// App.js remains the same
import React from "react";
import { Helmet } from 'react-helmet';
import CurrencyExchangeApp from "./CurrencyExchangeApp";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const App = () => {
  return (
    <>
      <Helmet>
        <title>Exactify - SGD to MYR Exchange Rate Tracker</title>
        <meta name="description" content="Track and compare SGD to MYR exchange rates from CIMB and Wise in real-time. Get predictions and find the best time to exchange." />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Exactify" />
        <meta property="og:title" content="Exactify - Live SGD to MYR Exchange Rates" />
        <meta property="og:description" content="Track and compare SGD to MYR exchange rates from CIMB and Wise in real-time. Get predictions and find the best time to exchange." />
        <meta property="og:image" content="https://exactify.vercel.app/og-image.png" />
        <meta property="og:url" content="https://exactify.vercel.app" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@exactify" />
        <meta name="twitter:title" content="Exactify - Live SGD to MYR Exchange Rates" />
        <meta name="twitter:description" content="Track and compare SGD to MYR exchange rates from CIMB and Wise in real-time. Get predictions and find the best time to exchange." />
        <meta name="twitter:image" content="https://exactify.vercel.app/og-image.png" />

        {/* Theme Color */}
        <meta name="theme-color" content="#319795" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Helmet>
      <div className="App">
        <CurrencyExchangeApp />
        <Analytics />
        <SpeedInsights />
      </div>
    </>
  );
};

export default App;
