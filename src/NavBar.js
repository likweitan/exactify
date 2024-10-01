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

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg="teal.500" px={4}>
      <Flex h={14} alignItems="center" justifyContent="space-between">
        {/* <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        /> */}
        <HStack spacing={8} alignItems="center">
          <Box fontWeight="bold" color="white">
            EXACTIFY
          </Box>
          {/* <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            <Button variant="link" color="white">
              Home
            </Button>
            <Button variant="link" color="white">
              About
            </Button>
            <Button variant="link" color="white">
              Contact
            </Button>
          </HStack> */}
        </HStack>
        <Flex alignItems="center">
          {/* <Button colorScheme="teal" size="sm">
            INFO
          </Button> */}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={4}>
            <Button variant="link" color="teal.50">
              Home
            </Button>
            <Button variant="link" color="teal.50">
              About
            </Button>
            <Button variant="link" color="teal.50">
              Contact
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default NavBar;
