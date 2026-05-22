const fs = require('fs');
const path = require('path');
const https = require('https');

// Custom .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      process.env[key] = value;
    }
  });
}

loadEnv();

const token = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;

if (!token) {
  console.error("Error: SQUARE_ACCESS_TOKEN not set in .env file.");
  process.exit(1);
}

console.log("Fetching catalog from Square API...");

const options = {
  hostname: 'connect.squareup.com',
  port: 443,
  path: '/v2/catalog/list',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Square-Version': '2024-05-15',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`Error: Received status code ${res.statusCode}`);
      console.error(data);
      process.exit(1);
    }

    try {
      const parsed = JSON.parse(data);
      const objects = parsed.objects || [];
      console.log(`Successfully fetched ${objects.length} catalog objects!`);

      // Filter and print items
      const items = objects.filter(obj => obj.type === 'ITEM');
      const categories = objects.filter(obj => obj.type === 'CATEGORY');
      
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = cat.category_data.name;
      });

      console.log(`Found ${items.length} items and ${categories.length} categories.`);

      const resultItems = items.map(item => {
        const itemData = item.item_data || {};
        const variations = itemData.variations || [];
        const prices = variations.map(v => {
          const money = v.item_variation_data.price_money || {};
          const amount = (money.amount ? Number(money.amount) / 100 : 0).toFixed(2);
          return {
            name: v.item_variation_data.name,
            price: amount,
            currency: money.currency || 'AUD'
          };
        });

        return {
          id: item.id,
          name: itemData.name,
          description: itemData.description || 'No description available.',
          category: categoryMap[itemData.category_id] || 'Uncategorized',
          prices: prices
        };
      });

      // Write report to scratch directory
      const scratchDir = path.join(__dirname, '..', 'scratch');
      if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
      }
      const reportPath = path.join(scratchDir, 'square_catalog.json');
      fs.writeFileSync(reportPath, JSON.stringify(resultItems, null, 2), 'utf8');
      
      console.log(`\nCatalog details successfully saved to /scratch/square_catalog.json!`);
      console.log("\nSummary of items found:");
      resultItems.forEach((it, idx) => {
        console.log(`- [${it.category}] ${it.name} (${it.prices.map(p => `$${p.price}`).join(', ')})`);
      });

    } catch (e) {
      console.error("Failed to parse response JSON:", e);
    }
  });
});

req.on('error', (e) => {
  console.error("Request error:", e);
});

req.end();
