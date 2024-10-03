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
  keyframes,
  usePrefersReducedMotion,
  Badge,
  Spinner,
  Tooltip as ChakraTooltip,
  VStack,
  Link,
  CardHeader,
  StackDivider,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import CIMBLogo from "./assets/cimb_logo.png";
import WiseLogo from "./assets/wise_logo.png";
import SGFlag from './assets/flag-sg.png';
import MYFlag from './assets/flag-my.png';
import ExchangeIcon from './assets/icon-exchange.jpg';
import Parser from "rss-parser/dist/rss-parser";
import CurrencyExchangeLocator from "./CurrencyExchangeLocator";
const calculatePercentageChange = (currentRate, previousRate) => {
  if (previousRate === 0) return 0;
  return ((currentRate - previousRate) / previousRate) * 100;
};

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
`;

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
  const recordsPerPage = 6;
  const yAxisDomain = getYAxisDomain(chartData);
  const [sgdValue, setSgdValue] = useState("");
  const [myrValue, setMyrValue] = useState("");

  // New state variables for currency conversion
  const [sgdAmount, setSgdAmount] = useState("");
  const [myrAmount, setMyrAmount] = useState("");
  const [conversionPlatform, setConversionPlatform] = useState("CIMB");
  const [previousRates, setPreviousRates] = useState(null);
  const [historicalRates, setHistoricalRates] = useState({
    CIMB: { last24h: null, last7d: null, last1m: null },
    WISE: { last24h: null, last7d: null, last1m: null },
  });
  const [currentPeriod, setCurrentPeriod] = useState("last24h");
  const [isChanging, setIsChanging] = useState(false);
  const periods = ["last24h", "last7d", "last1m"];
  const prefersReducedMotion = usePrefersReducedMotion();

  const animationDuration = 0.3;

  const [rssItems, setRssItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const rssUrl =
    "https://corsproxy.io/?https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936";

  useEffect(() => {
    const fetchRssFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const parser = new Parser();
        const feed = await parser.parseURL(rssUrl);
        console.log(feed.title);
        setRssItems(feed.items.slice(0, 5));
      } catch (err) {
        setError("Failed to fetch RSS feed");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRssFeed();
  }, []);

  useEffect(() => {
    const fetchData = () => {
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
            .sort((a, b) => b.timestamp - a.timestamp);

          setData(formattedData.reverse());

          // Determine the latest rates for CIMB and WISE
          const latestCIMB = formattedData
            .filter((item) => item.platform === "CIMB")
            .at(-1);
          const latestWISE = formattedData
            .filter((item) => item.platform === "WISE")
            .at(-1);

          setLatestRate({
            CIMB: latestCIMB,
            WISE: latestWISE,
          });

          // Calculate historical rates
          const now = new Date();
          const last24h = new Date(now - 24 * 60 * 60 * 1000);
          const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
          const last1m = new Date(now - 30 * 24 * 60 * 60 * 1000);

          const getHistoricalRate = (platform, date) => {
            return formattedData
              .filter(
                (item) => item.platform === platform && item.timestamp >= date
              )
              .at(0);
          };

          setHistoricalRates({
            CIMB: {
              last24h: getHistoricalRate("CIMB", last24h),
              last7d: getHistoricalRate("CIMB", last7d),
              last1m: getHistoricalRate("CIMB", last1m),
            },
            WISE: {
              last24h: getHistoricalRate("WISE", last24h),
              last7d: getHistoricalRate("WISE", last7d),
              last1m: getHistoricalRate("WISE", last1m),
            },
          });
        });
    };

    fetchData();
    const dataInterval = setInterval(fetchData, 60000); // Fetch new data every minute

    // Cycle through periods every 5 seconds
    const periodInterval = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentPeriod((prevPeriod) => {
          const currentIndex = periods.indexOf(prevPeriod);
          return periods[(currentIndex + 1) % periods.length];
        });
        setIsChanging(false);
      }, animationDuration * 1000);
    }, 5000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(periodInterval);
    };
  }, []);

  const renderStatHelpText = (platform) => {
    if (
      !latestRate ||
      !latestRate[platform] ||
      !historicalRates[platform][currentPeriod]
    ) {
      return null;
    }

    const currentRate = latestRate[platform].rate;
    const historicalRate = historicalRates[platform][currentPeriod].rate;
    const percentageChange = calculatePercentageChange(
      currentRate,
      historicalRate
    );

    const periodText = {
      last24h: "24H",
      last7d: "7D",
      last1m: "1M",
    };

    const animation = prefersReducedMotion
      ? undefined
      : `${isChanging ? fadeOut : fadeIn} ${animationDuration}s ease-in-out`;

    return (
      <StatHelpText
        animation={animation}
        style={{ opacity: isChanging ? 0 : 1 }}
      >
        <StatArrow type={percentageChange >= 0 ? "increase" : "decrease"} />
        {Math.abs(percentageChange).toFixed(2)}% ({periodText[currentPeriod]})
      </StatHelpText>
    );
  };

  const renderAnalysisText = (platform) => {
    if (
      !latestRate ||
      !latestRate[platform] ||
      !historicalRates[platform][currentPeriod]
    ) {
      return null;
    }

    const currentRate = latestRate[platform].rate;
    const historicalRate = historicalRates[platform][currentPeriod].rate;
    const percentageChange = calculatePercentageChange(
      currentRate,
      historicalRate
    );

    const periodText = {
      last24h: "24H",
      last7d: "7D",
      last1m: "1M",
    };

    const analysisText = {
      last24h: "Exchange rates will continue to increase over time, with some fluctuations.",
      last7d: "The upward trend is expected to persist, at least in the short term (up to 2 weeks).",
      last1m: "CIMB's exchange rate may experience more significant fluctuations due to its relatively volatile daily changes and potential influence from seasonal factors.",
    };

    const animation = prefersReducedMotion
      ? undefined
      : `${isChanging ? fadeOut : fadeIn} ${animationDuration}s ease-in-out`;

    return (<Flex
      height="15vh" // Full viewport height
      justifyContent="center" // Center horizontally
      alignItems="center" // Center vertically
    >
      <Text
        animation={animation}
        style={{ opacity: isChanging ? 0 : 1 }}
        fontSize="md"
      >
        {analysisText[currentPeriod]}
      </Text>
    </Flex>
    );
  };

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
      {/* <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg">
          EXACTIFY
        </Heading>
      </Flex> */}

      {/* Latest Rates Cards */}
      <StatGroup>
        <Wrap spacingX="60px" spacingY="10px">
          {latestRate?.CIMB ? (
            <WrapItem>
              <Stat>
                <StatLabel color="#ED1C24">CIMB</StatLabel>
                <ChakraTooltip
                  label={"1 SGD = " + latestRate.CIMB.rate.toFixed(4) + " MYR"}
                  aria-label="A tooltip"
                >
                  <StatNumber>{latestRate.CIMB.rate.toFixed(4)} MYR</StatNumber>
                </ChakraTooltip>
                {renderStatHelpText("CIMB")}
              </Stat>
            </WrapItem>
          ) : (
            <Spinner />
          )}

          {latestRate?.WISE && (
            <WrapItem>
              <Stat>
                <StatLabel color="#9fe870">WISE</StatLabel>
                <ChakraTooltip
                  label={"1 SGD = " + latestRate.WISE.rate.toFixed(4) + " MYR"}
                  aria-label="A tooltip"
                >
                  <StatNumber>{latestRate.WISE.rate.toFixed(4)} MYR</StatNumber>
                </ChakraTooltip>
                {renderStatHelpText("WISE")}
              </Stat>
            </WrapItem>
          )}
        </Wrap>
      </StatGroup>
      {latestRate?.CIMB?.timestamp && (
        <Box position="relative" padding="4">
          <Divider />
          <AbsoluteCenter bg="white" px="4">
            <ChakraTooltip
              label="Update every 10 minutes"
              aria-label="A tooltip"
            >
              <Text fontSize="sm">{timeAgo(latestRate.CIMB.timestamp)}</Text>
            </ChakraTooltip>
          </AbsoluteCenter>
        </Box>
      )}
      {/* {latestRate?.CIMB?.timestamp && (
        <Box position="relative" padding="4">
          <Divider />
          <AbsoluteCenter bg="white" px="2">
            <ChakraTooltip
              label="Update every 10 minutes"
              aria-label="A tooltip"
            >
              {renderAnalysisText("WISE")}
            </ChakraTooltip>
          </AbsoluteCenter>
        </Box>
      )} */}
      {/* Currency Conversion Calculator */}
      <Box mt={0}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="md">
            Conversion
          </Heading>
          <Select
            w="auto"
            size="sm"
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
        <Flex flexWrap="wrap" mt={4}>
          <Box w={["100%", "45%"]} px={1} mb={4}>
            <FormControl>
              <InputGroup>
                <InputLeftAddon pointerEvents='none'><img src={SGFlag} /></InputLeftAddon>
                <Input
                  type="number"
                  value={sgdAmount}
                  onChange={(e) => handleSgdChange(e.target.value)}
                  placeholder="SGD" variant='outline'
                />
              </InputGroup>
            </FormControl>
          </Box>
          <Box w={["0%", "10%"]} paddingX={10}><img src={ExchangeIcon} /></Box>
          <Box w={["100%", "45%"]} px={1} mb={0}>
            <FormControl>
              <InputGroup>
                <InputLeftAddon pointerEvents='none'><img src={MYFlag}/></InputLeftAddon>
                <Input
                  type="number"
                  value={myrAmount}
                  onChange={(e) => handleMyrChange(e.target.value)}
                  placeholder="MYR" variant='outline'
                />
              </InputGroup>
            </FormControl>
          </Box>
        </Flex>
      </Box>
      <Box position="relative" padding="4">
        <Divider />
      </Box>
      {/* Historical Rates */}
      <Box mt={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="md">
            Historical Rates
          </Heading>
          <Select
            w="auto"
            size="sm"
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
          <Box w={["100%", "50%"]} pr={[0, 4]} mb={0}>
            <ResponsiveContainer width="100%" height={408}>
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
                  stroke="#ED1C24"
                  dot={false}
                  strokeWidth={2}
                  animationEasing="linear"
                />
                <Line
                  type="natural"
                  dataKey="WISERate"
                  stroke="#9fe870"
                  name="WISE"
                  dot={false}
                  strokeWidth={2}
                  animationEasing="linear"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Box w={["100%", "50%"]} pl={[0, 4]} mb={0}>
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
                      colorScheme="teal"
                      variant="ghost"
                      size="sm"
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

      {renderAnalysisText("WISE")}
      <Box position="relative" padding="4">
        <Divider />
        <AbsoluteCenter bg="white" px="4">
          {/* <ChakraTooltip
              label="Update every 10 minutes"
              aria-label="A tooltip"
            > */}
          <Text fontSize="sm">Powered by <Link href="https://www.llama.com/" color="teal.500">
            LLAMA3.2
          </Link></Text>
          {/* </ChakraTooltip> */}
        </AbsoluteCenter>
      </Box>
      {/* RSS Feed Section */}
      <Box mt={4} mb={4}>
        <Heading as="h2" size="md" mb={4}>
          Latest News
        </Heading>
        {isLoading ? (
          <Flex
            // height="100vh" // Full viewport height
            justifyContent="center" // Center horizontally
            alignItems="center" // Center vertically
          >
            <Spinner />
          </Flex>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : (
          <VStack align="stretch" spacing={4}>
            <Card variant="outline">
              {/* <CardHeader>
                  <Heading as="h3" size="sm">
                    Latest News
                  </Heading>
                </CardHeader> */}
              <CardBody>
                <Stack divider={<StackDivider />} spacing="4">
                  {rssItems.map((item, index) => (
                    <Box>
                      {/* <Image
                        objectFit="cover"
                        maxW={{
                          base: "100%",
                          sm: "100px",
                        }}
                        src={item.enclosure.url}
                        alt="Caffe Latte"
                        mr="10px"
                      /> */}
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          <Link href={item.link} isExternal>
                            {item.title}
                          </Link>
                        </Heading>
                        <Text pt="2" fontSize="sm">
                          {item.contentSnippet
                            .replace("Read full story", "")
                            .trim()}
                        </Text>
                        <Text pt="0" fontSize="xs" textAlign="right">
                          {timeAgo(item.pubDate)}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </VStack>
        )}
      </Box>
      {/* <Box><CurrencyExchangeLocator /></Box> */}
    </Container>
  );
};

export default CurrencyExchangeApp;
