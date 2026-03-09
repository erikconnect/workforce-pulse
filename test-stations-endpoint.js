// Test script to diagnose the ARCGIS_STATIONS_URL issue

const STATIONS_URL = "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer";

async function testDirectURL() {
  console.log("🔍 Testing direct ArcGIS endpoint...\n");
  
  try {
    // Test 1: Direct endpoint
    console.log("1️⃣  Testing: " + STATIONS_URL);
    const res1 = await fetch(STATIONS_URL);
    const text1 = await res1.text();
    console.log(`   Status: ${res1.status}`);
    console.log(`   Response (first 300 chars): ${text1.slice(0, 300)}\n`);

    // Test 2: With /0 layer index
    const urlWithLayer = STATIONS_URL + "/0";
    console.log("2️⃣  Testing: " + urlWithLayer);
    const res2 = await fetch(urlWithLayer);
    const text2 = await res2.text();
    console.log(`   Status: ${res2.status}`);
    console.log(`   Response (first 300 chars): ${text2.slice(0, 300)}\n`);

    // Test 3: With query parameters (like the app does)
    const queryUrl = `${urlWithLayer}/query?where=1%3D1&outFields=*&returnGeometry=true&resultRecordCount=1000&resultOffset=0&f=geojson`;
    console.log("3️⃣  Testing with query params: " + queryUrl);
    const res3 = await fetch(queryUrl);
    const text3 = await res3.text();
    console.log(`   Status: ${res3.status}`);
    console.log(`   Response (first 500 chars): ${text3.slice(0, 500)}\n`);

    // Test 4: Try JSON response
    const jsonUrl = `${urlWithLayer}/query?where=1%3D1&outFields=*&returnGeometry=true&resultRecordCount=1000&resultOffset=0&f=json`;
    console.log("4️⃣  Testing with JSON format: " + jsonUrl);
    const res4 = await fetch(jsonUrl);
    const text4 = await res4.text();
    console.log(`   Status: ${res4.status}`);
    console.log(`   Response (first 500 chars): ${text4.slice(0, 500)}\n`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

async function testLocalAPI() {
  console.log("\n🔍 Testing local Next.js API endpoint...\n");
  
  try {
    console.log("Testing: http://localhost:3000/api/arcgis/stations");
    const res = await fetch("http://localhost:3000/api/arcgis/stations");
    const json = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(json, null, 2).slice(0, 500));
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("Make sure your Next.js dev server is running on port 3000");
  }
}

// Run tests
(async () => {
  await testDirectURL();
  await testLocalAPI();
})();
