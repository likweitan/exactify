import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavBar = () => {
return (
    <div><Navbar expand="lg" className="bg-body-tertiary">
    <Container>
      <Navbar.Brand href="#home">Madrigal</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="https://likweitan.eu.org">Home</Nav.Link>
          <Nav.Link href="https://sg-myr-exchange-rates.vercel.app/">MYR Exchange Rate</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar></div>
);
}
export default NavBar;
