import { Container } from "react-bootstrap";
import { Link } from "@chakra-ui/react";
const Footer = () => {
  return (
    <div style={{ textAlign: "center", fontSize: "12px" }}>
      <footer className="bg-white text-dark mt-5">
        <Container fluid>
          <div class="inner">
            <p className="mt-2 mb-1">
              Made by{" "}
              <Link
                href="https://github.com/likweitan"
                isExternal
                color="teal.500"
              >
                @likweitan
              </Link>
              .
            </p>
            <p>
              Exactify is not associated with{" "}
              <Link href="https://www.cimb.com.sg" color="teal.500">
                CIMB
              </Link>{" "}
              or{" "}
              <Link href="https://www.wise.com" color="teal.500">
                WISE
              </Link>
              .
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};
export default Footer;
