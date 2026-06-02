
async function test() {
  const query = `[out:json];node["amenity"="charging_station"](around:5000,37.7749,-122.4194);out 5;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });
  const data = await res.json();
  console.log(JSON.stringify(data.elements, null, 2));
}
test();
