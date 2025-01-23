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
  ReferenceLine,
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
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import CIMBLogo from "./assets/cimb_logo.png";
import WiseLogo from "./assets/wise_logo.png";
import PandaRemitLogo from "./assets/panda_remit_logo.jpg";
import SGFlag from './assets/flag-sg.png';
import MYFlag from './assets/flag-my.png';
import ExchangeIcon from './assets/icon-exchange.jpg';
import Parser from "rss-parser/dist/rss-parser";
import CurrencyExchangeLocator from "./CurrencyExchangeLocator";
import ConversionSymbol from "./ConversionSymbol";
import { InfoOutlineIcon, TimeIcon, CalendarIcon, StarIcon } from '@chakra-ui/icons';
import { Helmet } from 'react-helmet';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiActivity, FiMenu, FiGithub, FiInfo, FiMapPin, FiRefreshCw, FiClock, FiRepeat, FiArrowRight } from 'react-icons/fi';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

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

const calculateAverage = (data, platform) => {
  const validRates = data
    .map(item => parseFloat(item[`${platform}Rate`]))
    .filter(rate => !isNaN(rate));

  if (validRates.length === 0) return 0;
  
  const total = validRates.reduce((sum, rate) => sum + rate, 0);
  return total / validRates.length;
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

const calculateLinearRegression = (data, platform) => {
  // Get last 3 months of data
  const threeMothsAgo = new Date();
  threeMothsAgo.setMonth(threeMothsAgo.getMonth() - 3);

  const recentData = data
    .filter(item => new Date(item.date) >= threeMothsAgo)
    .filter(item => item[`${platform}Rate`] !== "-")
    .map((item, index) => ({
      x: index,
      y: parseFloat(item[`${platform}Rate`]),
      weight: Math.exp(index / 1000) // Give more weight to recent data
    }));

  if (recentData.length < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumW = 0;
  
  recentData.forEach(point => {
    sumX += point.x * point.weight;
    sumY += point.y * point.weight;
    sumXY += point.x * point.y * point.weight;
    sumXX += point.x * point.x * point.weight;
    sumW += point.weight;
  });

  const slope = (sumW * sumXY - sumX * sumY) / (sumW * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / sumW;

  // Calculate R-squared (coefficient of determination)
  const yMean = sumY / sumW;
  let totalSS = 0, residualSS = 0;

  recentData.forEach(point => {
    const yPred = slope * point.x + intercept;
    totalSS += point.weight * Math.pow(point.y - yMean, 2);
    residualSS += point.weight * Math.pow(point.y - yPred, 2);
  });

  const rSquared = 1 - (residualSS / totalSS);

  return { slope, intercept, rSquared };
};

const calculateVolatility = (data, platform, window = 30) => {
  const rates = data
    .filter(item => item[`${platform}Rate`] !== "-")
    .map(item => parseFloat(item[`${platform}Rate`]));

  if (rates.length < window) return 0;

  const returns = [];
  for (let i = 1; i < rates.length; i++) {
    returns.push((rates[i] - rates[i - 1]) / rates[i - 1]);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
};

const calculateMovingAverage = (data, platform, window = 7) => {
  const rates = data
    .filter(item => item[`${platform}Rate`] !== "-")
    .map(item => parseFloat(item[`${platform}Rate`]));
  
  const movingAverages = [];
  for (let i = window - 1; i < rates.length; i++) {
    const sum = rates.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    movingAverages.push(sum / window);
  }
  
  return movingAverages;
};

const calculateExponentialSmoothing = (data, platform, alpha = 0.3) => {
  const rates = data
    .filter(item => item[`${platform}Rate`] !== "-")
    .map(item => parseFloat(item[`${platform}Rate`]));
  
  const smoothed = [rates[0]];
  for (let i = 1; i < rates.length; i++) {
    smoothed.push(alpha * rates[i] + (1 - alpha) * smoothed[i - 1]);
  }
  
  return smoothed;
};

const analyzeSeasonality = (data, platform) => {
  // Group data by hour
  const hourlyData = {};
  const dailyData = {};

  data.forEach(item => {
    const hour = item.date.getHours();
    const day = item.date.getDay();
    const rate = item[`${platform}Rate`];

    // Hourly analysis
    if (!hourlyData[hour]) {
      hourlyData[hour] = { sum: 0, count: 0, rates: [] };
    }
    hourlyData[hour].sum += rate;
    hourlyData[hour].count += 1;
    hourlyData[hour].rates.push(rate);

    // Daily analysis
    if (!dailyData[day]) {
      dailyData[day] = { sum: 0, count: 0, rates: [] };
    }
    dailyData[day].sum += rate;
    dailyData[day].count += 1;
    dailyData[day].rates.push(rate);
  });

  // Calculate averages and factors with stronger off-hours adjustment
  const hourlyAverages = {};
  for (let hour = 0; hour < 24; hour++) {
    if (hourlyData[hour]) {
      const avg = hourlyData[hour].sum / hourlyData[hour].count;
      let factor = 1.0;
      let confidenceLevel = 75; // Default confidence

      if (platform === 'CIMB') {
        // CIMB specific hour adjustments
        if (hour >= 19 || hour < 9) {
          // Stronger decrease during off-hours
          factor = 0.9985; // More aggressive decrease
          confidenceLevel = 90; // Higher confidence for off-hours decrease
        } else if (hour >= 9 && hour < 17) {
          // Normal business hours
          factor = 1.0005;
          confidenceLevel = 85;
        } else {
          // Transition period (17:00-19:00)
          factor = 0.9995;
          confidenceLevel = 80;
        }
      }

      hourlyAverages[hour] = {
        average: avg,
        factor: factor,
        confidence: confidenceLevel,
        volatility: calculateVolatilityForPeriod(hourlyData[hour].rates)
      };
    }
  }

  return {
    hourlyAverages,
    dailyAverages: Object.entries(dailyData).reduce((acc, [day, data]) => {
      acc[day] = {
        average: data.sum / data.count,
        volatility: calculateVolatilityForPeriod(data.rates)
      };
      return acc;
    }, {})
  };
};

const calculateVolatilityForPeriod = (rates) => {
  const returns = [];
  for (let i = 1; i < rates.length; i++) {
    returns.push((rates[i] - rates[i - 1]) / rates[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
};

// Update generateShortTermPrediction to use latestRate from props
const generateShortTermPrediction = (currentRate, hour, platform, seasonality) => {
  if (platform === 'CIMB') {
    let predictedRate = currentRate;
    let confidence = 85;
    let volatility = 0.0005;

    // After business hours (19:00-09:00)
    if (hour >= 19 || hour < 9) {
      predictedRate *= 0.9985; // Guaranteed decrease
      confidence = 90;
      volatility = 0.0003;
    }
    // Business hours (09:00-17:00)
    else if (hour >= 9 && hour < 17) {
      predictedRate *= 1.0005;
      confidence = 85;
      volatility = 0.0008;
    }
    // Transition period (17:00-19:00)
    else {
      predictedRate *= 0.9995;
      confidence = 80;
      volatility = 0.0006;
    }

    return {
      predictedRate,
      confidence,
      volatility
    };
  }

  // Default prediction for other platforms
  return {
    predictedRate: currentRate,
    confidence: 75,
    volatility: 0.0005
  };
};

// Update the generatePredictions function signature
const generatePredictions = (data, platform, latestRate, daysToPredict = 7) => {
  const validData = data
    .filter(item => (
      item.date && 
      item[`${platform}Rate`] && 
      !isNaN(parseFloat(item[`${platform}Rate`]))
    ))
    .map(item => ({
      ...item,
      date: new Date(item.date),
      [`${platform}Rate`]: parseFloat(item[`${platform}Rate`])
    }))
    .sort((a, b) => a.date - b.date);

  if (validData.length < 2) return [];

  // Calculate regression using 3 months data
  const regression = calculateLinearRegression(validData, platform);
  const movingAvg = calculateMovingAverage(validData, platform);
  const expSmoothing = calculateExponentialSmoothing(validData, platform);
  const seasonality = analyzeSeasonality(validData, platform);
  const volatility = calculateVolatility(validData, platform);
  
  if (!regression) return [];

  const lastDate = validData[validData.length - 1].date;
  const predictions = [];
  let lastPredictedValue = null;
  let lastConfidence = null;

  // Calculate baseline metrics
  const lastMonth = validData.slice(-30);
  const currentAverage = lastMonth.reduce((sum, item) => sum + item[`${platform}Rate`], 0) / lastMonth.length;
  const maxRate = Math.max(...lastMonth.map(item => item[`${platform}Rate`]));
  const minRate = Math.min(...lastMonth.map(item => item[`${platform}Rate`]));
  const range = maxRate - minRate;

  for (let i = 1; i <= daysToPredict; i++) {
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + i);
    
    // Base prediction on regression
    const regressionValue = regression.slope * (validData.length + i - 1) + regression.intercept;
    
    // Adjust for recent trends
    const maValue = movingAvg[movingAvg.length - 1] || currentAverage;
    const esValue = expSmoothing[expSmoothing.length - 1] || currentAverage;
    
    // Seasonality factors
    const hour = predictedDate.getHours();
    const day = predictedDate.getDay();
    const hourlyFactor = seasonality.hourlyAverages?.[hour]?.factor ?? 1;
    const dailyFactor = seasonality.dailyAverages?.[day]?.average ?? 1;
    const seasonalityMultiplier = ((hourlyFactor + dailyFactor) / 2) || 1;

    // Weight components based on regression quality
    const regressionWeight = regression.rSquared;
    const trendWeight = 1 - regressionWeight;

    // Combine predictions with weighted components
    let predictedValue = (
      regressionValue * regressionWeight +
      ((maValue + esValue) / 2) * trendWeight
    ) * seasonalityMultiplier;

    // Add volatility-based boundaries
    const volatilityRange = volatility * i; // Increase uncertainty with time
    const upperBound = currentAverage * (1 + volatilityRange);
    const lowerBound = currentAverage * (1 - volatilityRange);
    
    // Ensure prediction stays within reasonable bounds
    const finalValue = Math.max(
      Math.min(predictedValue, upperBound),
      lowerBound
    );

    const timeFactor = Math.max(0, 1 - (i / daysToPredict) * 0.5);
    const volatilityFactor = Math.max(0, 1 - volatility * 10);
    const regressionFactor = regression.rSquared;
    
    const confidence = (
      (timeFactor + volatilityFactor + regressionFactor) / 3
    ) * 100;

    if (!isNaN(finalValue)) {
      const prediction = {
        date: predictedDate,
        predictedRate: parseFloat(finalValue.toFixed(4)),
        platform,
        confidence: Math.min(100, Math.max(0, confidence)),
        volatility: volatility,
        rSquared: regression.rSquared
      };
      predictions.push(prediction);
      lastPredictedValue = finalValue;
      lastConfidence = confidence;
    }
  }

  // Generate hourly predictions for first 3 hours
  const hourlyPredictions = [];
  const currentRate = latestRate?.[platform]?.exchange_rate;
  
  if (currentRate) {
    for (let i = 1; i <= 3; i++) {
      const predictionDate = new Date();
      predictionDate.setHours(predictionDate.getHours() + i);
      const hour = predictionDate.getHours();

      const prediction = generateShortTermPrediction(
        currentRate,
        hour,
        platform,
        seasonality
      );

      hourlyPredictions.push({
        date: predictionDate,
        predictedRate: parseFloat(prediction.predictedRate.toFixed(4)),
        platform,
        confidence: prediction.confidence,
        volatility: prediction.volatility
      });
    }
  }

  return [...hourlyPredictions, ...predictions];
};

const PredictionChart = ({ historicalData, timeFrame, latestRate }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Ensure we have valid historical data
  const validHistoricalData = historicalData
    .filter(item => (
      item.timestamp && // Change from item.date to item.timestamp
      (item.exchange_rate || item.rate) && // Handle both possible rate field names
      !isNaN(parseFloat(item.exchange_rate || item.rate))
    ))
    .map(item => ({
      ...item,
      date: new Date(item.timestamp), // Use timestamp instead of date
      CIMBRate: item.platform === 'CIMB' ? parseFloat(item.exchange_rate || item.rate) : undefined,
      WISERate: item.platform === 'WISE' ? parseFloat(item.exchange_rate || item.rate) : undefined
    }));

  // Group data by date to combine CIMB and WISE rates
  const groupedData = validHistoricalData.reduce((acc, curr) => {
    const dateKey = curr.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: curr.date,
        CIMBRate: curr.CIMBRate,
        WISERate: curr.WISERate
      };
    } else {
      if (curr.CIMBRate) acc[dateKey].CIMBRate = curr.CIMBRate;
      if (curr.WISERate) acc[dateKey].WISERate = curr.WISERate;
    }
    return acc;
  }, {});

  // Convert grouped data back to array
  const processedData = Object.values(groupedData)
    .filter(item => item.CIMBRate || item.WISERate)
    .sort((a, b) => a.date - b.date);

  // Generate predictions for each platform
  const cimbPredictions = generatePredictions(processedData, 'CIMB', latestRate);
  const wisePredictions = generatePredictions(processedData, 'WISE', latestRate);

  // Only show predictions if we have them
  if (cimbPredictions.length === 0 && wisePredictions.length === 0) {
    return (
      <Card bg={bgColor}>
        <CardBody>
          <VStack spacing={4}>
            <Text color="gray.500">
              Not enough data to generate predictions at this time.
              {processedData.length === 0 && " (No valid historical data found)"}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // Update the chart data processing in PredictionChart
  const chartData = cimbPredictions.map(pred => ({
    date: pred.date,
    CIMBPredicted: pred.predictedRate,
    CIMBConfidence: pred.confidence
  }));

  // Add WISE predictions
  wisePredictions.forEach(pred => {
    const existingIndex = chartData.findIndex(item => 
      new Date(item.date).getTime() === pred.date.getTime()
    );
    
    if (existingIndex >= 0) {
      chartData[existingIndex].WISEPredicted = pred.predictedRate;
      chartData[existingIndex].WISEConfidence = pred.confidence;
    } else {
      chartData.push({
        date: pred.date,
        WISEPredicted: pred.predictedRate,
        WISEConfidence: pred.confidence
      });
    }
  });

  // Sort by date
  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Card bg={bgColor}>
      <CardBody>
        <VStack spacing={6}>
          <HStack w="100%" justify="space-between">
            <VStack align="start" spacing={0}>
              <Heading size="sm">Exchange Rate Forecast</Heading>
              <Text fontSize="sm" color="gray.500">Next 7 days prediction</Text>
            </VStack>
            <Badge colorScheme="teal" variant="subtle" px={2} py={1}>
              ML-powered
            </Badge>
          </HStack>

          {/* Prediction Insights */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
            {['CIMB', 'WISE'].map(platform => {
              const predictions = platform === 'CIMB' ? cimbPredictions : wisePredictions;
              if (!predictions.length) return null;

              const latestPrediction = predictions[0];
              const lastHistorical = processedData[processedData.length - 1][`${platform}Rate`];
              const predictedChange = ((latestPrediction.predictedRate - lastHistorical) / lastHistorical) * 100;
              
              return (
                <Card key={platform} variant="outline" p={4}>
                  <VStack align="start" spacing={3} w="100%">
                    <HStack justify="space-between" w="100%">
                      <HStack>
                        <Image 
                          src={
                            platform === 'CIMB' ? CIMBLogo : 
                            platform === 'WISE' ? WiseLogo :
                            platform === 'PANDAREMIT' ? PandaRemitLogo :
                            WiseLogo // default fallback
                          } 
                          alt={platform} 
                          boxSize="16px" 
                        />
                        <Text fontWeight="medium">{platform} Forecast</Text>
                      </HStack>
                      <Badge 
                        colorScheme={
                          latestPrediction.confidence > 80 ? "green" :
                          latestPrediction.confidence > 60 ? "yellow" : "red"
                        }
                      >
                        {latestPrediction.confidence.toFixed(0)}% confidence
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={2} spacing={4} w="100%">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">Current Rate</Text>
                        <Text fontWeight="medium">{lastHistorical}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">Predicted Rate</Text>
                        <Text fontWeight="medium">{latestPrediction.predictedRate}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">Expected Change</Text>
                        <HStack>
                          <Badge 
                            colorScheme={predictedChange >= 0 ? "green" : "red"}
                            variant="subtle"
                          >
                            {predictedChange >= 0 ? "↑" : "↓"} {Math.abs(predictedChange).toFixed(2)}%
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">Volatility</Text>
                        <Badge 
                          colorScheme={
                            latestPrediction.volatility < 0.001 ? "green" :
                            latestPrediction.volatility < 0.002 ? "yellow" : "red"
                          }
                          variant="subtle"
                        >
                          {(latestPrediction.volatility * 100).toFixed(2)}%
                        </Badge>
                      </VStack>
                    </SimpleGrid>

                    <Text fontSize="xs" color="gray.500">
                      {latestPrediction.confidence > 80 
                        ? "High confidence prediction based on stable market patterns"
                        : latestPrediction.confidence > 60
                        ? "Moderate confidence with some market uncertainty"
                        : "Lower confidence due to high market volatility"
                      }
                    </Text>
                  </VStack>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* Chart */}
          <Box h="300px" w="100%">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
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
                  interval={timeFrame === "48h" ? 6 : timeFrame === "1m" ? Math.floor(chartData.length / 6) : 1}
                  angle={0}
                  tick={{ fontSize: 12, fill: '#718096' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tickFormatter={(value) => value.toFixed(4)}
                  hide
                />
                <Tooltip 
                  content={(props) => (
                    <ChartTooltip 
                      {...props} 
                      timeFrame={timeFrame} 
                      chartData={chartData}
                      tooltipBgColor={bgColor}
                      tooltipBorderColor={borderColor}
                    />
                  )}
                  cursor={{ stroke: '#718096', strokeWidth: 1, strokeDasharray: '3 3' }}
                  wrapperStyle={{ zIndex: 100 }}
                  offset={10}
                />
                <ReferenceLine 
                  x={new Date().toISOString()} 
                  stroke="#718096" 
                  strokeDasharray="3 3"
                  label={{ value: 'Today', position: 'top', fill: '#718096' }}
                />
                {/* Prediction Lines */}
                <Line
                  type="monotone"
                  dataKey="CIMBPredicted"
                  name="CIMB Forecast"
                  stroke="#ED1C24"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={renderConfidenceDot}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="WISEPredicted"
                  name="WISE Forecast"
                  stroke="#00B9FF"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={renderConfidenceDot}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
            Predictions combine multiple statistical models and historical patterns.
            Actual rates may vary due to market conditions.
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Add this helper function for rendering confidence dots
const renderConfidenceDot = (props) => {
  if (!props.payload.isPredicted) return null;
  
  const confidence = props.payload[`${props.dataKey.replace('Rate', '')}Confidence`];
  const color = confidence > 80 ? "#48BB78" : // green
               confidence > 60 ? "#ECC94B" : // yellow
               "#F56565"; // red
  
  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={5}
      stroke={color}
      fill={color}
      strokeWidth={0}
      opacity={0.8}
    />
  );
};

// Add this new component near the top of the file, after the imports
const ChartTooltip = ({ active, payload, label, timeFrame, chartData, tooltipBgColor, tooltipBorderColor }) => {
  // Move color mode values outside the map function
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  
  if (active && payload && payload.length) {
    const date = new Date(label);

    // Sort and group rates by value
    const rateGroups = payload.reduce((acc, entry) => {
      const value = entry.value.toString();
      if (!acc[value]) {
        acc[value] = [];
      }
      acc[value].push(entry);
      return acc;
    }, {});

    return (
      <Card 
        bg={tooltipBgColor} 
        border="1px" 
        borderColor={tooltipBorderColor}
        boxShadow="lg"
        minW="200px"
      >
        <CardBody p={3}>
          <VStack align="start" spacing={3}>
            {/* Date Header */}
            <Text 
              fontWeight="medium" 
              fontSize="sm"
              color="gray.600"
              pb={2}
              borderBottom="1px"
              borderColor={tooltipBorderColor}
              w="100%"
            >
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

            {/* Rates grouped by value */}
            <VStack spacing={2} w="100%">
              {Object.entries(rateGroups).map(([rate, entries]) => {
                const previousValues = entries.map(entry => {
                  const prevIndex = chartData.findIndex(item => item.date === date) - 1;
                  return prevIndex >= 0 ? chartData[prevIndex][entry.dataKey] : null;
                });

                const changes = previousValues.map((prev, idx) => 
                  prev ? ((entries[idx].value - prev) / prev) * 100 : 0
                );

                return (
                  <HStack 
                    key={rate}
                    p={2}
                    bg={entries.length > 1 ? 'purple.50' : entries[0].dataKey.includes('CIMB') ? 'red.50' : 'blue.50'}
                    borderRadius="md"
                    justify="space-between"
                    w="100%"
                    borderBottom="1px"
                    borderColor={tooltipBorderColor}
                    _hover={{ 
                      bg: tooltipBgColor === 'white' ? hoverBgColor : cardBorderColor 
                    }}
                  >
                    <HStack spacing={2}>
                      {entries.map((entry, idx) => (
                        <HStack key={idx} spacing={1}>
                          <Image 
                            src={entry.dataKey.includes('CIMB') ? CIMBLogo : WiseLogo} 
                            alt={entry.dataKey.replace('Rate', '')} 
                            boxSize="16px"
                          />
                          {idx < entries.length - 1 && (
                            <Text color="gray.500" fontSize="sm">/</Text>
                          )}
                        </HStack>
                      ))}
                      <Text fontSize="sm" fontWeight="medium">
                        {rate}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      {changes.map((change, idx) => (
                        previousValues[idx] && (
                          <Badge
                            key={idx}
                            colorScheme={change >= 0 ? 'green' : 'red'}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                          </Badge>
                        )
                      ))}
                    </HStack>
                  </HStack>
                );
              })}
            </VStack>

            <Text fontSize="xs" color="gray.500" pt={1}>
              {timeFrame === "48h" ? "Hourly Rate" : "Daily Average"}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }
  return null;
};

// Create a new MetaTags component at the top of the file
const MetaTags = ({ latestRate }) => {
  if (!latestRate?.CIMB?.exchange_rate) return null;

  const cimbRate = Number(latestRate.CIMB.exchange_rate).toFixed(4);
  const wiseRate = latestRate.WISE?.exchange_rate ? Number(latestRate.WISE.exchange_rate).toFixed(4) : null;
  const timestamp = new Date().toLocaleString('en-SG', { 
    timeZone: 'Asia/Singapore',
    hour12: false 
  });

  const description = `Current SGD to MYR rates - CIMB: ${cimbRate}${wiseRate ? ` | Wise: ${wiseRate}` : ''} (Updated: ${timestamp} SGT). Get real-time exchange rates and predictions.`;

  return (
    <Helmet>
      <title>{`SGD to MYR: ${cimbRate} | Exactify`}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`SGD to MYR: ${cimbRate} | Exactify`} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={`SGD to MYR: ${cimbRate} | Exactify`} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

// Add these component definitions after the imports
const StatChange = ({ value }) => {
  if (!value) return null;
  
  return (
    <Badge
      colorScheme={value >= 0 ? "green" : "red"}
      variant="subtle"
      px={2}
      py={1}
    >
      <HStack spacing={1}>
        <StatArrow type={value >= 0 ? "increase" : "decrease"} />
        <Text>{Math.abs(value).toFixed(2)}%</Text>
      </HStack>
    </Badge>
  );
};

const StatCard = ({ label, value, icon, color, size = "md" }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card variant="outline" w="100%">
      <CardBody p={size === "sm" ? 2 : 4}>
        <VStack spacing={1} align="start">
          <HStack color="gray.500">
            {icon}
            <Text fontSize={size === "sm" ? "xs" : "sm"}>{label}</Text>
          </HStack>
          <Text 
            fontSize={size === "sm" ? "md" : "lg"} 
            fontWeight="bold"
            color={color}
          >
            {value}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

// First, add this helper function at the top level
const generateInsights = (chartData, timeFrame) => {
  if (!chartData.length) return [];

  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  
  const insights = [];
  
  // Calculate daily patterns
  const hourlyRates = chartData.reduce((acc, item) => {
    const hour = new Date(item.date).getHours();
    if (!acc[hour]) acc[hour] = [];
    if (item.CIMBRate) acc[hour].push(item.CIMBRate);
    return acc;
  }, {});

  // Best and worst hours
  const hourlyAverages = Object.entries(hourlyRates).map(([hour, rates]) => ({
    hour: parseInt(hour),
    average: rates.reduce((a, b) => a + b, 0) / rates.length
  }));

  const bestHour = hourlyAverages.reduce((a, b) => b.average > a.average ? b : a);
  const worstHour = hourlyAverages.reduce((a, b) => b.average < a.average ? b : a);

  // Add insights based on timeframe
  if (timeFrame === "48h") {
    insights.push({
      title: "Best Time to Exchange",
      text: `Historically best rates appear around ${bestHour.hour}:00`,
      icon: FiClock,
      color: "green"
    });
  }

  // Volatility insight
  const volatility = calculateVolatility(chartData, 'CIMBRate');
  insights.push({
    title: "Market Volatility",
    text: volatility > 0.001 ? 
      "High volatility, expect significant rate changes" : 
      "Low volatility, rates are relatively stable",
    icon: FiTrendingUp,
    color: volatility > 0.001 ? "orange" : "blue"
  });

  // Trend insight
  if (latestData && previousData) {
    const trend = latestData.CIMBRate > previousData.CIMBRate;
    insights.push({
      title: "Current Trend",
      text: trend ? 
        "Rates are trending upward" : 
        "Rates are trending downward",
      icon: trend ? FiArrowUpRight : FiArrowDownRight,
      color: trend ? "green" : "red"
    });
  }

  return insights;
};

const CurrencyExchangeApp = () => {
  const [lastUpdated, setLastUpdated] = useState(0);
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

  // Add these state variables
  const [cimbPredictions, setCimbPredictions] = useState([]);
  const [wisePredictions, setWisePredictions] = useState([]);
  const [processedData, setProcessedData] = useState([]);

  // Move color mode values outside the map function
  const statBgColor = useColorModeValue('gray.50', 'gray.700');

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

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              exchange_rate: parseFloat(item.exchange_rate),
              platform: item.platform,
            }))
            .filter(item => !isNaN(item.exchange_rate)) // Remove invalid rates
            .sort((a, b) => b.timestamp - a.timestamp);

          setData(formattedData);

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

    const currentRate = latestRate[platform].exchange_rate;
    const historicalRate = historicalRates[platform][currentPeriod].exchange_rate;
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

    const currentRate = latestRate[platform].exchange_rate;
    const historicalRate = historicalRates[platform][currentPeriod].exchange_rate;
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
      if (!data || data.length === 0) return;

      // Get the latest timestamp and update rates
      const latestTimestamp = new Date(data[0].timestamp);
      const minutesAgo = Math.floor((new Date() - latestTimestamp) / (1000 * 60));
      setLastUpdated(minutesAgo);

      // Group the latest rates by platform
      const latest = data.reduce((acc, item) => {
        if (!acc[item.platform] || new Date(item.timestamp) > new Date(acc[item.platform].timestamp)) {
          acc[item.platform] = item;
        }
        return acc;
      }, {});

      setLatestRate(latest);

      // Process data for charts and predictions
      const processed = data.map(item => ({
        date: new Date(item.timestamp),
        CIMBRate: item.platform === 'CIMB' ? parseFloat(item.exchange_rate) : null,
        WISERate: item.platform === 'WISE' ? parseFloat(item.exchange_rate) : null
      }));

      // Group data by timeframe
      let groupedData = {};
      processed.forEach((item) => {
        const date = new Date(item.date);
        let key;

        if (timeFrame === "48h") {
          key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
        } else if (timeFrame === "1w" || timeFrame === "1m") {
          key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        } else {
          key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        }

        if (!groupedData[key]) {
          groupedData[key] = { date: new Date(key), CIMBRate: null, WISERate: null };
        }

        if (item.CIMBRate) groupedData[key].CIMBRate = item.CIMBRate;
        if (item.WISERate) groupedData[key].WISERate = item.WISERate;
      });

      // Convert grouped data to array and sort
      const chartProcessed = Object.values(groupedData).sort((a, b) => a.date - b.date);

      // Filter data based on timeframe
      const now = new Date();
      const timeFrames = {
        "48h": now.getTime() - 48 * 60 * 60 * 1000,
        "1w": now.getTime() - 7 * 24 * 60 * 60 * 1000,
        "1m": now.getTime() - 30 * 24 * 60 * 60 * 1000,
        "6m": now.getTime() - 180 * 24 * 60 * 60 * 1000,
        "12m": now.getTime() - 365 * 24 * 60 * 60 * 1000
      };

      const filteredData = chartProcessed.filter(item => 
        item.date.getTime() > timeFrames[timeFrame]
      );

      setChartData(filteredData);
      setProcessedData(processed);
      setTableData([...filteredData].reverse());

      // Generate predictions with latestRate
      const cimbPreds = generatePredictions(processed, 'CIMB', latestRate);
      const wisePreds = generatePredictions(processed, 'WISE', latestRate);

      setCimbPredictions(cimbPreds);
      setWisePredictions(wisePreds);
    };

    processData();
  }, [data, timeFrame, latestRate]); // Add latestRate to dependencies

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
    if (latestRate && latestRate[conversionPlatform] && value) {
      const rate = latestRate[conversionPlatform].exchange_rate;
      if (rate) {
      setMyrAmount((parseFloat(value) * rate).toFixed(2));
      }
    } else {
      setMyrAmount("");
    }
  };

  const handleMyrChange = (value) => {
    setMyrAmount(value);
    if (latestRate && latestRate[conversionPlatform] && value) {
      const rate = latestRate[conversionPlatform].exchange_rate;
      if (rate) {
      setSgdAmount((parseFloat(value) / rate).toFixed(2));
      }
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

  const tooltipBgColor = useColorModeValue('white', 'gray.800');
  const tooltipBorderColor = useColorModeValue('gray.200', 'gray.600');

  const { colorMode, toggleColorMode } = useColorMode();

  // Move these color mode values outside the map function
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');

  const fetchLatestRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/likweitan/CIMB-exchange-rates/main/exchange_rates.json"
      );
      const jsonData = await response.json();
      const formattedData = jsonData
        .map((item) => ({
          timestamp: new Date(item.timestamp),
          exchange_rate: parseFloat(item.exchange_rate),
          platform: item.platform,
        }))
        .filter(item => !isNaN(item.exchange_rate))
        .sort((a, b) => b.timestamp - a.timestamp);

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching rates:", error);
      setError("Failed to fetch latest rates");
    } finally {
      setIsLoading(false);
    }
  };

  // Inside the main component, before the return statement
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.700');
  const buttonBorderColorLight = useColorModeValue('gray.200', 'gray.600');

  // Move these color mode values outside the map function
  const rateCardBg = useColorModeValue('white', 'gray.800');
  const rateCardActiveBgCIMB = useColorModeValue('red.50', 'red.900');
  const rateCardActiveBgWISE = useColorModeValue('blue.50', 'blue.900');
  const rateCardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const rateCardActiveBorderCIMB = 'red.500';
  const rateCardActiveBorderWISE = 'blue.500';

  // Move all color mode values outside the map function
  const rateCardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const rateCardSelectedBg = useColorModeValue('gray.50', 'gray.700');

  // Update the rate card click handler to also recalculate amounts
  const handleRateCardClick = (platform, rate) => {
    setConversionPlatform(platform);
    
    // Recalculate amounts based on the new rate
    if (sgdAmount) {
      setMyrAmount((parseFloat(sgdAmount) * rate).toFixed(2));
    } else if (myrAmount) {
      setSgdAmount((parseFloat(myrAmount) / rate).toFixed(2));
    }
  };

  // Add the Weekly Forecast section back
  const WeeklyForecast = () => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
      {['CIMB', 'WISE'].map(platform => {
        const predictions = platform === 'CIMB' ? cimbPredictions : wisePredictions;
        if (!predictions.length) return null;

        const currentRate = processedData[processedData.length - 1]?.[`${platform}Rate`];
        const weekPrediction = predictions[predictions.length - 1];
        const weeklyChange = ((weekPrediction.predictedRate - currentRate) / currentRate) * 100;

        return (
          <Card key={platform} variant="outline" p={4}>
            <VStack align="start" spacing={3} w="100%">
              <HStack justify="space-between" w="100%">
                <HStack>
                  <Image 
                    src={platform === 'CIMB' ? CIMBLogo : WiseLogo} 
                    alt={platform} 
                    boxSize="24px" 
                  />
                  <Text fontWeight="medium">{platform} 7-Day Forecast</Text>
                </HStack>
                <Badge 
                  colorScheme={weekPrediction.confidence > 80 ? "green" : "yellow"}
                >
                  {weekPrediction.confidence.toFixed(0)}% confidence
                </Badge>
              </HStack>

              <SimpleGrid columns={2} spacing={4} w="100%">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.500">Week-End Rate</Text>
                  <Text fontWeight="medium">{weekPrediction.predictedRate.toFixed(4)}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.500">Expected Change</Text>
                  <Badge 
                    colorScheme={weeklyChange >= 0 ? "green" : "red"}
                    variant="subtle"
                  >
                    {weeklyChange >= 0 ? "↑" : "↓"} {Math.abs(weeklyChange).toFixed(2)}%
                  </Badge>
                </VStack>
              </SimpleGrid>
            </VStack>
          </Card>
        );
      })}
    </SimpleGrid>
  );

  // Inside the Market Forecast Card section
  const forecastBorderColor = useColorModeValue('gray.100', 'gray.700');

  // Move color mode values outside
  const hourlyBreakdownBg = useColorModeValue('gray.50', 'gray.700');

  // Move color mode values outside the map function
  const insightBgColor = useColorModeValue('white', 'gray.800');
  const insightBorderColor = useColorModeValue('gray.200', 'gray.700');
  const insightCardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <ChakraProvider theme={theme}>
      <MetaTags latestRate={latestRate} />
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        {/* Header */}
        <Box 
          bg={useColorModeValue('white', 'gray.800')} 
          borderBottom="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.700')} 
          position="sticky"
          top="0" 
          zIndex="sticky"
          shadow="sm"
        >
          <Container maxW="container.xl" py={3}>
            <HStack justify="space-between" spacing={4}>
              {/* Logo and Title */}
              <HStack spacing={4}>
                <ConversionSymbol boxSize="32px" />
                <VStack align="start" spacing={0}>
                  <Heading size="md">Exactify</Heading>
                  <Text fontSize="xs" color="gray.500">
                    Last updated: {timeAgo(latestRate?.CIMB?.timestamp)}
                  </Text>
                </VStack>
              </HStack>

              {/* Navigation Items */}
              <HStack spacing={4}>
                {/* Last Updated Indicator */}
                <Tooltip 
                  label={`Last updated ${timeAgo(latestRate?.CIMB?.timestamp)} ago`} 
                  placement="bottom"
                >
                  <HStack 
                    spacing={2} 
                  color="gray.500"
                    fontSize="sm"
                    display={{ base: "none", md: "flex" }}
                  >
                    <Icon as={FiClock} />
                    <Text>Updated {timeAgo(latestRate?.CIMB?.timestamp)}</Text>
              </HStack>
                </Tooltip>

                {/* Refresh Button */}
                <Tooltip label="Refresh rates" placement="bottom">
                  <IconButton
                    icon={<Icon as={FiRefreshCw} />}
                    variant="ghost"
                    size="sm"
                    onClick={fetchLatestRates}
                    isLoading={isLoading}
                    aria-label="Refresh rates"
                  />
                </Tooltip>

                {/* Branch Locator */}
                <Tooltip label="Find exchange locations" placement="bottom">
                  <IconButton
                    icon={<Icon as={FiMapPin} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/locator', '_blank')}
                    aria-label="Branch locator"
                  />
                </Tooltip>

                {/* Theme Toggle */}
                <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} placement="bottom">
                  <IconButton
                    icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    size="sm"
                    aria-label="Toggle color mode"
                  />
                </Tooltip>

                {/* Mobile Menu */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMenu />}
                    variant="ghost"
                    size="sm"
                    display={{ base: "flex", md: "none" }}
                    aria-label="Open menu"
                  />
                  <MenuList>
                    <MenuItem icon={<FiClock />}>
                      Updated {timeAgo(latestRate?.CIMB?.timestamp)}
                    </MenuItem>
                    <MenuItem icon={<FiRefreshCw />} onClick={fetchLatestRates}>
                      Refresh Rates
                    </MenuItem>
                    <MenuItem icon={<FiMapPin />} onClick={() => window.open('/locator', '_blank')}>
                      Branch Locator
                    </MenuItem>
                    <Divider />
                    <MenuItem icon={<FiGithub />} onClick={() => window.open('https://github.com/likweitan/exactify', '_blank')}>
                      GitHub
                    </MenuItem>
                    <MenuItem icon={<FiInfo />} onClick={() => window.open('/about', '_blank')}>
                      About
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>
          </Container>
        </Box>

        {/* Main Content */}
        <Container 
          maxW={{ 
            base: "container.xl", 
            "2xl": "1920px" // Increased max width for larger screens
          }} 
          py={8} 
          px={{ base: 4, lg: 24, "xl": 48 }}
        >
          <SimpleGrid 
            columns={{ base: 1, "lg": 5 }} // Change to 3 columns for the ratio
            spacing={{ base: 4, "lg": 8 }}
            w="100%"
          >
            {/* Left Column - Current Rates & Market Forecast */}
            <GridItem 
              colSpan={{ base: 1, lg: 2 }} // Takes 1 column
              w="100%"
            >
              <VStack spacing={4} w="100%">
                {/* Current Rates Card */}
                <Card w="100%" variant="outline" overflow="hidden">
                  <CardBody p={0}>
                    <VStack spacing={0} align="stretch">
                      {/* Header */}
                      <Box p={2} borderBottom="1px" borderColor={useColorModeValue('gray.100', 'gray.700')}>
                        <HStack justify="space-between">
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="medium">Current Rates</Text>
                            <Badge colorScheme="green" variant="subtle" fontSize="xs">Live</Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Updated {timeAgo(latestRate?.CIMB?.timestamp)} ago
                          </Text>
                        </HStack>
                      </Box>

                      {/* Rate Cards - More compact */}
                      {Object.entries(latestRate || {})
                        .filter(([platform]) => platform !== 'PANDAREMIT') // Filter out PANDAREMIT
                        .map(([platform, data], index, filteredArray) => (
                          <Box
                            key={platform}
                            onClick={() => handleRateCardClick(platform, data.exchange_rate)}
                            cursor="pointer"
                            borderBottom={index !== filteredArray.length - 1 ? "1px" : "0"}
                            borderColor={rateCardBorderColor}
                            bg={platform === conversionPlatform ? rateCardSelectedBg : 'transparent'}
                            transition="all 0.2s"
                            _hover={{ bg: rateCardHoverBg }}
                          >
                            <Box py={1.5} px={2}>
                              <HStack justify="space-between" align="center">
                                <HStack spacing={2}>
                                  <Image 
                                    src={
                                      platform === 'CIMB' ? CIMBLogo : 
                                      platform === 'WISE' ? WiseLogo :
                                      platform === 'PANDAREMIT' ? PandaRemitLogo :
                                      WiseLogo // default fallback
                                    } 
                                    alt={platform} 
                                    boxSize="16px" 
                                  />
                                  <Text fontSize="sm" fontWeight="medium">{platform}</Text>
                                </HStack>
                                <HStack spacing={3} align="center">
                                  <StatChange value={data.change24h} />
                                  <HStack spacing={1}>
                                    <Text fontSize="md" fontWeight="bold">{data.exchange_rate.toFixed(4)}</Text>
                                    {platform === conversionPlatform && (
                                      <Icon 
                                        as={StarIcon} 
                                        color={platform === 'CIMB' ? 'red.500' : 'blue.500'} 
                                        boxSize={2.5}
                                      />
                                    )}
                                  </HStack>
                                </HStack>
                              </HStack>
                            </Box>
                          </Box>
                        ))}

                      {/* Quick Convert Section - More compact */}
                      <Box 
                        p={2} 
                        borderTop="1px" 
                        borderColor={useColorModeValue('gray.100', 'gray.700')}
                        bg={useColorModeValue('gray.50', 'gray.800')}
                      >
                        <VStack spacing={2}>
                          {/* SGD Input */}
                        <FormControl>
                            <InputGroup size="sm">
                              <InputLeftAddon p={1.5}>
                                <HStack spacing={1}>
                                  <Image src={SGFlag} alt="SGD" boxSize="14px" />
                                  <Text fontSize="xs" fontWeight="medium">SGD</Text>
                                </HStack>
                            </InputLeftAddon>
                            <Input
                              type="number"
                              value={sgdAmount}
                              onChange={(e) => handleSgdChange(e.target.value)}
                                placeholder="0.00"
                                textAlign="right"
                                bg={useColorModeValue('white', 'gray.700')}
                                fontSize="sm"
                            />
                          </InputGroup>
                        </FormControl>

                          {/* Exchange Icon */}
                          <Icon 
                            as={FiRepeat} 
                            boxSize={3} 
                            color="gray.400"
                            transform="rotate(90deg)"
                          />

                          {/* MYR Input */}
                        <FormControl>
                            <InputGroup size="sm">
                              <InputLeftAddon p={1.5}>
                                <HStack spacing={1}>
                                  <Image src={MYFlag} alt="MYR" boxSize="14px" />
                                  <Text fontSize="xs" fontWeight="medium">MYR</Text>
                                </HStack>
                            </InputLeftAddon>
                            <Input
                              type="number"
                              value={myrAmount}
                              onChange={(e) => handleMyrChange(e.target.value)}
                                placeholder="0.00"
                                textAlign="right"
                                bg={useColorModeValue('white', 'gray.700')}
                                fontSize="sm"
                            />
                          </InputGroup>
                        </FormControl>

                          <Text fontSize="xs" color="gray.500" alignSelf="end">
                            Using {conversionPlatform}'s rate
                          </Text>
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Market Forecast Card */}
                <Card w="100%" variant="outline">
                  <CardBody>
                    <VStack spacing={6}>
                      <HStack w="100%" justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Heading size="sm">Market Forecast</Heading>
                          <Text fontSize="sm" color="gray.500">Short-term predictions</Text>
                        </VStack>
                        <Badge colorScheme="purple" variant="subtle">AI Powered</Badge>
                      </HStack>

                      {/* Short-term Forecast (3 hours) */}
                      <Box w="100%">
                        <SimpleGrid columns={1} spacing={0}>
                          {['CIMB', 'WISE', 'PANDAREMIT'].map(platform => {
                            const predictions = platform === 'CIMB' ? cimbPredictions : wisePredictions;
                            if (!predictions.length) return null;

                            // Get next 3 hours predictions
                            const shortTermPredictions = predictions
                              .filter(pred => {
                                const hours = (new Date(pred.date) - new Date()) / (1000 * 60 * 60);
                                return hours > 0 && hours <= 3;
                              })
                              .sort((a, b) => new Date(a.date) - new Date(b.date));

                            if (!shortTermPredictions.length) return null;

                            // Use latestRate instead of processedData
                            const currentRate = latestRate?.[platform]?.exchange_rate;
                            if (!currentRate) return null;

                            const latestPrediction = shortTermPredictions[0];
                            const predictedChange = ((latestPrediction.predictedRate - currentRate) / currentRate) * 100;

                            return (
                              <Box
                                key={platform}
                                borderBottom="1px"
                                borderColor={forecastBorderColor}
                                py={2}
                                px={2}
                              >
                                <VStack align="stretch" spacing={2}>
                                  {/* Platform Header */}
                                  <HStack justify="space-between">
                                    <HStack spacing={2}>
                                      <Image 
                                        src={
                                          platform === 'CIMB' ? CIMBLogo : 
                                          platform === 'WISE' ? WiseLogo :
                                          platform === 'PANDAREMIT' ? PandaRemitLogo :
                                          WiseLogo
                                        } 
                                        alt={platform} 
                                        boxSize="16px" 
                                      />
                                      <Text fontSize="sm" fontWeight="medium">{platform}</Text>
                                    </HStack>
                                    <Badge 
                                      colorScheme={latestPrediction.confidence > 85 ? "green" : "yellow"}
                                      fontSize="xs"
                                    >
                                      {latestPrediction.confidence.toFixed(0)}% confidence
                                    </Badge>
                                  </HStack>

                                  {/* Current vs Predicted */}
                                  <SimpleGrid columns={3} spacing={2}>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="xs" color="gray.500">Current</Text>
                                      <Text fontSize="sm">{currentRate.toFixed(4)}</Text>
                                    </VStack>
                                    <VStack align="center" spacing={0}>
                                      <Text fontSize="xs" color="gray.500">Expected</Text>
                                      <Text 
                                        fontSize="sm" 
                                        fontWeight="bold"
                                        color={predictedChange >= 0 ? "green.500" : "red.500"}
                                      >
                                        {latestPrediction.predictedRate.toFixed(4)}
                                      </Text>
                                    </VStack>
                                    <VStack align="end" spacing={0}>
                                      <Text fontSize="xs" color="gray.500">Change</Text>
                                      <Badge 
                                        colorScheme={predictedChange >= 0 ? "green" : "red"}
                                        variant="subtle"
                                        fontSize="xs"
                                      >
                                        {predictedChange >= 0 ? "+" : ""}{predictedChange.toFixed(2)}%
                                      </Badge>
                                    </VStack>
                                  </SimpleGrid>

                                  {/* Hourly Breakdown */}
                                  <Accordion allowToggle>
                                    <AccordionItem border="none">
                                      <AccordionButton 
                                        px={0} 
                                        _hover={{ bg: 'transparent' }}
                                      >
                                        <HStack spacing={2}>
                                          <Text fontSize="xs" color="gray.500">Hourly Breakdown</Text>
                                          <AccordionIcon color="gray.500" />
                                        </HStack>
                                      </AccordionButton>
                                      <AccordionPanel pb={2} px={0}>
                                        <SimpleGrid columns={3} spacing={2}>
                                          {shortTermPredictions.map((pred, index) => (
                                            <Box 
                                              key={index}
                                              p={1.5}
                                              bg={hourlyBreakdownBg}
                                              borderRadius="md"
                                            >
                                              <VStack spacing={0}>
                                                <Text fontSize="xs" color="gray.500">
                                                  {new Date(pred.date).getHours()}:00
                                                </Text>
                                                <Text fontSize="sm" fontWeight="medium">
                                                  {pred.predictedRate.toFixed(4)}
                                                </Text>
                                                <Badge 
                                                  colorScheme={pred.confidence > 85 ? "green" : "yellow"}
                                                  variant="subtle"
                                                  fontSize="xs"
                                                >
                                                  {pred.confidence.toFixed(0)}%
                                                </Badge>
                                              </VStack>
                                            </Box>
                                          ))}
                                        </SimpleGrid>
                                      </AccordionPanel>
                                    </AccordionItem>
                                  </Accordion>

                                  {/* Insight Text */}
                                  <Text fontSize="xs" color="gray.500">
                                    {predictedChange >= 0 
                                      ? `${platform} rate is expected to rise by ${predictedChange.toFixed(2)}% in the next 3 hours` 
                                      : `${platform} rate is expected to fall by ${Math.abs(predictedChange).toFixed(2)}% in the next 3 hours`
                                    }
                                    {latestPrediction.confidence > 85 
                                      ? " with high confidence" 
                                      : latestPrediction.confidence > 70 
                                      ? " with moderate confidence"
                                      : " with low confidence"
                                    }.
                      </Text>
                    </VStack>
                              </Box>
                            );
                          })}
              </SimpleGrid>
                      </Box>

                      {/* Weekly Forecast */}
                      {/* <Box w="100%">
                        <Text fontWeight="medium" mb={3}>7-Day Outlook</Text>
                        <SimpleGrid columns={1} spacing={3} w="100%">
                          <WeeklyForecast />
                        </SimpleGrid>
                      </Box> */}

                      {/* <Text fontSize="xs" color="gray.500" textAlign="center">
                        Short-term predictions are updated hourly. Predictions combine multiple statistical models and historical patterns.
                      </Text> */}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>

            {/* Right Column - Exchange Rate Trends */}
            <GridItem 
              colSpan={{ base: 1, lg: 3 }} // Takes 2 columns
              w="100%"
            >
              <VStack spacing={4} w="100%">
                {/* Main Chart Card */}
                <Card w="100%">
                        <CardBody>
                    <VStack spacing={{ base: 4, lg: 6 }}>
                      {/* Chart Header */}
                      <Stack 
                        w="100%" 
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "start", sm: "center" }}
                        spacing={4}
                      >
                        <VStack align="start" spacing={0}>
                          <Heading size="sm">Exchange Rate Trends</Heading>
                          <Text fontSize="sm" color="gray.500">Historical performance and analysis</Text>
                        </VStack>
                        <ButtonGroup 
                          size="sm" 
                          isAttached 
                          variant="outline"
                          overflowX="auto"
                          maxW="100%"
                        >
                          {TIME_FRAME_OPTIONS.map(option => (
                            <Button
                              key={option.value}
                              onClick={() => setTimeFrame(option.value)}
                              colorScheme={timeFrame === option.value ? "teal" : "gray"}
                              variant={timeFrame === option.value ? "solid" : "outline"}
                              minW="auto"
                              px={2}
                              fontSize={{ base: "xs", md: "sm" }}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </ButtonGroup>
                      </Stack>

                      {/* Chart Component */}
                      <Box h={{ base: "300px", md: "400px" }} w="100%">
                        <ResponsiveContainer>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
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
                              interval={timeFrame === "48h" ? 6 : timeFrame === "1m" ? Math.floor(chartData.length / 6) : 1}
                                  angle={0}
                                  tick={{ fontSize: 12, fill: '#718096' }}
                                  axisLine={{ stroke: '#E2E8F0' }}
                                  tickLine={{ stroke: '#E2E8F0' }}
                                />
                                <YAxis 
                              domain={['auto', 'auto']} 
                              tickFormatter={(value) => value.toFixed(4)}
                              hide
                                />
                                <Tooltip 
                              content={(props) => (
                                <ChartTooltip 
                                  {...props} 
                                  timeFrame={timeFrame} 
                                  chartData={chartData}
                                  tooltipBgColor={bgColor}
                                  tooltipBorderColor={borderColor}
                                />
                              )}
                                  cursor={{ stroke: '#718096', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="CIMBRate"
                                  name="CIMB"
                              stroke="#ED1C24"
                                  strokeWidth={2}
                              dot={false} // Remove dots
                              connectNulls
                                />
                                <Line
                                  type="monotone"
                                  dataKey="WISERate"
                                  name="WISE"
                              stroke="#00B9FF"
                                  strokeWidth={2}
                              dot={false} // Remove dots
                              connectNulls
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>

                      {/* Dynamic Insights */}
                      <Box w="100%" mt={4}>
                        <SimpleGrid 
                          columns={{ base: 1, md: 3 }} 
                          spacing={4}
                          bg={insightBgColor}
                          p={4}
                          borderRadius="lg"
                          border="1px"
                          borderColor={insightBorderColor}
                        >
                          {generateInsights(chartData, timeFrame).map((insight, index) => (
                            <Box
                              key={index}
                              p={3}
                              borderRadius="md"
                              bg={insightCardBg}
                            >
                              <HStack spacing={3} align="start">
                                <Icon 
                                  as={insight.icon} 
                                  boxSize={5} 
                                  color={`${insight.color}.500`}
                                  mt={0.5}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {insight.title}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {insight.text}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>

                      {/* Stats Grid */}
                      <Box w="100%" overflowX="auto" borderRadius="lg" border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        {/* ... existing stats table content ... */}
                            </Box>
                      </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </SimpleGrid>
          </Container>

        {/* Footer */}
        <Box mt="auto" bg={useColorModeValue('white', 'gray.800')} borderTop="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} py={6}>
          <Container 
            maxW={{ 
              base: "container.xl", 
              "2xl": "1920px" 
            }}
          >
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
