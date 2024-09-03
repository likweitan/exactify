import { Button, Container, Col, Row, Form } from "react-bootstrap";

const Footer = () => {
  return (
    <div style={{ textAlign: "center", fontSize: "12px" }}>
      <footer className="bg-light text-dark mt-auto">
        <Container>
          <div class="inner">
            <p>
              Made by <a href="https://github.com/likweitan">@likweitan</a>.
            </p>
            <p>
              This app is not affiliated with{" "}
              <a href="https://www.cimb.com.sg">CIMB</a> or{" "}
              <a href="https://www.wise.com">WISE</a>. All trademarks are the
              property of their respective owners.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};
export default Footer;
