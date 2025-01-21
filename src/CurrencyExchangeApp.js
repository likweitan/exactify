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
  ReferenceArea,
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
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  VStack,
  InputGroup,
  InputLeftAddon,
  ChakraProvider,
  extendTheme,
  Link,
  keyframes,
  useColorMode,
  useColorModeValue as useColorModeValueHook,
  usePrefersReducedMotion,
  Badge,
  GridItem,
  Box as ChakraBox,
  HStack,
  Icon,
} from "@chakra-ui/react";
import CIMBLogo from "./assets/cimb_logo.png";
import WiseLogo from "./assets/wise_logo.png";
import SGFlag from './assets/flag-sg.png';
import MYFlag from './assets/flag-my.png';
import ExchangeIcon from './assets/icon-exchange.jpg';
import Parser from "rss-parser/dist/rss-parser";
import CurrencyExchangeLocator from "./CurrencyExchangeLocator";
import ConversionSymbol from "./ConversionSymbol";
import { InfoOutlineIcon } from '@chakra-ui/icons';

const calculatePercentageChange = (currentRate, previousRate) => {
  if (previousRate === 0) return 0;
  return ((currentRate - previousRate) / previousRate) * 100;
};

const fadeIn = keyframes({
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "100%": { opacity: 1, transform: "translateY(0)" }
});

const fadeOut = keyframes({
  "0%": { opacity: 1, transform: "translateY(0)" },
  "100%": { opacity: 0, transform: "translateY(-10px)" }
});

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

const calculateRateStats = (data, platform, timeFrame) => {
  const rates = data
    .filter(item => item[`${platform}Rate`] !== "-")
    .map(item => parseFloat(item[`${platform}Rate`]));

  if (rates.length === 0) return null;

  const current = rates[rates.length - 1];
  const prev = rates[rates.length - 2] || rates[rates.length - 1];
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  const max = Math.max(...rates);
  const min = Math.min(...rates);
  const change = ((current - prev) / prev) * 100;

  return {
    current,
    average: avg,
    highest: max,
    lowest: min,
    change,
    trend: rates.slice(-5).every((rate, i, arr) => i === 0 || rate >= arr[i - 1]) ? "up" :
           rates.slice(-5).every((rate, i, arr) => i === 0 || rate <= arr[i - 1]) ? "down" : "neutral"
  };
};

const RateCard = ({ platform, rate, color, logo, data, timeFrame }) => {
  const stats = calculateRateStats(data, platform, timeFrame);
  const bgColor = useColorModeValue('white', 'gray.700');
  const statsBgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Card
      bg={bgColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
      borderRadius="lg"
      overflow="hidden"
    >
      <Box 
        bg={color} 
        h="4px" 
        w="100%"
      />
      <CardBody p={4}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center" gap={3}>
              <Image 
                src={logo} 
                alt={platform} 
                boxSize="28px"
                borderRadius="full"
                p={1}
                bg={statsBgColor}
              />
              <VStack spacing={0} align="start">
                <Text fontWeight="bold" color="gray.700">{platform}</Text>
                <Text fontSize="xs" color="gray.500">
                  {timeFrame === "48h" ? "Last 48 Hours" : 
                   timeFrame === "1w" ? "Last Week" :
                   timeFrame === "1m" ? "Last Month" :
                   timeFrame === "6m" ? "Last 6 Months" : "Last Year"}
                </Text>
              </VStack>
            </Flex>
            {stats?.trend && (
              <Badge 
                colorScheme={stats.trend === "up" ? "green" : stats.trend === "down" ? "red" : "gray"}
                variant="subtle"
                px={2}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                <Flex alignItems="center" gap={1}>
                  {stats.trend === "up" ? "▲ " : stats.trend === "down" ? "▼ " : "■ "}
                  {stats.trend === "up" ? "Rising" : stats.trend === "down" ? "Falling" : "Stable"}
                </Flex>
              </Badge>
            )}
          </Flex>

          {/* Rate Display */}
          <Box 
            bg={statsBgColor}
            p={3} 
            borderRadius="md"
            textAlign="center"
          >
            <Text fontSize="3xl" fontWeight="bold" color={color}>
              {rate.toFixed(4)}
            </Text>
            <Text fontSize="sm" color="gray.500">MYR per SGD</Text>
          </Box>

          {/* Stats Grid */}
          {stats && (
            <SimpleGrid columns={2} spacing={4} fontSize="sm">
              {[
                {
                  label: "24h Change",
                  value: `${stats.change >= 0 ? "+" : ""}${stats.change.toFixed(2)}%`,
                  color: stats.change >= 0 ? "green.500" : "red.500"
                },
                {
                  label: "Average",
                  value: stats.average.toFixed(4)
                },
                {
                  label: "Highest",
                  value: stats.highest.toFixed(4),
                  color: "green.500"
                },
                {
                  label: "Lowest",
                  value: stats.lowest.toFixed(4),
                  color: "red.500"
                }
              ].map((item, index) => (
                <Box 
                  key={index}
                  bg={statsBgColor}
                  p={2}
                  borderRadius="md"
                >
                  <Flex justifyContent="space-between" alignItems="baseline">
                    <Text color="gray.500">{item.label}</Text>
                    <Text 
                      color={item.color} 
                      fontWeight="semibold"
                    >
                      {item.value}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
      }
    }
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: { shadow: 'md' }
        }
      }
    },
    Button: {
      variants: {
        outline: {
          borderRadius: 'full'
        }
      }
    }
  },
  colors: {
    brand: {
      cimb: "#ED1C24",
      wise: "#00B9FF",
      teal: "#319795"
    }
  }
});

