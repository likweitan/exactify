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
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ButtonGroup,
  Table,
  Card,
} from "react-bootstrap";
import CIMBLogo from "./assets/cimb_logo.png";
import WiseLogo from "./assets/wise_logo.png";

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
  const recordsPerPage = 5;
  const yAxisDomain = getYAxisDomain(chartData);
  const [sgdValue, setSgdValue] = useState("");
  const [myrValue, setMyrValue] = useState("");

  // New state variables for currency conversion
  const [sgdAmount, setSgdAmount] = useState("");
  const [myrAmount, setMyrAmount] = useState("");
  const [conversionPlatform, setConversionPlatform] = useState("CIMB");

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
        const date = new Date(item.timestamp); // Ensure we are using a proper Date object
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
            // Set the time to midnight (00:00:00) for accurate day comparison
            key = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              0,
              0,
              0 // Explicitly set hours, minutes, seconds to 0
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

        // Initialize the structure for this key if it doesn't exist
        if (!groupedData[key]) {
          groupedData[key] = {};
        }

        // If groupedData[key][item.platform] is not an object, initialize it as an object
        if (
          !groupedData[key][item.platform] ||
          typeof groupedData[key][item.platform] !== "object"
        ) {
          groupedData[key][item.platform] = { sum: 0, count: 0 };
        }

        // Aggregate the rate (sum and count)
        groupedData[key][item.platform].sum += item.rate;
        groupedData[key][item.platform].count += 1;
      });

      const processed = Object.keys(groupedData).map((key) => ({
        date: formatDate(new Date(Number(key))),
        CIMBRate: groupedData[key]["CIMB"]
          ? (
              groupedData[key]["CIMB"].sum / groupedData[key]["CIMB"].count
            ).toFixed(4)
          : "-",
        WISERate: groupedData[key]["WISE"]
          ? (
              groupedData[key]["WISE"].sum / groupedData[key]["WISE"].count
            ).toFixed(3)
          : "-",
      }));

      // Slice the processed data to include only the last 48 records
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
      case "15min":
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
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

  function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now - past) / 1000); // difference in seconds

    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      // less than an hour
      const minutes = Math.floor(diff / 60);
      return `${minutes} minutes ago`;
    } else if (diff < 86400) {
      // less than a day
      const hours = Math.floor(diff / 3600);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} days ago`;
    }
  }

  const handleSgdChange = (value) => {
    setSgdAmount(value);
    if (latestRate && value) {
      const rate = latestRate[conversionPlatform].rate;
      setMyrAmount((parseFloat(value) * rate).toFixed(2));
    } else {
      setMyrAmount("");
    }
  };

  const handleMyrChange = (value) => {
    setMyrAmount(value);
    if (latestRate && value) {
      const rate = latestRate[conversionPlatform].rate;
      setSgdAmount((parseFloat(value) / rate).toFixed(2));
    } else {
      setSgdAmount("");
    }
  };

  return (
    <Container className="mt-2">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-0 mt-2 mb-2 border-bottom">
        <h1>Exchange Rates</h1>
        <div className="btn-toolbar mb-md-0">
          <div className="btn-group mr-1">
            {latestRate?.CIMB?.timestamp && (
              <div>
                <p
                  className="mb-1"
                  style={{
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  Updated {timeAgo(latestRate.CIMB.timestamp)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Latest Rates Cards */}
      <Row class="mb-0">
        {latestRate?.CIMB && (
          <Col xs={12} md={6} lg={4}>
            <div class="d-flex align-items-center p-2 my-1 text-black-50 rounded border">
              <img
                class="mr-3"
                src={CIMBLogo}
                alt=""
                width="48"
                height="48"
                style={{ marginLeft: "10px", marginRight: "20px" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  1 SGD = {latestRate.CIMB.rate.toFixed(4)} MYR
                </h6>
                <small>CIMB</small>
              </div>
            </div>
          </Col>
        )}
        {latestRate?.WISE && (
          <Col xs={12} md={6} lg={4}>
            <div class="d-flex align-items-center p-2 my-1 text-black-50 rounded box-shadow border">
              <img
                class="mr-3"
                src={WiseLogo}
                alt=""
                width="48"
                height="48"
                style={{ marginLeft: "10px", marginRight: "20px" }}
              />
              <div class="lh-100">
                <h6 class="mb-0 text-black lh-100">
                  1 SGD = {latestRate.WISE.rate.toFixed(4)} MYR
                </h6>
                <small>WISE</small>
              </div>
            </div>
          </Col>
        )}
        {/* <Col xs={6} md={4} lg={2}>
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
        <Col xs={6} md={4} lg={2}>
          <Form.Group controlId="myrInput">
            <Form.Label>MYR</Form.Label>
            <Form.Control
              type="number"
              value={myrValue}
              onChange={handleMyrChange}
              placeholder="Enter MYR amount"
            />
          </Form.Group>
        </Col> */}
      </Row>
      {/* Currency Conversion Calculator */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-0 mt-4 mb-2 border-bottom">
        <h5>Currency Conversion Calculator</h5>
      </div>
      <Row>
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>SGD Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={sgdAmount}
                    onChange={(e) => handleSgdChange(e.target.value)}
                    placeholder="Enter SGD amount"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>MYR Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={myrAmount}
                    onChange={(e) => handleMyrChange(e.target.value)}
                    placeholder="Enter MYR amount"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    value={conversionPlatform}
                    onChange={(e) => {
                      setConversionPlatform(e.target.value);
                      // Recalculate based on the new platform
                      if (sgdAmount) handleSgdChange(sgdAmount);
                      else if (myrAmount) handleMyrChange(myrAmount);
                    }}
                  >
                    <option value="CIMB">CIMB</option>
                    <option value="WISE">WISE</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <h6>Current Exchange Rate</h6>
              {latestRate && latestRate[conversionPlatform] ? (
                <p className="h4">
                  1 SGD = {latestRate[conversionPlatform].rate.toFixed(4)} MYR
                </p>
              ) : (
                <p>Loading latest exchange rate...</p>
              )}
              <p className="text-muted">Platform: {conversionPlatform}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Chart and Table Section */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-0 mt-2 mb-2 border-bottom">
        <h5>Historical Rates</h5>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group mr-1">
            <Form.Select
              className="form-select form-select-sm mb-1"
              id="timeframe-select"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="15min">Every 5 Minutes</option>
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              {/* <option value="month">Last Month</option> */}
              {/* <option value="year">Last Year</option> */}
            </Form.Select>
          </div>
        </div>
      </div>
      <Row class="mb-0">
        <Col xs={12} md={6} lg={6}>
          <div class="my-0">
            <ResponsiveContainer width="100%" height={295}>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 0,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={48} // Show all ticks
                  tickFormatter={(value, index) => {
                    if (index === 0 || index === chartData.length - 1) {
                      return "";
                    }
                    return ""; // Return an empty string for ticks that are not first or last
                  }}
                  angle={0}
                  textAnchor="start"
                />
                <YAxis domain={yAxisDomain} />
                <Tooltip />
                <Line
                  type="natural"
                  dataKey="CIMBRate"
                  name="CIMB"
                  stroke="#FA7070"
                  dot={false}
                  strokeWidth={2}
                  animationEasing="linear"
                />
                <Line
                  type="natural"
                  dataKey="WISERate"
                  stroke="#C6EBC5"
                  name="WISE"
                  dot={false}
                  strokeWidth={2}
                  animationEasing="linear"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col
          xs={12}
          md={6}
          lg={6}
          className="mb-1"
          style={{ marginTop: "0px", marginBottom: "10px" }}
        >
          <div>
            <div>
              <Table responsive hover>
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
              </Table>
              {totalPages > 1 && (
                <div
                  className="pagination"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ButtonGroup className="me-0" aria-label="First group">
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
  );
};

export default CurrencyExchangeApp;
