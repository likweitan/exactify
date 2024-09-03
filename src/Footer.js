import { Button, Container, Col, Row, Form } from "react-bootstrap";

const Footer = () => {
  return (
    <div style={{ textAlign: "center", fontSize: "12px" }}>
      <footer className="bg-light text-dark mt-auto py-2 fixed-bottom">
        <Container>
          <div class="inner">
            <p style={{ marginBottom: "0" }}>
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
