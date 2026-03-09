// Test layer 3 (Fire+Police)

const BASE_URL = "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer/3";

async function testLayer3() {
  console.log("✅ Testing Layer 3 (Fire+Police)...\n");

  try {
    // Test info
    console.log("1️⃣  Layer info:");
    const infoRes = await fetch(BASE_URL + "?f=json");
    const infoData = await infoRes.json();
    console.log(`   Name: ${infoData.name}`);
    console.log(`   Geometry: ${infoData.geometryType}`);
    console.log();

    // Test query
    console.log("2️⃣  Querying data (limit 5):");
    const queryUrl = `${BASE_URL}/query?where=1=1&outFields=*&returnGeometry=true&resultRecordCount=5&f=geojson`;
    const queryRes = await fetch(queryUrl);
    
    if (!queryRes.ok) {
      console.log(`   ❌ Status: ${queryRes.status}`);
      const text = await queryRes.text();
      console.log(`   Response: ${text.slice(0, 200)}`);
    } else {
      const data = await queryRes.json();
      console.log(`   ✅ Got ${data.features?.length || 0} features`);
      if (data.features && data.features.length > 0) {
        console.log(`   Sample feature:`, JSON.stringify(data.features[0], null, 2).slice(0, 300));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testLayer3();
