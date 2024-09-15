import Container from "react-bootstrap/Container";
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';

// const NavBar = () => {
// return (
//     <div><Navbar expand="lg" className="bg-body-tertiary">
//     <Container>
//       <Navbar.Brand href="#home">THE_REACHES</Navbar.Brand>
//       <Navbar.Toggle aria-controls="basic-navbar-nav" />
//       <Navbar.Collapse id="basic-navbar-nav">
//         <Nav className="me-auto">
//           <Nav.Link href="https://likweitan.eu.org">Home</Nav.Link>
//           <Nav.Link href="https://sg-myr-exchange-rates.vercel.app/">SGD-MYR Exchange Rates</Nav.Link>
//           <Nav.Link href="https://sg-myr-exchange-rates.vercel.app/">Housing Loan Calculator</Nav.Link>
//         </Nav>
//       </Navbar.Collapse>
//     </Container>
//   </Navbar></div>
// );
// }
// export default NavBar;

import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <Navbar
      style={{ backgroundSize: "0", backgroundColor: "#EEEEEE" }}
      data-bs-theme="light"
      expand="lg"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            alt=""
            src="/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {/* <Nav.Link as={Link} to="/">Home</Nav.Link> */}
            <Nav.Link as={Link} to="/exchange">
              Exchange Rates
            </Nav.Link>
            <Nav.Link as={Link} to="/loancalculator">
              Loan Calculator
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/carinsurance">Car Insurance</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
