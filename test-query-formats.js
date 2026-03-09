// More detailed test to find the correct query format

const BASE_URL = "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer/0";

async function testQueries() {
  console.log("🔍 Testing different query formats...\n");

  const queryTests = [
    {
      name: "Basic info (no query)",
      url: BASE_URL + "?f=json",
    },
    {
      name: "Simple query - JSON",
      url: BASE_URL + "/query?where=1=1&outFields=*&f=json",
    },
    {
      name: "Query with pagination - JSON",
      url: BASE_URL + "/query?where=1=1&outFields=*&resultRecordCount=10&resultOffset=0&f=json",
    },
    {
      name: "Query with geometry - JSON",
      url: BASE_URL + "/query?where=1=1&outFields=*&returnGeometry=true&resultRecordCount=10&f=json",
    },
    {
      name: "Query with geometry + pagination - JSON",
      url: BASE_URL + "/query?where=1=1&outFields=*&returnGeometry=true&resultRecordCount=10&resultOffset=0&f=json",
    },
    {
      name: "Query - GeoJSON (no geometry)",
      url: BASE_URL + "/query?where=1=1&outFields=*&resultRecordCount=10&f=geojson",
    },
    {
      name: "Query - GeoJSON (with geometry, explicit encoding)",
      url: BASE_URL + "/query?where=1%3D1&outFields=*&returnGeometry=true&resultRecordCount=10&f=geojson",
    },
  ];

  for (const test of queryTests) {
    try {
      console.log(`📝 ${test.name}`);
      console.log(`   URL: ${test.url.slice(0, 120)}...`);
      const res = await fetch(test.url);
      const data = await res.json();
      
      if (res.ok) {
        console.log(`   ✅ Status: ${res.status}`);
        if (data.features) {
          console.log(`   📊 Found ${data.features.length} features`);
        } else if (data.layers) {
          console.log(`   📊 Service info: ${data.layers?.length || 0} layers`);
        } else {
          console.log(`   Response keys: ${Object.keys(data).join(", ")}`);
        }
      } else {
        console.log(`   ❌ Status: ${res.status}`);
        if (data.error) {
          console.log(`   Error: ${data.error.message}`);
        }
      }
      console.log();
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }
  }
}

testQueries();
