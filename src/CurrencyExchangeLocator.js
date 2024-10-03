import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Flex, Button, useToast } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default location (New York City) in case geolocation fails
const DEFAULT_LOCATION = [1.4828870599458481, 103.76966599988995];

const CurrencyExchangeLocator = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [exchangeLocations, setExchangeLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          fetchExchangeLocations(location[0], location[1]);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast({
            title: "Location not found",
            description: "Using default location. You can try again or search manually.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          setUserLocation(DEFAULT_LOCATION);
          fetchExchangeLocations(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1]);
          setIsLoading(false);
        },
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Using default location.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUserLocation(DEFAULT_LOCATION);
      fetchExchangeLocations(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1]);
      setIsLoading(false);
    }
  };

  const fetchExchangeLocations = async (lat, lon) => {
    const query = `
      [out:json];
      (
        node["currency_exchange"="yes"](around:5000,${lat},${lon});
        way["currency_exchange"="yes"](around:5000,${lat},${lon});
        relation["currency_exchange"="yes"](around:5000,${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      setExchangeLocations(data.elements);
    } catch (error) {
      console.error("Error fetching exchange locations:", error);
      toast({
        title: "Error fetching locations",
        description: "Unable to fetch nearby exchange locations. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const customIcon = new Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  // Component to update map view when userLocation changes
  const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, 13);
    return null;
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Box as="header" bg="blue.600" color="white" p={4}>
        <Heading as="h1" size="xl">Currency Exchange Partner Locator</Heading>
      </Box>
      <Flex flex={1} overflow="hidden">
        <Box width="33%" p={4} overflowY="auto">
          <Heading as="h2" size="lg" mb={4}>Nearby Exchange Locations</Heading>
          <Button onClick={getUserLocation} mb={4} isLoading={isLoading}>
            {isLoading ? "Getting Location..." : "Refresh Location"}
          </Button>
          <VStack spacing={4} align="stretch">
            {exchangeLocations.map((location) => (
              <Box key={location.id} p={4} bg="gray.100" borderRadius="md">
                <Heading as="h3" size="md">{location.tags.name || 'Unnamed Location'}</Heading>
                <Text>{location.tags.address || 'Address not available'}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
        <Box width="67%" position="relative">
          {userLocation && (
            <Box position="absolute" top={0} right={0} bottom={0} left={0}>
              <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={userLocation} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={userLocation} icon={customIcon}>
                  <Popup>You are here</Popup>
                </Marker>
                {exchangeLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.lat || location.center.lat, location.lon || location.center.lon]}
                    icon={customIcon}
                  >
                    <Popup>
                      <Heading as="h3" size="sm">{location.tags.name || 'Unnamed Location'}</Heading>
                      <Text>{location.tags.address || 'Address not available'}</Text>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default CurrencyExchangeLocator;