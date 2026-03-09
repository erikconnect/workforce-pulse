// Test all ArcGIS layers to verify they work

const layers = [
  {
    name: "911 Calls",
    url: "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/911_Calls_Data/FeatureServer/0",
  },
  {
    name: "Stations (Layer 3)",
    url: "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer/3",
  },
  {
    name: "Permits",
    url: "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Building_Permit_viewlayer/FeatureServer/0",
  },
  {
    name: "Education",
    url: "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Education_Facility/FeatureServer/0",
  },
];

async function testLayer(name, url) {
  try {
    const queryUrl = `${url}/query?where=1=1&outFields=*&returnGeometry=true&resultRecordCount=1&f=geojson`;
    const res = await fetch(queryUrl);
    
    if (!res.ok) {
      const text = await res.text();
      console.log(`❌ ${name}: Status ${res.status} - ${text.slice(0, 100)}`);
      return false;
    }
    
    const data = await res.json();
    if (data.error) {
      console.log(`❌ ${name}: ${data.error.message}`);
      return false;
    }
    
    console.log(`✅ ${name}: ${data.features?.length || 0} features`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    return false;
  }
}

async function testAll() {
  console.log("🔍 Testing all ArcGIS layers...\n");
  
  for (const layer of layers) {
    await testLayer(layer.name, layer.url);
  }
}

testAll();
