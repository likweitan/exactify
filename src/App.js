// App.js remains the same
import React from "react";
import CurrencyExchangeApp from "./CurrencyExchangeApp";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <div className="App">
      <CurrencyExchangeApp />
      <Analytics />
    </div>
  );
}

export default App;
