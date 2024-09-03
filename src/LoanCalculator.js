import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Table, Row, Col, ButtonGroup, InputGroup } from 'react-bootstrap';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [extraPayment, setExtraPayment] = useState('');
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 months per page
  const [yearlyData, setYearlyData] = useState([]);
  const [savings, setSavings] = useState(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = amortizationSchedule.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(amortizationSchedule.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [amortizationSchedule]);

  const calculate = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    const extra = parseFloat(extraPayment) || 0;

    const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    
    // Calculate without extra payments
    const regularSchedule = calculateSchedule(principal, rate, term, 0);
    const regularTotalInterest = regularSchedule.reduce((sum, payment) => sum + parseFloat(payment.interest), 0);
    const regularPayoffTime = regularSchedule.length / 12;

    // Calculate with extra payments
    const extraSchedule = calculateSchedule(principal, rate, term, extra);
    const extraTotalInterest = extraSchedule.reduce((sum, payment) => sum + parseFloat(payment.interest), 0);
    const extraPayoffTime = extraSchedule.length / 12;

    // Calculate savings
    const interestSaved = regularTotalInterest - extraTotalInterest;
    const timeSaved = regularPayoffTime - extraPayoffTime;

    setSavings({
      interestSaved: interestSaved.toFixed(2),
      timeSaved: timeSaved.toFixed(1)
    });

    let totalPayment = 0;
    let totalInterest = 0;
    let remainingBalance = principal;
    let months = 0;
    const schedule = [];

    while (remainingBalance > 0 && months < term) {
      const interestPayment = remainingBalance * rate;
      const principalPayment = Math.min(monthlyPayment - interestPayment + extra, remainingBalance);
      
      totalInterest += interestPayment;
      remainingBalance -= principalPayment;
      totalPayment += principalPayment + interestPayment;
      months++;

      schedule.push({
        month: months,
        payment: (principalPayment + interestPayment).toFixed(2),
        interest: interestPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        balance: remainingBalance.toFixed(2)
      });
    }

    const annualPayment = monthlyPayment * 12;
    const mortgageConstant = (annualPayment / principal) * 100;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      annualPayment: annualPayment.toFixed(2),
      mortgageConstant: mortgageConstant.toFixed(2) + '%',
      payoffTime: (months / 12).toFixed(1) + ' years'
    });

    setAmortizationSchedule(schedule);

    const yearly = [];
    for (let i = 0; i < schedule.length; i += 12) {
      const year = Math.floor(i / 12) + 1;
      const yearData = schedule.slice(i, i + 12);
      const yearSum = yearData.reduce((acc, month) => ({
        interest: acc.interest + parseFloat(month.interest),
        principal: acc.principal + parseFloat(month.principal),
      }), { interest: 0, principal: 0 });

      yearly.push({
        year,
        balance: parseFloat(yearData[yearData.length - 1].balance),
        interest: yearSum.interest.toFixed(2),
        principal: yearSum.principal.toFixed(2),
      });
    }

    setYearlyData(yearly);
  };

  const reset = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setExtraPayment('');
    setResults(null);
    setAmortizationSchedule([]);
    setCurrentPage(1);
  };

  const CustomPagination = () => (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <ButtonGroup>
        <Button variant="outline-secondary" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          First
        </Button>
        <Button variant="outline-secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
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
        <Button variant="outline-secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
        <Button variant="outline-secondary" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
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
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
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
        balance: balance.toFixed(2)
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
      const yearSum = yearData.reduce((acc, month) => ({
        interest: acc.interest + parseFloat(month.interest),
        principal: acc.principal + parseFloat(month.principal),
      }), { interest: 0, principal: 0 });

      const totalPayment = yearSum.interest + yearSum.principal;
      yearly.push({
        year,
        interest: (yearSum.interest / totalPayment * 100).toFixed(2),
        principal: (yearSum.principal / totalPayment * 100).toFixed(2),
      });
    }
    setYearlyData(yearly);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
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
          ${results ? `
            <p><strong>Monthly Payment:</strong> $${results.monthlyPayment}</p>
            <p><strong>Total Payment:</strong> $${results.totalPayment}</p>
            <p><strong>Total Interest:</strong> $${results.totalInterest}</p>
            <p><strong>Annual Payment:</strong> $${results.annualPayment}</p>
            <p><strong>Mortgage Constant:</strong> ${results.mortgageConstant}</p>
            <p><strong>Payoff Time:</strong> ${results.payoffTime}</p>
          ` : ''}
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
              ${amortizationSchedule.map(row => `
                <tr>
                  <td>${row.month}</td>
                  <td>$${row.payment}</td>
                  <td>$${row.interest}</td>
                  <td>$${row.principal}</td>
                  <td>$${row.balance}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={4}>
      <Card className="mb-4">
        <Card.Header as="h5">Loan Calculator</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Loan Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter loan amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Interest Rate (%)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter interest rate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Loan Term (years)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter loan term"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Extra Payment (monthly)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter extra payment"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={calculate} className="me-2">
              Calculate
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
            <Button variant="info" onClick={handlePrint} disabled={!results}>
              Print Summary
            </Button>
          </Form>
          {results && (
            <Card.Text className="mt-4">
              <strong>Monthly Payment:</strong> ${results.monthlyPayment}<br />
              <strong>Total Payment:</strong> ${results.totalPayment}<br />
              <strong>Total Interest:</strong> ${results.totalInterest}<br />
              <strong>Annual Payment:</strong> ${results.annualPayment}<br />
              <strong>Mortgage Constant:</strong> {results.mortgageConstant}<br />
              <strong>Payoff Time:</strong> {results.payoffTime}
              {savings && (
                  <>
                    <h6 className="mt-4">Savings from Extra Payments:</h6>
                    <p><strong>Total Interest Saved:</strong> ${savings.interestSaved}</p>
                    <p><strong>Total Time Saved:</strong> {savings.timeSaved} years</p>
                  </>
                )}
            </Card.Text>
          )}
        </Card.Body>
      </Card>
      </Col>
      
      {amortizationSchedule.length > 0 && (
      <Col md={8}>
        <Card>
          <Card.Header as="h5">Amortization Schedule</Card.Header>
          <Card.Body>
            <Row>
              <Col>
                <Table striped bordered hover>
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
                    {currentItems.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td>${row.payment}</td>
                        <td>${row.interest}</td>
                        <td>${row.principal}</td>
                        <td>${row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <CustomPagination />
              </Col>
              
            </Row>
          </Card.Body>
        </Card>
        </Col>
      )}
      </Row>
      <Row>
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
      </Row>
    </Container>
  );
};

export default LoanCalculator;