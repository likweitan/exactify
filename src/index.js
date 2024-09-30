import reportWebVitals from "./reportWebVitals";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// 1. import `ChakraProvider` component
import { ChakraProvider } from "@chakra-ui/react";
import CurrencyExchangeApp from "./CurrencyExchangeApp";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Home from "./Home"; // Import the Home component
import LoanCalculator from "./LoanCalculator";
import CarInsuranceCalculator from "./CarInsuranceCalculator";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<CurrencyExchangeApp />} />
          <Route path="/exchange" element={<CurrencyExchangeApp />} />
          <Route path="/loancalculator" element={<LoanCalculator />} />
          <Route path="/carinsurance" element={<CarInsuranceCalculator />} />
        </Routes>
        <Footer />
        <Analytics />
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
