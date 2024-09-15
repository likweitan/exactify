import React from "react";
import { Container, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const AppIcon = ({ to, icon, title, subtitle, bgColor }) => (
  <div className="app-icon mb-4" style={{ width: "75px" }}>
    <Link to={to} className="text-decoration-none">
      <div
        className="d-flex justify-content-center align-items-center rounded"
        style={{
          width: "75px",
          height: "75px",
          backgroundColor: bgColor,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <img src={icon} alt={title} width="52" height="52" />
      </div>
    </Link>
    <div className="text-center mt-2">
      <h6 className="mb-2">{title}</h6>
      {/* <small className="text-muted">{subtitle}</small> */}
    </div>
  </div>
);

const Home = () => {
  return (
    <Container>
      <div
        className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2"
        style={{ marginTop: "1rem" }}
      ></div>
      <Row className="justify-content-start">
        <Col xs={3} sm={4} md={2} lg={1}>
          <AppIcon
            to="/exchange"
            icon="https://images.vexels.com/media/users/3/146882/isolated/lists/7525685ed67fa782b7d851273e1264c7-currency-exchange.png"
            title="Exchange Rates"
            subtitle="SGD-MYR"
            bgColor="#F5F7F8"
          />
        </Col>
        <Col xs={3} sm={4} md={2} lg={1}>
          <AppIcon
            to="/loancalculator"
            icon="https://ps.w.org/loan-calculator-wp/assets/icon-256x256.png?rev=2611572"
            title="Loan Calculator"
            subtitle="Housing"
            bgColor="#F5F7F8"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
