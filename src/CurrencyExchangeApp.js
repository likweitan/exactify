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
import Table from "react-bootstrap/Table";
import CIMBLogo from "./assets/cimb_logo.png";
import WiseLogo from "./assets/wise_logo.png";

// Linear Regression function with adjusted prediction ranges
const linearRegression = (data, timeFrame) => {
  if (!data || data.length === 0) {
    console.warn("No data available for linear regression");
    return [];
  }

  const validData = data.filter(
    (point) => point && typeof point.rate === "number" && point.timestamp
  );

  if (validData.length < 2) {
    console.warn("Insufficient valid data points for linear regression");
    return [];
  }

  const xSum = validData.reduce((sum, _, i) => sum + i, 0);
  const ySum = validData.reduce((sum, point) => sum + point.rate, 0);
  const xySum = validData.reduce((sum, point, i) => sum + i * point.rate, 0);
  const x2Sum = validData.reduce((sum, _, i) => sum + i * i, 0);
  const n = validData.length;

  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  const predictedData = [];
  const lastDate = new Date(validData[validData.length - 1].timestamp);

  let predictionCount;
  switch (timeFrame) {
    case "15min":
      predictionCount = 12; // 60 minutes / 5 minutes = 12 predictions
      break;
    case "hour":
      predictionCount = 24; // 24 hours
      break;
    case "day":
      predictionCount = 7; // 7 days
      break;
    default:
      predictionCount = 12; // Default to 60 minutes for unknown timeframes
  }

  for (let i = 1; i <= predictionCount; i++) {
    let predictedDate = new Date(lastDate);
    switch (timeFrame) {
      case "15min":
        predictedDate.setMinutes(lastDate.getMinutes() + i * 5);
        break;
      case "hour":
        predictedDate.setHours(lastDate.getHours() + i);
        break;
      case "day":
        predictedDate.setDate(lastDate.getDate() + i);
        break;
      default:
        predictedDate.setMinutes(lastDate.getMinutes() + i * 5);
    }

    predictedData.push({
      timestamp: predictedDate,
      rate: slope * (n + i - 1) + intercept,
    });
  }

  return predictedData;
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
  const [timeFrame, setTimeFrame] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [latestRate, setLatestRate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const yAxisDomain = getYAxisDomain(chartData);
  const [sgdValue, setSgdValue] = useState("");
  const [myrValue, setMyrValue] = useState("");
  const [predictedCIMB, setPredictedCIMB] = useState([]);
  const [predictedWISE, setPredictedWISE] = useState([]);

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
      const now = new Date();
      let filteredData = [];

      switch (timeFrame) {
        case "15min":
          // Filter last 4 hours of data
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return now - itemDate <= 4 * 60 * 60 * 1000;
          });
          break;
        case "hour":
          // Filter last 48 hours of data
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return now - itemDate <= 48 * 60 * 60 * 1000;
          });
          break;
        case "day":
          // Filter last 1 week of data
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return now - itemDate <= 7 * 24 * 60 * 60 * 1000;
          });
          break;
        default:
          filteredData = data;
      }

      let groupedData = {};
      filteredData.forEach((item) => {
        const date = new Date(item.timestamp);
        let key;
        switch (timeFrame) {
          case "15min":
            key = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              Math.floor(date.getMinutes() / 5) * 5
            ).getTime();
            break;
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
          default:
            key = date.getTime();
        }

        if (!groupedData[key]) {
          groupedData[key] = {};
        }

        if (!groupedData[key][item.platform]) {
          groupedData[key][item.platform] = { sum: 0, count: 0 };
        }

        groupedData[key][item.platform].sum += item.rate;
        groupedData[key][item.platform].count += 1;
      });

      const processed = Object.keys(groupedData).map((key) => ({
        date: formatDate(new Date(Number(key))),
        CIMBRate: groupedData[key]["CIMB"]
          ? (
              groupedData[key]["CIMB"].sum / groupedData[key]["CIMB"].count
            ).toFixed(4)
          : null,
        WISERate: groupedData[key]["WISE"]
          ? (
              groupedData[key]["WISE"].sum / groupedData[key]["WISE"].count
            ).toFixed(4)
          : null,
      }));

      // Add predictive analytics
      const cimbData = filteredData.filter((item) => item.platform === "CIMB");
      const wiseData = filteredData.filter((item) => item.platform === "WISE");

      const predictedCIMBData = linearRegression(cimbData, timeFrame);
      const predictedWISEData = linearRegression(wiseData, timeFrame);

      setPredictedCIMB(predictedCIMBData);
      setPredictedWISE(predictedWISEData);

      // Combine actual and predicted data for the chart
      let combinedData = [...processed];

      if (processed.length > 0) {
        const lastActualDataPoint = processed[processed.length - 1];
        combinedData.push({
          date: lastActualDataPoint.date,
          CIMBRate: lastActualDataPoint.CIMBRate,
          WISERate: lastActualDataPoint.WISERate,
          PredictedCIMBRate: lastActualDataPoint.CIMBRate,
          PredictedWISERate: lastActualDataPoint.WISERate,
        });
      }

      combinedData = [
        ...combinedData,
        ...predictedCIMBData.map((item, index) => ({
          date: formatDate(item.timestamp),
          PredictedCIMBRate: item.rate.toFixed(4),
          PredictedWISERate: predictedWISEData[index].rate.toFixed(4),
        })),
      ];

      setChartData(combinedData);
      setTableData([...processed].reverse());
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

  return (
    <Container className="mt-2">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-0 mt-2 mb-2 border-bottom">
        <h5>Exchange Rates</h5>
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
      <Row className="mb-0">
        <Col xs={12} md={6} lg={6}>
          <div className="my-0">
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
                <XAxis dataKey="date" interval={48} />
                <YAxis domain={getYAxisDomain(chartData)} />
                <Tooltip />
                <Line
                  dataKey="CIMBRate"
                  name="CIMB"
                  stroke="#FA7070"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  dataKey="WISERate"
                  name="WISE"
                  stroke="#C6EBC5"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  dataKey="PredictedCIMBRate"
                  name="CIMB"
                  stroke="#FA7070"
                  strokeDasharray="5 5"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  dataKey="PredictedWISERate"
                  name="WISE"
                  stroke="#C6EBC5"
                  strokeDasharray="5 5"
                  dot={false}
                  strokeWidth={2}
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
