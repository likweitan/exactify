import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <div style={{ textAlign: "center", fontSize: "12px" }}>
      <footer className="bg-white text-dark mt-5">
        <Container fluid>
          <div class="inner">
            <p className="mt-2 mb-1">
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