const formatDateTime = (date, timeFrame) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  if (timeFrame === "48h") {
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else if (timeFrame === "1w" || timeFrame === "1m") {
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } else {
    // For 6m and 12m views
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'long'
    });
  }
};

const Section = ({ title, children, action }) => (
  <Box mb={8}>
    <Flex 
      justify="space-between" 
      align="center" 
      mb={4}
    >
      <Heading size="md">{title}</Heading>
      {action}
    </Flex>
    {children}
  </Box>
);

const CurrencyExchangeApp = () => {
  const [data, setData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("48h");
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [latestRate, setLatestRate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sgdAmount, setSgdAmount] = useState("");
  const [myrAmount, setMyrAmount] = useState("");
  const [conversionPlatform, setConversionPlatform] = useState("CIMB");
  const [bestTimeToExchange, setBestTimeToExchange] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState("last24h");
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalRates, setHistoricalRates] = useState({
    CIMB: { last24h: null, last7d: null, last1m: null },
    WISE: { last24h: null, last7d: null, last1m: null },
  });

  // Constants
  const recordsPerPage = 6;
  const yAxisDomain = getYAxisDomain(chartData);
  const periods = ["last24h", "last7d", "last1m"];
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationDuration = 0.3;

  const TIME_FRAME_OPTIONS = [
    { value: "48h", label: "48 Hours" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
    { value: "6m", label: "6 Months" },
    { value: "12m", label: "12 Months" }
  ];

  const [rssItems, setRssItems] = useState([]);

  const rssUrl =
    "https://corsproxy.io/?https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936";

  const calculateBestTimeToExchange = (data) => {
    // Simple algorithm to determine best time based on historical patterns
    const hourlyRates = {};
    data.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      if (!hourlyRates[hour]) hourlyRates[hour] = [];
      hourlyRates[hour].push(item.rate);
    });

    // Calculate average rate for each hour
    const hourlyAverages = Object.entries(hourlyRates).map(([hour, rates]) => ({
      hour: parseInt(hour),
      average: rates.reduce((a, b) => a + b, 0) / rates.length
    }));

    // Find hour with best rate
    const bestHour = hourlyAverages.reduce((a, b) => 
      a.average > b.average ? a : b
    );

    return bestHour;
  };

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

          // Calculate best time to exchange
          const bestTime = calculateBestTimeToExchange(formattedData);
          setBestTimeToExchange(bestTime);
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
      <Box>
        <StatHelpText
          animation={animation}
          style={{ opacity: isChanging ? 0 : 1 }}
          display="flex"
          alignItems="center"
          gap={1}
          bg={percentageChange >= 0 ? "green.50" : "red.50"}
          p={1}
          px={2}
          borderRadius="md"
          color={percentageChange >= 0 ? "green.600" : "red.600"}
          fontWeight="medium"
          fontSize="xs"
        >
          <StatArrow 
            type={percentageChange >= 0 ? "increase" : "decrease"}
            boxSize={3}
          />
          {Math.abs(percentageChange).toFixed(2)}%
          <Text 
            as="span" 
            color="gray.500" 
            fontSize="xs" 
            fontWeight="normal"
            ml={1}
          >
            ({periodText[currentPeriod]})
          </Text>
        </StatHelpText>
      </Box>
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
        const date = new Date(item.timestamp);
        let key;

        // Different grouping based on timeframe
        if (timeFrame === "48h") {
          // Group by hour for 48h view
          key = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours()
          ).getTime();
        } else if (timeFrame === "1w" || timeFrame === "1m") {
          // Group by day for week and month views
          key = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();
        } else {
          // Group by month for 6m and 12m views
          key = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          ).getTime();
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
        date: new Date(Number(key)),
        CIMBRate: groupedData[key]["CIMB"]
          ? (groupedData[key]["CIMB"].sum / groupedData[key]["CIMB"].count).toFixed(4)
          : "-",
        WISERate: groupedData[key]["WISE"]
          ? (groupedData[key]["WISE"].sum / groupedData[key]["WISE"].count).toFixed(4)
          : "-",
      }));

      // Sort by date
      processed.sort((a, b) => a.date - b.date);

      // Filter data based on selected time frame
      const now = new Date();
      const timeFrames = {
        "48h": now.getTime() - 48 * 60 * 60 * 1000,
        "1w": now.getTime() - 7 * 24 * 60 * 60 * 1000,
        "1m": now.getTime() - 30 * 24 * 60 * 60 * 1000,
        "6m": now.getTime() - 180 * 24 * 60 * 60 * 1000,
        "12m": now.getTime() - 365 * 24 * 60 * 60 * 1000
      };

      const filteredData = processed.filter(item => 
        item.date.getTime() > timeFrames[timeFrame]
      );

      setChartData(filteredData);
      setTableData([...filteredData].reverse());
    };

    processData();
  }, [data, timeFrame]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <Card>
          <CardBody p={2}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">
                {timeFrame === "48h" 
                  ? date.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  : date.toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                }
              </Text>
              {payload.map((entry, index) => (
                <Text key={index} color={entry.stroke}>
                  {entry.name}: {entry.value}
                </Text>
              ))}
            </VStack>
          </CardBody>
        </Card>
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
      return `${diff}s`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}m`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days}d`;
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

  // Add this function to filter data based on time frame
  const filterDataByTimeFrame = (data, timeFrame) => {
    const now = new Date();
    const timeFrames = {
      "48h": now.getTime() - 48 * 60 * 60 * 1000,
      "1w": now.getTime() - 7 * 24 * 60 * 60 * 1000,
      "1m": now.getTime() - 30 * 24 * 60 * 60 * 1000,
      "6m": now.getTime() - 180 * 24 * 60 * 60 * 1000,
      "12m": now.getTime() - 365 * 24 * 60 * 60 * 1000
    };

    return data.filter(item => new Date(item.date).getTime() > timeFrames[timeFrame]);
  };

  // Update the generateReferenceAreas function
  const generateReferenceAreas = () => {
    const areas = [];
    const data = filterDataByTimeFrame(chartData, timeFrame);
    
    if (data.length === 0) return [];

    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);
    
    let currentDate = new Date(startDate);
    
    // Generate areas for both night hours and weekends
    while (currentDate <= endDate) {
      // Add night areas (only for 48h view)
      if (timeFrame === "48h") {
        const nightStart = new Date(currentDate);
        nightStart.setHours(19, 0, 0, 0);  // 19:00
        
        const nextDayMorning = new Date(currentDate);
        nextDayMorning.setDate(currentDate.getDate() + 1);
        nextDayMorning.setHours(7, 0, 0, 0);  // 7:00 next day

        areas.push({
          start: nightStart.getTime(),
          end: nextDayMorning.getTime(),
          type: 'night',
          label: '🌙 Night Hours (19:00-07:00)'
        });
      }

      // Add weekend areas
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 6) { // Saturday
        const weekendStart = new Date(currentDate);
        weekendStart.setHours(0, 0, 0, 0);
        
        const weekendEnd = new Date(currentDate);
        weekendEnd.setDate(weekendEnd.getDate() + 2); // Add 2 days to cover Saturday and Sunday
        weekendEnd.setHours(0, 0, 0, 0);

        areas.push({
          start: weekendStart.getTime(),
          end: weekendEnd.getTime(),
          type: 'weekend',
          label: '📅 Weekend'
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return areas;
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" display="flex" flexDirection="column">
        {/* Header */}
        <Box 
          bg="white" 
          borderBottom="1px" 
          borderColor="gray.200" 
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Container maxW="container.xl" py={4}>
            <Flex justify="space-between" align="center">
              <Heading size="lg" color="brand.teal">Exactify</Heading>
              <HStack spacing={{ base: 2, md: 4 }}>
                <Select
                  w={{ base: "110px", md: "auto" }}
                  size="sm"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  borderRadius="full"
                >
                  {TIME_FRAME_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Text 
                  fontSize="sm" 
                  color="gray.500"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Box as="span" display={{ base: 'none', md: 'inline' }}>Updated</Box>
                  {latestRate?.CIMB && timeAgo(latestRate.CIMB.timestamp)}
                  <Box as="span" display={{ base: 'none', md: 'inline' }}>ago</Box>
                </Text>
              </HStack>
            </Flex>
          </Container>
        </Box>

        {/* Main Content */}
        <Box flex="1" py={8}>
          <Container maxW="container.xl">
            {/* Exchange Rates Section */}
            <Section title="Exchange Rates">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {latestRate?.CIMB && (
                  <RateCard
                    platform="CIMB"
                    rate={latestRate.CIMB.rate}
                    color="brand.cimb"
                    logo={CIMBLogo}
                    data={chartData}
                    timeFrame={timeFrame}
                  />
                )}
                {latestRate?.WISE && (
                  <RateCard
                    platform="WISE"
                    rate={latestRate.WISE.rate}
                    color="brand.wise"
                    logo={WiseLogo}
                    data={chartData}
                    timeFrame={timeFrame}
                  />
                )}
                
                {/* Currency Converter Card */}
                <Card height="100%">
                  <CardBody>
                    <VStack spacing={6}>
                      <Heading size="sm">Currency Converter</Heading>
                      <SimpleGrid columns={1} spacing={4} w="100%">
                        <FormControl>
                          <InputGroup size="lg">
                            <InputLeftAddon p={2}>
                              <Image src={SGFlag} alt="SGD" boxSize="24px" />
                            </InputLeftAddon>
                            <Input
                              type="number"
                              value={sgdAmount}
                              onChange={(e) => handleSgdChange(e.target.value)}
                              placeholder="Enter SGD"
                              borderRadius="md"
                            />
                          </InputGroup>
                        </FormControl>

                        <FormControl>
                          <InputGroup size="lg">
                            <InputLeftAddon p={2}>
                              <Image src={MYFlag} alt="MYR" boxSize="24px" />
                            </InputLeftAddon>
                            <Input
                              type="number"
                              value={myrAmount}
                              onChange={(e) => handleMyrChange(e.target.value)}
                              placeholder="Enter MYR"
                              borderRadius="md"
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>

                      <Box w="100%">
                        <SimpleGrid columns={2} spacing={3}>
                          {[100, 500, 1000, 5000].map(amount => (
                            <Button
                              key={amount}
                              size="sm"
                              variant="outline"
                              onClick={() => handleSgdChange(amount.toString())}
                              width="100%"
                            >
                              SGD {amount}
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Box>

                      <Text fontSize="sm" color="gray.500">
                        1 SGD = {latestRate?.[conversionPlatform]?.rate.toFixed(4)} MYR
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Section>

            {/* Analysis Section */}
            <Section title="Analysis">
              <Card>
                <Tabs variant="enclosed" colorScheme="teal">
                  <TabList px={4} pt={4}>
                    <Tab>Chart</Tab>
                    <Tab>History</Tab>
                    <Tab>Compare</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Chart Panel */}
                    <TabPanel p={0} pt={4}>
                      <Card>
                        <CardBody>
                          <Box 
                            h={{ base: "300px", md: "400px" }} 
                            mx={{ base: -4, md: 0 }}  // Negative margin on mobile to allow full width
                          >
                            <ResponsiveContainer>
                              <LineChart
                                data={filterDataByTimeFrame(chartData, timeFrame)}
                                margin={{
                                  top: 20, // Increased top margin to accommodate labels
                                  right: 10,
                                  left: 0,
                                  bottom: 40,
                                }}
                              >
                                <CartesianGrid 
                                  strokeDasharray="3 3" 
                                  vertical={false}
                                  opacity={0.5}
                                />
                                {/* Add Reference Areas before the lines */}
                                {generateReferenceAreas().map((area, index) => (
                                  <React.Fragment key={index}>
                                    <ReferenceArea
                                      x1={area.start}
                                      x2={area.end}
                                      fill={area.type === 'night' ? '#2D3748' : '#1A202C'}
                                      fillOpacity={area.type === 'weekend' ? 0.03 : 0.08}
                                      ifOverflow="extendDomain"
                                    />
                                    {timeFrame === "48h" && area.type === 'night' && (
                                      <text
                                        x={(new Date(area.start).getTime() + new Date(area.end).getTime()) / 2}
                                        y={15}
                                        textAnchor="middle"
                                        fill="#718096"
                                        fontSize="12"
                                      >
                                        {area.label}
                                      </text>
                                    )}
                                  </React.Fragment>
                                ))}
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={(value) => {
                                    const date = new Date(value);
                                    if (timeFrame === "48h") {
                                      return date.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        hour12: false 
                                      });
                                    } else if (timeFrame === "1w" || timeFrame === "1m") {
                                      return date.toLocaleDateString([], {
                                        month: 'short',
                                        day: 'numeric'
                                      });
                                    } else {
                                      return date.toLocaleDateString([], {
                                        month: 'short',
                                        year: '2-digit'
                                      });
                                    }
                                  }}
                                  interval={timeFrame === "48h" ? 6 : timeFrame === "6m" || timeFrame === "12m" ? 1 : 0}
                                  angle={0}
                                  tick={{ fontSize: 12, fill: '#718096' }}
                                  axisLine={{ stroke: '#E2E8F0' }}
                                  tickLine={{ stroke: '#E2E8F0' }}
                                />
                                <YAxis 
                                  hide  // Hide Y-axis labels
                                  domain={yAxisDomain}
                                />
                                <Tooltip 
                                  content={customTooltip}
                                  cursor={{ stroke: '#718096', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Legend 
                                  verticalAlign="top"
                                  height={36}
                                  iconType="circle"
                                  iconSize={8}
                                  wrapperStyle={{
                                    paddingBottom: '20px',
                                    fontSize: '14px'
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="CIMBRate"
                                  stroke="#ED1C24"
                                  name="CIMB"
                                  dot={false}
                                  strokeWidth={2}
                                  activeDot={{ r: 6, stroke: '#ED1C24', strokeWidth: 2, fill: '#FFF' }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="WISERate"
                                  stroke="#00B9FF"
                                  name="WISE"
                                  dot={false}
                                  strokeWidth={2}
                                  activeDot={{ r: 6, stroke: '#00B9FF', strokeWidth: 2, fill: '#FFF' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>

                          {/* Add min/max indicators below chart */}
                          <SimpleGrid 
                            columns={2} 
                            spacing={4} 
                            mt={4}
                            fontSize="sm"
                            display={{ base: 'grid', md: 'none' }}  // Only show on mobile
                          >
                            <Box p={2} bg="gray.50" borderRadius="md">
                              <Text color="gray.500">Lowest</Text>
                              <Text fontWeight="bold" color="red.500">
                                {Math.min(
                                  ...filterDataByTimeFrame(chartData, timeFrame)
                                    .map(item => Math.min(
                                      parseFloat(item.CIMBRate) || Infinity,
                                      parseFloat(item.WISERate) || Infinity
                                    ))
                                ).toFixed(4)}
                              </Text>
                            </Box>
                            <Box p={2} bg="gray.50" borderRadius="md">
                              <Text color="gray.500">Highest</Text>
                              <Text fontWeight="bold" color="green.500">
                                {Math.max(
                                  ...filterDataByTimeFrame(chartData, timeFrame)
                                    .map(item => Math.max(
                                      parseFloat(item.CIMBRate) || -Infinity,
                                      parseFloat(item.WISERate) || -Infinity
                                    ))
                                ).toFixed(4)}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </TabPanel>

                    {/* History Panel */}
                    <TabPanel p={0} pt={4}>
                      <Card>
                        <CardBody>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Date</Th>
                                <Th isNumeric>CIMB</Th>
                                <Th isNumeric>WISE</Th>
                                <Th isNumeric>Difference</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {filterDataByTimeFrame(tableData, timeFrame)
                                .slice(0, 10)
                                .map((row, index) => {
                                  const difference = ((parseFloat(row.CIMBRate) - parseFloat(row.WISERate)) / parseFloat(row.WISERate) * 100).toFixed(2);
                                  return (
                                    <Tr key={index}>
                                      <Td>{formatDateTime(row.date, timeFrame)}</Td>
                                      <Td isNumeric>{row.CIMBRate}</Td>
                                      <Td isNumeric>{row.WISERate}</Td>
                                      <Td isNumeric color={difference >= 0 ? "green.500" : "red.500"}>
                                        {difference}%
                                      </Td>
                                    </Tr>
                                  );
                                })}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    </TabPanel>

                    {/* Compare Panel */}
                    <TabPanel p={0} pt={4}>
                      <Card>
                        <CardBody>
                          <ChakraBox overflowX="auto" whiteSpace="nowrap">
                            <Table size="sm" style={{ minWidth: "650px" }}>
                              <Thead>
                                <Tr>
                                  <Th width="20%">Platform</Th>
                                  <Th width="20%" isNumeric>Average Rate</Th>
                                  <Th width="20%" isNumeric>Highest</Th>
                                  <Th width="20%" isNumeric>Lowest</Th>
                                  <Th width="20%" isNumeric>Current</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {latestRate && Object.entries(latestRate).map(([platform, data]) => {
                                  const filteredData = filterDataByTimeFrame(chartData, timeFrame);
                                  const rates = filteredData.map(item => parseFloat(item[`${platform}Rate`])).filter(rate => !isNaN(rate));
                                  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
                                  const highestRate = Math.max(...rates);
                                  const lowestRate = Math.min(...rates);
                                  
                                  return (
                                    <Tr key={platform}>
                                      <Td>
                                        <Flex alignItems="center" gap={2} minWidth="100px">
                                          <Image 
                                            src={platform === "CIMB" ? CIMBLogo : WiseLogo} 
                                            alt={platform} 
                                            boxSize="20px"
                                          />
                                          {platform}
                                        </Flex>
                                      </Td>
                                      <Td isNumeric>{avgRate.toFixed(4)}</Td>
                                      <Td isNumeric color="green.500">{highestRate.toFixed(4)}</Td>
                                      <Td isNumeric color="red.500">{lowestRate.toFixed(4)}</Td>
                                      <Td isNumeric fontWeight="bold">{data.rate.toFixed(4)}</Td>
                                    </Tr>
                                  );
                                })}
                              </Tbody>
                            </Table>
                          </ChakraBox>
                          <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                            Swipe left/right to view more
                          </Text>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Card>
            </Section>

            {/* Best Time Section */}
            {bestTimeToExchange && (
              <Section title="Recommendation">
                <Card>
                  <CardBody>
                    <HStack spacing={4}>
                      <Icon as={InfoOutlineIcon} color="brand.teal" boxSize={5} />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Best Time to Exchange</Text>
                        <Text color="gray.600">
                          Historical data suggests the best rates occur around{' '}
                          <Text as="span" fontWeight="bold" color="brand.teal">
                            {bestTimeToExchange.hour}:00 SGT
                          </Text>
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              </Section>
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box bg="white" borderTop="1px" borderColor="gray.200" py={6}>
          <Container maxW="container.xl">
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">
                Made with ♥ by{" "}
                <Link href="https://github.com/likweitan" isExternal color="brand.teal">
                  @likweitan
                </Link>
              </Text>
              <Text fontSize="xs" color="gray.500">
                Exactify is not associated with{" "}
                <Link href="https://www.cimb.com.sg" color="brand.teal">CIMB</Link>
                {" "}or{" "}
                <Link href="https://www.wise.com" color="brand.teal">WISE</Link>
              </Text>
            </VStack>
          </Container>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default CurrencyExchangeApp;
