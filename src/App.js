// App.js remains the same
import React from "react";
import CurrencyExchangeApp from "./CurrencyExchangeApp";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <div className="App">
      <CurrencyExchangeApp />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
