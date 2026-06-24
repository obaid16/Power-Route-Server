const axios = require('axios');

// List of public Overpass API mirrors to try sequentially for high availability
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

/**
 * Helper to calculate Haversine distance in kilometers
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper to classify OpenStreetMap tags into project types
 */
function getElementTypeLabel(tags) {
  if (tags.amenity === 'police') return 'Police Station';
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'Hospital';
  if (tags.tourism === 'hotel' || tags.tourism === 'hostel' || tags.tourism === 'motel' || tags.tourism === 'guest_house') return 'Hotel';
  if (tags.amenity === 'cafe' || tags.amenity === 'restaurant') return 'Cafe';
  if (tags.amenity === 'charging_station') return 'EV Charging Station';
  return 'Safe Haven';
}

/**
 * Sequentially query Overpass mirrors with timeout
 */
async function fetchFromOverpass(query) {
  let lastError = null;
  for (const mirror of MIRRORS) {
    try {
      console.log(`Querying Overpass mirror: ${mirror}`);
      const response = await axios({
        method: 'post',
        url: mirror,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PoweRouteSafetyService/1.0 (Mozilla/5.0)'
        },
        data: 'data=' + encodeURIComponent(query),
        timeout: 8000 // 8 seconds timeout per mirror
      });
      if (response.data && Array.isArray(response.data.elements)) {
        console.log(`Successfully fetched from ${mirror}`);
        return response.data;
      }
    } catch (err) {
      console.warn(`Failed to fetch from Overpass mirror ${mirror}:`, err.message);
      lastError = err;
    }
  }
  throw new Error(lastError ? `Overpass query failed on all mirrors: ${lastError.message}` : 'Overpass query failed');
}

// @desc    Get nearby safe places (hotels, police, hospitals, cafes, charging stations)
// @route   GET /api/safety/nearby-places
// @access  Public
exports.getNearbySafePlaces = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || 3000; // default 3km

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid lat and lng query parameters.'
      });
    }

    // Formulate Overpass Query using exact tag matches (highly optimized database index usage)
    const query = `[out:json][timeout:10];
(
  node["tourism"="hotel"](around:${radius}, ${userLat}, ${userLng});
  node["amenity"="police"](around:${radius}, ${userLat}, ${userLng});
  node["amenity"="hospital"](around:${radius}, ${userLat}, ${userLng});
  node["amenity"="cafe"](around:${radius}, ${userLat}, ${userLng});
  node["amenity"="restaurant"](around:${radius}, ${userLat}, ${userLng});
  node["amenity"="charging_station"](around:${radius}, ${userLat}, ${userLng});
);
out body 50;`;

    const data = await fetchFromOverpass(query);
    const elements = data.elements || [];

    // Map elements to unified schema
    const places = elements
      .map(element => {
        const tags = element.tags || {};
        
        // Skip places that don't have a name to ensure the quality of recommendations
        const name = tags.name || tags.brand || tags.operator || null;
        if (!name) return null;

        const latVal = element.lat || (element.center && element.center.lat);
        const lngVal = element.lon || (element.center && element.center.lon);
        if (!latVal || !lngVal) return null;

        const dist = getDistance(userLat, userLng, latVal, lngVal);
        const type = getElementTypeLabel(tags);

        // Styling and details based on type
        let color = 'bg-primary';
        let phone = 'Not Available';
        let status = 'Open';

        switch (type) {
          case 'Police Station':
            color = 'bg-emerald-500';
            phone = tags.phone || tags['contact:phone'] || '100';
            status = 'Open 24/7';
            break;
          case 'Hospital':
            color = 'bg-red-500';
            phone = tags.phone || tags['contact:phone'] || '102';
            status = 'Open 24/7';
            break;
          case 'Hotel':
            color = 'bg-blue-500';
            phone = tags.phone || tags['contact:phone'] || '+91 98765 00000';
            status = tags.opening_hours ? 'Open' : 'Open';
            break;
          case 'Cafe':
            color = 'bg-amber-500';
            phone = tags.phone || tags['contact:phone'] || '+91 98765 11111';
            status = tags.opening_hours || 'Open till 11 PM';
            break;
          case 'EV Charging Station':
            color = 'bg-primary';
            phone = tags.phone || tags['contact:phone'] || '1800-123-4567';
            status = tags.opening_hours || 'Open 24/7';
            break;
        }

        // Formulate readable address
        let address = tags['addr:street'] || '';
        if (tags['addr:housenumber']) {
          address = `${tags['addr:housenumber']} ${address}`.trim();
        }
        if (tags['addr:suburb']) {
          address = address ? `${address}, ${tags['addr:suburb']}` : tags['addr:suburb'];
        }
        if (tags['addr:city']) {
          address = address ? `${address}, ${tags['addr:city']}` : tags['addr:city'];
        }
        if (!address) {
          address = tags.highway || tags.place || 'Nearby Area';
        }

        return {
          name,
          type,
          lat: latVal,
          lng: lngVal,
          distanceVal: dist,
          distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
          status,
          color,
          phone,
          address
        };
      })
      .filter(Boolean);

    // Sort by distance (closest first)
    places.sort((a, b) => a.distanceVal - b.distanceVal);

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    console.error('Error fetching nearby safe places:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time nearby places. Please try again later.'
    });
  }
};
