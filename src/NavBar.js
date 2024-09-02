import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const NavBar = () => {
return (
    <div><Navbar expand="lg" className="bg-body-tertiary">
    <Container>
      <Navbar.Brand href="#home">REACHES</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {/* <Nav.Link href="https://likweitan.eu.org">Home</Nav.Link> */}
          <Nav.Link href="https://sg-myr-exchange-rates.vercel.app/">SGD-MYR Exchange Rates</Nav.Link>
          {/* <Nav.Link href="https://sg-myr-exchange-rates.vercel.app/">Housing Loan Calculator</Nav.Link> */}
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar></div>
);
}
export default NavBar;
