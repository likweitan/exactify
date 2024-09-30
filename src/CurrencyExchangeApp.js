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
  Box,
  Flex,
  Heading,
  Text,
  Select,
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  ButtonGroup,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Divider,
  AbsoluteCenter,
  Grid,
  GridItem,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import CIMBLogo from "./assets/cimb_logo.png";
import WiseLogo from "./assets/wise_logo.png";

const calculatePercentageChange = (currentRate, previousRate) => {
  if (previousRate === 0) return 0;
  return ((currentRate - previousRate) / previousRate) * 100;
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
  const recordsPerPage = 5;
  const yAxisDomain = getYAxisDomain(chartData);
  const [sgdValue, setSgdValue] = useState("");
  const [myrValue, setMyrValue] = useState("");

  // New state variables for currency conversion
  const [sgdAmount, setSgdAmount] = useState("");
  const [myrAmount, setMyrAmount] = useState("");
  const [conversionPlatform, setConversionPlatform] = useState("CIMB");
  const [previousRates, setPreviousRates] = useState(null);

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
        // Get the rates from 24 hours ago
        const previousCIMB = formattedData
          .filter(
            (item) =>
              item.platform === "CIMB" &&
              item.timestamp.getTime() <= Date.now() - 24 * 60 * 60 * 1000
          )
          .at(-1);

        const previousWISE = formattedData
          .filter(
            (item) =>
              item.platform === "WISE" &&
              item.timestamp.getTime() <= Date.now() - 24 * 60 * 60 * 1000
          )
          .at(-1);

        setPreviousRates({
          CIMB: previousCIMB,
          WISE: previousWISE,
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
    <Container maxW="container.xl" mt={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg">
          EXACTIFY
        </Heading>
      </Flex>
      <Box position="relative" paddingY="5">
        <Divider />
      </Box>

      {/* Latest Rates Cards */}
      <StatGroup>
        <Wrap spacing="70px">
          {latestRate?.CIMB && previousRates?.CIMB && (
            <WrapItem>
              <Stat>
                <StatLabel>CIMB</StatLabel>
                <StatNumber>{latestRate.CIMB.rate.toFixed(4)} MYR</StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      latestRate.CIMB.rate > previousRates.CIMB.rate
                        ? "increase"
                        : "decrease"
                    }
                  />
                  {calculatePercentageChange(
                    latestRate.CIMB.rate,
                    previousRates.CIMB.rate
                  ).toFixed(2)}
                  %
                </StatHelpText>
              </Stat>
            </WrapItem>
          )}

          {latestRate?.WISE && previousRates?.WISE && (
            <WrapItem>
              <Stat>
                <StatLabel>WISE</StatLabel>
                <StatNumber>{latestRate.WISE.rate.toFixed(4)} MYR</StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      latestRate.WISE.rate > previousRates.WISE.rate
                        ? "increase"
                        : "decrease"
                    }
                  />
                  {calculatePercentageChange(
                    latestRate.WISE.rate,
                    previousRates.WISE.rate
                  ).toFixed(2)}
                  %
                </StatHelpText>
              </Stat>
            </WrapItem>
          )}
        </Wrap>
      </StatGroup>
      <Box position="relative" padding="5">
        <Divider />
        {latestRate?.CIMB?.timestamp && (
          <AbsoluteCenter bg="white" px="4">
            {timeAgo(latestRate.CIMB.timestamp)}
          </AbsoluteCenter>
        )}
      </Box>
      {/* Currency Conversion Calculator */}
      {/* <Box mt={0}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="md">
            Conversion
          </Heading>
          <Select
            w="auto"
            size="md"
            value={conversionPlatform}
            onChange={(e) => {
              setConversionPlatform(e.target.value);
              if (sgdAmount) handleSgdChange(sgdAmount);
              else if (myrAmount) handleMyrChange(myrAmount);
            }}
            variant="filled"
          >
            <option value="CIMB">CIMB</option>
            <option value="WISE">WISE</option>
          </Select>
        </Flex>
        <Flex flexWrap="wrap">
          <Box w={["100%", "100%"]} mt={4} mb={4}>
            <Wrap>
              <WrapItem>
                <FormControl>
                  <FormLabel>SGD</FormLabel>
                  <Input
                    type="number"
                    value={sgdAmount}
                    onChange={(e) => handleSgdChange(e.target.value)}
                    placeholder="Enter SGD amount"
                  />
                </FormControl>
              </WrapItem>
              <WrapItem>
                <Text>X</Text>
              </WrapItem>
              <WrapItem>
                <FormControl>
                  <FormLabel>MYR</FormLabel>
                  <Input
                    type="number"
                    value={myrAmount}
                    onChange={(e) => handleMyrChange(e.target.value)}
                    placeholder="Enter MYR amount"
                  />
                </FormControl>
              </WrapItem>
            </Wrap>
          </Box>
        </Flex>
      </Box> 
      <Box position="relative" padding="5">
        <Divider />
      </Box>
*/}
      {/* Historical Rates */}
      <Box mt={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="md">
            Historical Rates
          </Heading>
          <Select
            w="auto"
            size="md"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            variant="filled"
          >
            <option value="15min">Every 5 Minutes</option>
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
          </Select>
        </Flex>
        {/* <Box position="relative" padding="10">
          <Divider />
          <AbsoluteCenter bg="white" px="4">
            Content
          </AbsoluteCenter>
        </Box> */}
        <Flex flexWrap="wrap" mt={4}>
          <Box w={["100%", "50%"]} pr={[0, 4]} mb={4}>
            <ResponsiveContainer width="100%" height={355}>
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
                  interval={48}
                  tickFormatter={(value, index) => {
                    if (index === 0 || index === chartData.length - 1) {
                      return "";
                    }
                    return "";
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
          </Box>
          <Box w={["100%", "50%"]} pl={[0, 4]} mb={4}>
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>CIMB</Th>
                  <Th>WISE</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentRecords.map((row, index) => (
                  <Tr key={index}>
                    <Td>{row.date}</Td>
                    <Td>{row.CIMBRate}</Td>
                    <Td>{row.WISERate}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {totalPages > 1 && (
              <Flex justifyContent="center" mt={4}>
                <ButtonGroup>
                  {[...Array(totalPages)].map((_, index) => (
                    <Button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      isDisabled={currentPage === index + 1}
                      variant="outline"
                    >
                      {index + 1}
                    </Button>
                  ))}
                </ButtonGroup>
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default CurrencyExchangeApp;
