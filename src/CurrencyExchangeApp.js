import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card";

const calculateMedian = (data) => {
  const rates = data
    .map((item) => item.CIMBRate)
    .filter((rate) => rate !== "-");
  const sortedRates = rates.sort((a, b) => a - b);
  const middle = Math.floor(sortedRates.length / 2);

  if (sortedRates.length % 2 === 0) {
    return (sortedRates[middle - 1] + sortedRates[middle]) / 2;
  } else {
    return sortedRates[middle];
  }
};

const calculateAverage = (data) => {
  const rates = data
    .map((item) => item.CIMBRate)
    .filter((rate) => rate !== "-");

  const total = rates.reduce((sum, rate) => sum + rate, 0);
  return total / rates.length;
};

const getYAxisDomain = (data) => {
  const average = calculateAverage(data);
  const range = 0.05; // Range around the average (5% in this case)
  const rates = data
    .map((item) => item.CIMBRate)
    .filter((rate) => rate !== "-");
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);

  return [
    Math.max(average - (average - minRate) * range, minRate),
    Math.min(average + (maxRate - average) * range, maxRate),
  ];
};


const CurrencyExchangeApp = () => {
  const [data, setData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("hour");
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [latestRate, setLatestRate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6; // Set to 8 records per page
  const yAxisDomain = getYAxisDomain(chartData);
  const [sgdValue, setSgdValue] = useState("");
  const [myrValue, setMyrValue] = useState("");

  // State variables for SGD to MYR conversion
  const [sgdAmount, setSgdAmount] = useState("");
  const [selectedPlatformSgd, setSelectedPlatformSgd] = useState("CIMB");
  const [sgdToMyrResult, setSgdToMyrResult] = useState(null);

  // State variables for MYR to SGD conversion
  const [myrAmount, setMyrAmount] = useState("");
  const [selectedPlatformMyr, setSelectedPlatformMyr] = useState("CIMB");
  const [myrToSgdResult, setMyrToSgdResult] = useState(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/likweitan/CIMB-exchange-rates/main/exchange_rates.json"
    )
      .then((response) => response.json())
      .then((jsonData) => {
        const formattedData = jsonData
          .map((item) => ({
            timestamp: new Date(item.timestamp),
            rate: parseFloat(item.exchange_rate),
            platform: item.platform,
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending

        setData(formattedData.reverse());
        console.log(formattedData);
        // Determine the latest rates for CIMB, WISE, and PANDAREMIT
        const latestCIMB = formattedData
          .filter((item) => item.platform === "CIMB")
          .at(-1);
        const latestWISE = formattedData
          .filter((item) => item.platform === "WISE")
          .at(-1);
        const latestPANDAREMIT = formattedData
          .filter((item) => item.platform === "PANDAREMIT")
          .at(-1);

        setLatestRate({
          CIMB: latestCIMB,
          WISE: latestWISE,
          PANDAREMIT: latestPANDAREMIT,
        });
      });
  }, []);

  useEffect(() => {
    const processData = () => {
      let groupedData = {};
      data.forEach((item) => {
        const date = item.timestamp;
        let key;
        switch (timeFrame) {
          case "hour":
            key = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours()
            ).getTime();
            break;
          case "day":
            key = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            ).getTime();
            break;
          case "month":
            key = new Date(date.getFullYear(), date.getMonth()).getTime();
            break;
          case "year":
            key = new Date(date.getFullYear(), 0).getTime();
            break;
          default:
            key = date.getTime();
        }
        if (!groupedData[key]) {
          groupedData[key] = {};
        }
        groupedData[key][item.platform] = item.rate;
      });

      const processed = Object.keys(groupedData).map((key) => ({
        date: formatDate(new Date(Number(key))),
        CIMBRate: groupedData[key]["CIMB"] || "-",
        WISERate: groupedData[key]["WISE"] || "-",
        PANDAREMITRate: groupedData[key]["PANDAREMIT"] || "-",
      }));

      // Slice the processed data to include only the last 12 records
      const limitedProcessed = processed.slice(-24);

      setChartData(limitedProcessed); // Keep the chart data in ascending order
      setTableData([...limitedProcessed].reverse()); // Reverse the data for the table
    };

    processData();
  }, [data, timeFrame]);

  const formatDate = (date) => {
    switch (timeFrame) {
      case "hour":
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      case "day":
        return date.toLocaleDateString();
      case "month":
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        });
      case "year":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formatRate = (rate) => {
        return typeof rate === "number" ? rate.toFixed(4) : "-";
      };

      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>{formatDate(new Date(payload[0].payload.date))}</p>
          <p>CIMB: {formatRate(payload[0].payload.CIMBRate)}</p>
          <p>WISE: {formatRate(payload[0].payload.WISERate)}</p>
          <p>PANDAREMIT: {formatRate(payload[0].payload.PANDAREMITRate)}</p>
        </div>
      );
    }
    return null;
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = tableData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(tableData.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handler for SGD to MYR conversion
  const handleSgdToMyr = (e) => {
    e.preventDefault();
    if (!sgdAmount || isNaN(sgdAmount)) {
      alert("Please enter a valid SGD amount.");
      return;
    }
    const selectedRate = latestRate[selectedPlatformSgd]?.rate;
    if (!selectedRate) {
      alert("Selected platform rate is unavailable.");
      return;
    }
    const result = parseFloat(sgdAmount) * selectedRate;
    setSgdToMyrResult(result.toFixed(4));
  };

  // Handler for MYR to SGD conversion
  const handleMyrToSgd = (e) => {
    e.preventDefault();
    if (!myrAmount || isNaN(myrAmount)) {
      alert("Please enter a valid MYR amount.");
      return;
    }
    const selectedRate = latestRate[selectedPlatformMyr]?.rate;
    if (!selectedRate) {
      alert("Selected platform rate is unavailable.");
      return;
    }
    const result = parseFloat(myrAmount) / selectedRate;
    setMyrToSgdResult(result.toFixed(4));
  };

  const handleSgdChange = (e) => {
    const value = e.target.value;
    setSgdValue(value);

    if (latestRate?.CIMB && value) {
      setMyrValue((value * latestRate.CIMB.rate).toFixed(4));
    } else {
      setMyrValue("");
    }
  };

  const handleMyrChange = (e) => {
    const value = e.target.value;
    setMyrValue(value);

    if (latestRate?.CIMB && value) {
      setSgdValue((value / latestRate.CIMB.rate).toFixed(4));
    } else {
      setSgdValue("");
    }
  };
  return (
    <div>
      <div style={{ padding: "20px" }}>
      <Container style={{ marginTop: "20px", marginBottom: "20px" }}>
          
        </Container>
        <Container>
          {/* Latest Rates Cards */}
          <Row style={{ marginBottom: "10px" }}>
            {latestRate?.CIMB && (
              <Col xs={12} md={6} lg={4} style={{ marginBottom: "10px" }}>
                <Card style={{ width: "100%" }}>
                  <Card.Body>
                    <Card.Title>
                      1 SGD = {latestRate.CIMB.rate.toFixed(4)} MYR
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      CIMB
                    </Card.Subtitle>
                  </Card.Body>
                </Card>
              </Col>
            )}
            {latestRate?.WISE && (
              <Col xs={12} md={6} lg={4} style={{ marginBottom: "10px" }}>
                <Card style={{ width: "100%" }}>
                  <Card.Body>
                    <Card.Title>
                      1 SGD = {latestRate.WISE.rate.toFixed(4)} MYR
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      WISE
                    </Card.Subtitle>
                  </Card.Body>
                </Card>
              </Col>
            )}
            {/* {latestRate?.PANDAREMIT && (
              <Col xs={12} md={6} lg={4} style={{ marginBottom: "10px" }}>
                <Card style={{ width: "100%" }}>
                  <Card.Body>
                    <Card.Title>
                      1 SGD = {latestRate.PANDAREMIT.rate.toFixed(4)} MYR
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      PANDAREMIT
                    </Card.Subtitle>
                  </Card.Body>
                </Card>
              </Col>
            )} */}
            <Col xs={6} md={6} lg={2} style={{ marginTop: "5px"}}>
              <Form.Group controlId="sgdInput">
                <Form.Label>SGD</Form.Label>
                <Form.Control
                  type="number"
                  value={sgdValue}
                  onChange={handleSgdChange}
                  placeholder="Enter SGD amount"
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={6} lg={2} style={{ marginTop: "5px"}}>
              <Form.Group controlId="myrInput">
                <Form.Label>MYR</Form.Label>
                <Form.Control
                  type="number"
                  value={myrValue}
                  onChange={handleMyrChange}
                  placeholder="Enter MYR amount"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Last Updated Timestamp */}
          <Row>
            {latestRate?.CIMB?.timestamp && (
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Last updated:{" "}
                  {new Date(latestRate.CIMB.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </Row>
        </Container>

        {/* Chart and Table Section */}
        <Container>
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
            <h1 className="h3">Details</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group mr-1">
                <Form.Select
                  className="form-select btn-outline-secondary"
                  id="timeframe-select"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="hour">Hourly</option>
                  <option value="day">Daily</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </Form.Select>
              </div>
            </div>
          </div>
          <Row>
            <Col xs={12} md={6} lg={6} style={{ marginBottom: "20px"}}>
              <div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "semibold",
                    marginBottom: "10px",
                  }}
                >
                  Exchange Rate Chart
                </h3>
                <ResponsiveContainer width="100%" height={345}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 14 }}
                      interval={2} // Show all ticks
                      tickFormatter={(value, index) => {
                        if (
                          index === 0 ||
                          index === chartData.length - 1
                        ) {
                          return "";
                        }
                        return ""; // Return an empty string for ticks that are not first or last
                      }}
                      angle={0}
                      textAnchor="start"
                    />
                    <YAxis domain={yAxisDomain} />
                    <Tooltip/>
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="CIMBRate"
                      name="CIMB"
                      stroke="#982B1C"
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="WISERate"
                      stroke="#1A4870"
                      name="WISE"
                      activeDot={{ r: 5 }}
                    />
                    {/* <Line
                      type="monotone"
                      dataKey="PANDAREMITRate"
                      stroke="#FABC3F"
                      name="PANDAREMIT"
                      activeDot={{ r: 5 }}
                    /> */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col xs={12} md={6} lg={6} style={{ marginBottom: "20px"}}>
              <div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "semibold",
                    marginBottom: "10px",
                  }}
                >
                  Exchange Rate Data
                </h3>
                <div>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>CIMB</th>
                        <th>WISE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((row, index) => (
                        <tr key={index}>
                          <td>{row.date}</td>
                          <td>{row.CIMBRate}</td>
                          <td>{row.WISERate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div
                      className="pagination"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                      }}
                    >
                      <ButtonGroup
                        className="me-2"
                        aria-label="First group"
                      >
                        {[...Array(totalPages)].map((_, index) => (
                          <Button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            disabled={currentPage === index + 1}
                            variant="secondary"
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default CurrencyExchangeApp;
