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
import * as XLSX from "xlsx";
import Form from "react-bootstrap/Form";
import FormSelect from "react-bootstrap/FormSelect";
import Button from "react-bootstrap/Button";

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
  const [timeFrame, setTimeFrame] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [latestRate, setLatestRate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6; // Set to 5 records per page
  const yAxisDomain = getYAxisDomain(chartData);

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
        setLatestRate(formattedData.at(-1)); // Set the latest rate
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
      }));

      // Slice the processed data to include only the last 24 records
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
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>{formatDate(new Date(payload[0].payload.date))}</p>
          <p>
            CIMB Rate:{" "}
            {payload[0].payload.CIMBRate !== "-"
              ? payload[0].payload.CIMBRate.toFixed(4)
              : "-"}
          </p>
          <p>
            WISE Rate:{" "}
            {payload[0].payload.WISERate !== "-"
              ? payload[0].payload.WISERate.toFixed(4)
              : "-"}
          </p>
        </div>
      );
    }
    return null;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exchange Rates");
    XLSX.writeFile(workbook, "exchange_rates.xlsx");
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = tableData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(tableData.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            SGD - MYR Exchange Rate
          </h1>

          <Container>
            <Row>
              <Col xs={12} md={6} lg={6}>
                {latestRate && (
                  <div
                    style={{
                      backgroundColor: "#EECAD5",
                      padding: "20px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
                      CIMB Latest Exchange Rate
                    </h2>
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      1 SGD = {latestRate.rate.toFixed(4)} MYR
                    </p>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      Last updated:{" "}
                      {new Date(latestRate.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </Col>
              <Col xs={12} md={6} lg={6}>
                {latestRate && (
                  <div
                    style={{
                      backgroundColor: "#F6EACB",
                      padding: "20px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
                      WISE Latest Exchange Rate
                    </h2>
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      1 SGD = {latestRate.rate.toFixed(4)} MYR
                    </p>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      Last updated:{" "}
                      {new Date(latestRate.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </Col>
            </Row>
            {/* <Row>
            <p style={{ fontSize: "14px", color: "#666", textAlign: 'center' }}>
                      Last updated:{" "}
                      {new Date(latestRate.timestamp).toLocaleString()}
                    </p>
            </Row> */}
          </Container>
        </div>

        <div style={{ marginBottom: "20px" }}></div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
          <h1 class="h2">Dashboard</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group mr-2">
              <Button
                class="btn btn-sm btn-outline-secondary"
                style={{ marginRight: 10 }}
                onClick={exportToExcel}
              >
                Export
              </Button>
            </div>
            <div class="btn-group mr-1">
              <Form.Select
                class="form-select btn-outline-secondary"
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
        <Container>
          <Row>
            <Col xs={12} md={6} lg={6}>
              <div style={{ marginBottom: "40px" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "semibold",
                    marginBottom: "10px",
                  }}
                >
                  Exchange Rate Chart
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval={0} // Show all ticks
                      tickFormatter={(value, index) => {
                        if (index === 0 || index === chartData.length - 1) {
                          return value;
                        }
                        return ""; // Return an empty string for ticks that are not first or last
                      }}
                      angle={0}
                      textAnchor="start"
                      height={80}
                    />
                    <YAxis domain={yAxisDomain} />
                    <Tooltip content={customTooltip} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="CIMBRate"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="WISERate" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col xs={12} md={6} lg={6}>
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "semibold",
                    marginBottom: "10px",
                  }}
                >
                  Exchange Rate Data
                </h2>
                <div
                  style={{
                    height: "400px",
                    overflowY: "auto",
                    marginBottom: "20px",
                  }}
                >
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
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          disabled={currentPage === index + 1}
                          style={{
                            padding: "5px 10px",
                            margin: "0 5px",
                            backgroundColor:
                              currentPage === index + 1 ? "#007bff" : "#ccc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          {index + 1}
                        </button>
                      ))}
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
