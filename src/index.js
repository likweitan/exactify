import reportWebVitals from './reportWebVitals';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS
import CurrencyExchangeApp from './CurrencyExchangeApp';
import NavBar from './NavBar';
import Footer from './Footer';
import Home from './Home';  // Import the Home component
import LoanCalculator from './LoanCalculator';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exchange" element={<CurrencyExchangeApp />} />
        <Route path="/loancalculator" element={<LoanCalculator />} />
      </Routes>
      <Footer />
      <Analytics />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
