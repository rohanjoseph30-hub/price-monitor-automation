require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const twilio = require('twilio');

// 1. Configuration
const TARGET_PRICE = process.env.TARGET_PRICE || 500;
const PROXY_URL = process.env.PROXY_URL || 'https://api.scrapingdog.com/scrape?api_key=';
const COMPETITOR_URL = process.env.COMPETITOR_URL || 'https://competitor-site.com/product-page';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const TWILIO_WHATSAPP_TO = process.env.TWILIO_WHATSAPP_TO;

// 2. The Automation Logic
async function checkPrice() {
    try {
        console.log(`[${new Date().toISOString()}] Starting price check...`);
        
        // Fetch the HTML of the competitor page
        const fullUrl = PROXY_URL + process.env.SCRAPING_DOG_API_KEY + '&url=' + COMPETITOR_URL;
        const response = await axios.get(fullUrl);
        const $ = cheerio.load(response.data);

        // Find the price element (this depends on the website's HTML)
        const priceText = $('.price-tag').text().replace(/[^0-9.]/g, "");
        const currentPrice = parseFloat(priceText);

        if (isNaN(currentPrice)) {
            console.error("Could not parse price from page. Check selector: .price-tag");
            return;
        }

        console.log(`Current Market Price: ${currentPrice} AED`);

        // 3. The Decision Engine
        if (currentPrice < TARGET_PRICE) {
            console.log(`Price ${currentPrice} is below target ${TARGET_PRICE}. Sending alert...`);
            await sendAlert(currentPrice);
        } else {
            console.log(`Price ${currentPrice} is above target ${TARGET_PRICE}. No alert sent.`);
        }
    } catch (error) {
        console.error("Monitoring failed:", error.message);
        process.exit(1);
    }
}

// 4. The Notification (Earn while you sleep)
async function sendAlert(price) {
    try {
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            console.warn("Twilio credentials not set. Skipping WhatsApp alert.");
            return;
        }

        const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        
        await client.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to: TWILIO_WHATSAPP_TO,
            body: `🚨 ALERT: Competitor price dropped to ${price} AED! Adjust your rates now.`
        });
        console.log("Alert sent successfully.");
    } catch (error) {
        console.error("Failed to send alert:", error.message);
    }
}

// Run the check
checkPrice();
