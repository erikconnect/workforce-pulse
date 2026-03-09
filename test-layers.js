// Check what layers are available

const BASE_URL = "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer";

async function checkLayers() {
  console.log("🔍 Checking available layers...\n");

  try {
    const res = await fetch(BASE_URL + "?f=json");
    const data = await res.json();
    
    console.log("Full response:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.layers) {
      console.log("\n📊 Available layers:");
      data.layers.forEach(layer => {
        console.log(`  - Layer ${layer.id}: ${layer.name}`);
      });
    }
    
    if (data.tables) {
      console.log("\n📊 Available tables:");
      data.tables.forEach(table => {
        console.log(`  - Table ${table.id}: ${table.name}`);
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLayers();
