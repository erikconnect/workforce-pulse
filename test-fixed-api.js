// Test the fixed API endpoint

async function testFixedAPI() {
  console.log("🔍 Testing fixed API endpoint...\n");
  
  try {
    console.log("Testing: http://localhost:3000/api/arcgis/stations");
    const res = await fetch("http://localhost:3000/api/arcgis/stations");
    const json = await res.json();
    
    console.log(`Status: ${res.status}`);
    
    if (res.ok) {
      console.log(`✅ Success!`);
      console.log(`   Features returned: ${json.features?.length || 0}`);
      console.log(`   Collection type: ${json.type}`);
      if (json.features && json.features.length > 0) {
        console.log(`   First feature:`, JSON.stringify(json.features[0], null, 2).slice(0, 400));
      }
    } else {
      console.log(`❌ Error:`);
      console.log(JSON.stringify(json, null, 2));
    }
  } catch (err) {
    console.error("❌ Connection error:", err.message);
    console.error("Make sure your Next.js dev server is running: npm run dev");
  }
}

testFixedAPI();
