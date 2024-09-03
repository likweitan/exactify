import React from "react";
import { Button, Container, Col, Row, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom" style={{ marginTop: "1rem" }}>
        <h1 className="h3">Apps</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group mr-1">
          </div>
        </div>
      </div>
      {/* <Row>
        <Col>
          <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-dark rounded box-shadow">
            <div class="lh-100">
              <h6 class="mb-0 text-white lh-100">Welcome to Reach</h6>
              <small>Since 2024</small>
            </div>
          </div>
          </Col>
        </Row> */}
      <Row>
        <Col xs={12} md={3}>
          <Link to="/exchange" className="text-decoration-none">
            <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-primary rounded box-shadow">
              <img
                class="mr-3"
                src="https://images.vexels.com/media/users/3/146882/isolated/lists/7525685ed67fa782b7d851273e1264c7-currency-exchange.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-white lh-100">Exchange Rates</h6>
                <small>SGD-MYR</small>
              </div>
            </div>
          </Link>
        </Col>
        <Col xs={12} md={3}>
          <Link to="/loancalculator" className="text-decoration-none">
            <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-success rounded box-shadow">
              <img
                class="mr-3"
                src="https://ps.w.org/loan-calculator-wp/assets/icon-256x256.png?rev=2611572"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-white lh-100">Loan Calculator</h6>
                <small>Housing</small>
              </div>
            </div>
          </Link>
        </Col>
        {/* <Col xs={6} md={2}>
          <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-dark rounded box-shadow">
            <div class="lh-100">
              <h6 class="mb-0 text-white lh-100">Welcome to Reach</h6>
              <small>Since 2024</small>
            </div>
          </div>
          </Col>
          <Col xs={6} md={2}>
          <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-dark rounded box-shadow">
            <div class="lh-100">
              <h6 class="mb-0 text-white lh-100">Welcome to Reach</h6>
              <small>Since 2024</small>
            </div>
          </div>
          </Col>
          <Col xs={6} md={2}>
          <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-dark rounded box-shadow">
            <div class="lh-100">
              <h6 class="mb-0 text-white lh-100">Welcome to Reach</h6>
              <small>Since 2024</small>
            </div>
          </div>
          </Col>
          <Col xs={6} md={2}>
          <div class="d-flex align-items-center p-3 my-3 text-white-50 bg-dark rounded box-shadow">
            <div class="lh-100">
              <h6 class="mb-0 text-white lh-100">Welcome to Reach</h6>
              <small>Since 2024</small>
            </div>
          </div>
          </Col> */}
      </Row>
    </Container>
  );
};

export default Home;
