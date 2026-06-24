async function test() {
  const lat = 19.0760; // Mumbai
  const lng = 72.8777; // Mumbai
  const query = `[out:json][timeout:25];
(
  node["tourism"~"hotel|hostel|motel|guest_house"](around:5000, ${lat}, ${lng});
  node["amenity"="police"](around:5000, ${lat}, ${lng});
  node["amenity"~"hospital|clinic"](around:5000, ${lat}, ${lng});
  node["amenity"~"cafe|restaurant"](around:5000, ${lat}, ${lng});
  node["amenity"="charging_station"](around:5000, ${lat}, ${lng});
);
out center 10;`;

  console.log("Sending query to Overpass...");
  const res = await fetch('https://overpass.kumi.systems/api/interpreter?data=' + encodeURIComponent(query), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error(`HTTP Error ${res.status}:`, text);
    return;
  }
  
  const data = await res.json();
  console.log(`Found ${data.elements?.length || 0} elements:`);
  console.log(JSON.stringify(data.elements.slice(0, 3), null, 2));
}
test();

