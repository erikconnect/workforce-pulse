// Check the actual error messages

const BASE_URL = "https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer/0";

async function checkErrors() {
  console.log("🔍 Checking actual error responses...\n");

  const tests = [
    {
      name: "Basic info",
      url: BASE_URL + "?f=json",
    },
    {
      name: "Simple query",
      url: BASE_URL + "/query?where=1=1&outFields=*&f=json",
    },
    {
      name: "Query with geometry",
      url: BASE_URL + "/query?where=1=1&outFields=*&returnGeometry=true&f=json",
    },
  ];

  for (const test of tests) {
    try {
      console.log(`📝 ${test.name}`);
      const res = await fetch(test.url);
      const data = await res.json();
      
      console.log(JSON.stringify(data, null, 2));
      console.log("---\n");
    } catch (err) {
      console.log(`Error: ${err.message}\n`);
    }
  }
}

checkErrors();
