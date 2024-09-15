import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Table,
  Row,
  Col,
  ButtonGroup,
  InputGroup,
} from "react-bootstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoanPieChart from "./LoanPieChart";
import LoanLineChart from "./LoanLineChart"; // Add this import

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 months per page
  const [yearlyData, setYearlyData] = useState([]);
  const [savings, setSavings] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[1]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = amortizationSchedule.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(amortizationSchedule.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [amortizationSchedule]);

  useEffect(() => {
    if (loanAmount && interestRate && loanTerm) {
      calculate();
    }
  }, [loanAmount, interestRate, loanTerm, extraPayment, selectedCurrency]);

  const handleCurrencyChange = (event) => {
    const selected = currencies.find(
      (currency) => currency.code === event.target.value
    );
    if (selected) {
      setSelectedCurrency(selected);
    }
  };

  const formatCurrency = (value) => {
    // value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${selectedCurrency.symbol}${parseFloat(value)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const calculate = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    const extra = parseFloat(extraPayment) || 0;

    if (isNaN(principal) || isNaN(rate) || isNaN(term)) {
      return; // Exit if any required field is not a valid number
    }

    const monthlyPayment =
      (principal * rate * Math.pow(1 + rate, term)) /
      (Math.pow(1 + rate, term) - 1);

    // Calculate without extra payments
    const regularSchedule = calculateSchedule(principal, rate, term, 0);
    const regularTotalInterest = regularSchedule.reduce(
      (sum, payment) => sum + parseFloat(payment.interest),
      0
    );
    const regularPayoffTime = regularSchedule.length / 12;

    // Calculate with extra payments
    const extraSchedule = calculateSchedule(principal, rate, term, extra);
    const extraTotalInterest = extraSchedule.reduce(
      (sum, payment) => sum + parseFloat(payment.interest),
      0
    );
    const extraPayoffTime = extraSchedule.length / 12;

    // Calculate savings
    const interestSaved = regularTotalInterest - extraTotalInterest;
    const timeSaved = regularPayoffTime - extraPayoffTime;

    setSavings({
      interestSaved: interestSaved.toFixed(2),
      timeSaved: timeSaved.toFixed(1),
    });

    let totalPayment = 0;
    let totalInterest = 0;
    let remainingBalance = principal;
    let months = 0;
    const schedule = [];

    while (remainingBalance > 0 && months < term) {
      const interestPayment = remainingBalance * rate;
      const principalPayment = Math.min(
        monthlyPayment - interestPayment + extra,
        remainingBalance
      );

      totalInterest += interestPayment;
      remainingBalance -= principalPayment;
      totalPayment += principalPayment + interestPayment;
      months++;

      schedule.push({
        month: months,
        payment: (principalPayment + interestPayment).toFixed(2),
        interest: interestPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        balance: remainingBalance.toFixed(2),
      });
    }

    const annualPayment = monthlyPayment * 12;
    const mortgageConstant = (annualPayment / principal) * 100;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      annualPayment: annualPayment.toFixed(2),
      mortgageConstant: mortgageConstant.toFixed(2) + "%",
      payoffTime: (months / 12).toFixed(1) + " years",
    });

    // Update the schedule to use formatted currency
    const formattedSchedule = schedule.map((item) => ({
      ...item,
      payment: item.payment,
      interest: item.interest,
      principal: item.principal,
      balance: item.balance,
    }));

    setAmortizationSchedule(formattedSchedule);

    // Update the reset function to include currency reset
    const reset = () => {
      // ... (existing reset logic)
      setSelectedCurrency(currencies[0]);
    };

    // Prepare yearly data for the line chart
    const yearly = [];
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    for (let i = 0; i < schedule.length; i++) {
      yearlyPrincipal += parseFloat(schedule[i].principal);
      yearlyInterest += parseFloat(schedule[i].interest);
      if ((i + 1) % 12 === 0 || i === schedule.length - 1) {
        const year = Math.floor(i / 12) + 1;
        yearly.push({
          year,
          principal: yearlyPrincipal,
          interest: yearlyInterest,
          balance: parseFloat(schedule[i].balance),
        });
      }
    }
    setYearlyData(yearly);
  };

  const reset = () => {
    setLoanAmount("");
    setInterestRate("");
    setLoanTerm("");
    setExtraPayment("");
    setResults(null);
    setAmortizationSchedule([]);
    setCurrentPage(1);
  };

  const CustomPagination = () => (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <ButtonGroup>
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        {/* <InputGroup className="w-auto">
          <Form.Control
            variant="outline-secondary"
            type="number"
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            style={{width: '60px', textAlign: 'center'}}
          />
          <InputGroup.Text>of {totalPages}</InputGroup.Text>
        </InputGroup> */}
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      </ButtonGroup>
    </div>
  );

  const calculateSchedule = (principal, rate, term, extraPayment) => {
    let balance = principal;
    const schedule = [];

    while (balance > 0 && schedule.length < term) {
      const interest = balance * rate;
      const monthlyPayment =
        (principal * rate * Math.pow(1 + rate, term)) /
        (Math.pow(1 + rate, term) - 1);
      let principalPayment = monthlyPayment - interest + extraPayment;

      if (principalPayment > balance) {
        principalPayment = balance;
      }

      balance -= principalPayment;

      schedule.push({
        month: schedule.length + 1,
        payment: (principalPayment + interest).toFixed(2),
        interest: interest.toFixed(2),
        principal: principalPayment.toFixed(2),
        balance: balance.toFixed(2),
      });

      if (balance <= 0) break;
    }

    return schedule;
  };

  const calculateYearlyData = (schedule) => {
    const yearly = [];
    for (let i = 0; i < schedule.length; i += 12) {
      const year = Math.floor(i / 12) + 1;
      const yearData = schedule.slice(i, i + 12);
      const yearSum = yearData.reduce(
        (acc, month) => ({
          interest: acc.interest + parseFloat(month.interest),
          principal: acc.principal + parseFloat(month.principal),
        }),
        { interest: 0, principal: 0 }
      );

      const totalPayment = yearSum.interest + yearSum.principal;
      yearly.push({
        year,
        interest: ((yearSum.interest / totalPayment) * 100).toFixed(2),
        principal: ((yearSum.principal / totalPayment) * 100).toFixed(2),
      });
    }
    setYearlyData(yearly);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Loan Summary</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { color: #333; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h2>Loan Summary</h2>
          <p><strong>Loan Amount:</strong> $${loanAmount}</p>
          <p><strong>Interest Rate:</strong> ${interestRate}%</p>
          <p><strong>Loan Term:</strong> ${loanTerm} years</p>
          <p><strong>Extra Payment:</strong> $${extraPayment}/month</p>
          ${
            results
              ? `
            <p><strong>Monthly Payment:</strong> $${results.monthlyPayment}</p>
            <p><strong>Total Payment:</strong> $${results.totalPayment}</p>
            <p><strong>Total Interest:</strong> $${results.totalInterest}</p>
            <p><strong>Annual Payment:</strong> $${results.annualPayment}</p>
            <p><strong>Mortgage Constant:</strong> ${results.mortgageConstant}</p>
            <p><strong>Payoff Time:</strong> ${results.payoffTime}</p>
          `
              : ""
          }
          <h2>Amortization Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Monthly Payment</th>
                <th>Interest</th>
                <th>Principal</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${amortizationSchedule
                .map(
                  (row) => `
                <tr>
                  <td>${row.month}</td>
                  <td>$${row.payment}</td>
                  <td>$${row.interest}</td>
                  <td>$${row.principal}</td>
                  <td>$${row.balance}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Container className="mt-3">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mt-3 mb-3 border-bottom">
        <h1 className="h3">Loan Calculator</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group mr-1 me-2">
            <Form.Select
              value={selectedCurrency.code}
              onChange={handleCurrencyChange}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                  {/*  - {currency.name} */}
                </option>
              ))}
            </Form.Select>
          </div>
          <Button variant="secondary" onClick={reset} className="me-2">
            Reset
          </Button>
        </div>
      </div>
      <Row>
        <Col md={3}>
          <Form>
            <Form.Label>Loan Amount</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon2">
                {selectedCurrency.symbol}
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder=""
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </InputGroup>

            <Row>
              <Col>
                <Form.Label>Interest Rate</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="number"
                    placeholder=""
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                  <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                </InputGroup>
              </Col>
              <Col>
                <Form.Label>Loan Term</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="number"
                    placeholder=""
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                  <InputGroup.Text id="basic-addon2">Years</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Form.Label>Extra Payment (monthly)</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon2">
                {selectedCurrency.symbol}
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder=""
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
              />
            </InputGroup>

            {/* <Button variant="info" onClick={handlePrint} disabled={!results}>
              Print Summary
            </Button> */}
          </Form>
          {/* {results && (
            <div>
              <strong>Monthly Payment:</strong>{" "}
              {formatCurrency(results.monthlyPayment)}
              <br />
              <strong>Total Payment:</strong>{" "}
              {formatCurrency(results.totalPayment)}
              <br />
              <strong>Total Interest:</strong>{" "}
              {formatCurrency(results.totalInterest)}
              <br />
              <strong>Annual Payment:</strong>{" "}
              {formatCurrency(results.annualPayment)}
              <br />
              <strong>Mortgage Constant:</strong> {results.mortgageConstant}
              <br />
              <strong>Payoff Time:</strong> {results.payoffTime}
              {savings && (
                <>
                  <h6 className="mt-4">Savings from Extra Payments:</h6>
                  <p>
                    <strong>Total Interest Saved:</strong>{" "}
                    {formatCurrency(savings.interestSaved)}
                  </p>
                  <p>
                    <strong>Total Time Saved:</strong> {savings.timeSaved} years
                  </p>
                </>
              )}
            </div>
          )} */}
        </Col>

        {results && (
          <Col xs={12} md={6} lg={3}>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {formatCurrency(results.monthlyPayment)}
                </h6>
                <small>Monthly Payment</small>
              </div>
            </div>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {formatCurrency(results.totalInterest)}
                </h6>
                <small>Total Interest</small>
              </div>
            </div>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">{results.payoffTime}</h6>
                <small>Payoff Time</small>
              </div>
            </div>
          </Col>
        )}
        {results && (
          <Col xs={12} md={6} lg={3}>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {formatCurrency(results.totalPayment)}
                </h6>
                <small>Total Payment</small>
              </div>
            </div>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {formatCurrency(results.annualPayment)}
                </h6>
                <small>Annual Payment</small>
              </div>
            </div>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {results.mortgageConstant}
                </h6>
                <small>Mortgage Constant</small>
              </div>
            </div>
          </Col>
        )}
        {savings && extraPayment && (
          <Col xs={12} md={6} lg={3}>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {formatCurrency(savings.interestSaved)}
                </h6>
                <small>Total Interest Saved</small>
              </div>
            </div>
            <div class="d-flex align-items-center p-3 my-2 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src="/logo.png"
                alt=""
                width="48"
                height="48"
                style={{ marginRight: "1rem" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  {savings.timeSaved} years
                </h6>
                <small>Total Time Saved</small>
              </div>
            </div>
          </Col>
        )}
      </Row>
      {results && (
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mt-3 mb-3 border-bottom">
          <h1 className="h3">Payment Schedule</h1>
        </div>
      )}
      <Row>
        {/* Add the pie chart here */}
        {results && (
          <Col md={6}>
            <LoanPieChart
              principal={parseFloat(loanAmount)}
              interest={parseFloat(results.totalInterest)}
              selectedCurrency={selectedCurrency}
            />
            {yearlyData.length > 0 && (
              <Col md={12}>
                <LoanLineChart
                  data={yearlyData}
                  selectedCurrency={selectedCurrency}
                />
              </Col>
            )}
          </Col>
        )}
        {amortizationSchedule.length > 0 && (
          <Col md={6}>
            <Row>
              <Col>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Month</th>
                      {/* <th>Monthly Payment</th> */}
                      <th>Interest</th>
                      <th>Principal</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        {/* <td>${row.payment}</td> */}
                        <td>{formatCurrency(row.interest)}</td>
                        <td>{formatCurrency(row.principal)}</td>
                        <td>{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <CustomPagination />
              </Col>
            </Row>
          </Col>
        )}
      </Row>
      {/* <Row>
        <Col md={12}>
          <Card className="mt-4">
            <Card.Header as="h5">Yearly Payment Breakdown</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={yearlyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `RM${value}`} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="interest" stackId="1" stroke="#8884d8" fill="#8884d8" name="Interest" />
                  <Area type="monotone" dataKey="principal" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Principal" />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
    </Container>
  );
};

export default LoanCalculator;
