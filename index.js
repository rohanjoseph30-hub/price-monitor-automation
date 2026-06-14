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
const SCRAPING_DOG_API_KEY = process.env.SCRAPING_DOG_API_KEY;

// 2. The Automation Logic
async function checkPrice() {
    try {
        console.log(`[${new Date().toISOString()}] Starting price check...`);
        
        // Validate required environment variables
        if (!SCRAPING_DOG_API_KEY) {
            throw new Error("SCRAPING_DOG_API_KEY environment variable is not set");
        }
        if (!COMPETITOR_URL) {
            throw new Error("COMPETITOR_URL environment variable is not set");
        }
        
        // Fetch the HTML of the competitor page
        const fullUrl = PROXY_URL + SCRAPING_DOG_API_KEY + '&url=' + COMPETITOR_URL;
        console.log(`[${new Date().toISOString()}] Fetching URL: ${COMPETITOR_URL}`);
        
        const response = await axios.get(fullUrl, {
            timeout: 10000 // 10 second timeout
        });
        console.log(`[${new Date().toISOString()}] Successfully fetched page`);
        
        const $ = cheerio.load(response.data);

        // Find the price element (this depends on the website's HTML)
        const priceText = $('.price-tag').text().replace(/[^0-9.]/g, "");
        const currentPrice = parseFloat(priceText);

        if (isNaN(currentPrice)) {
            console.error(`[${new Date().toISOString()}] ERROR: Could not parse price from page. Check selector: .price-tag`);
            console.error(`[${new Date().toISOString()}] Raw price text: "${$('.price-tag').text()}"`);
            return;
        }

        console.log(`[${new Date().toISOString()}] Current Market Price: ${currentPrice} AED`);

        // 3. The Decision Engine
        if (currentPrice < TARGET_PRICE) {
            console.log(`[${new Date().toISOString()}] Price ${currentPrice} is below target ${TARGET_PRICE}. Sending alert...`);
            await sendAlert(currentPrice);
        } else {
            console.log(`[${new Date().toISOString()}] Price ${currentPrice} is above target ${TARGET_PRICE}. No alert sent.`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Monitoring failed`);
        console.error(`[${new Date().toISOString()}] Error message: ${error.message}`);
        console.error(`[${new Date().toISOString()}] Error details:`, error);
        // Don't exit here - let the job complete gracefully
    }
}

// 4. The Notification (Earn while you sleep)
async function sendAlert(price) {
    try {
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            console.warn(`[${new Date().toISOString()}] WARNING: Twilio credentials not set. Skipping WhatsApp alert.`);
            console.warn(`[${new Date().toISOString()}] TWILIO_ACCOUNT_SID set: ${!!TWILIO_ACCOUNT_SID}`);
            console.warn(`[${new Date().toISOString()}] TWILIO_AUTH_TOKEN set: ${!!TWILIO_AUTH_TOKEN}`);
            console.warn(`[${new Date().toISOString()}] TWILIO_WHATSAPP_FROM set: ${!!TWILIO_WHATSAPP_FROM}`);
            console.warn(`[${new Date().toISOString()}] TWILIO_WHATSAPP_TO set: ${!!TWILIO_WHATSAPP_TO}`);
            return;
        }

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        
        console.log(`[${new Date().toISOString()}] Sending WhatsApp alert...`);
        await client.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to: TWILIO_WHATSAPP_TO,
            body: `🚨 ALERT: Competitor price dropped to ${price} AED! Adjust your rates now.`
        });
        console.log(`[${new Date().toISOString()}] Alert sent successfully.`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: Failed to send alert`);
        console.error(`[${new Date().toISOString()}] Error message: ${error.message}`);
        console.error(`[${new Date().toISOString()}] Error details:`, error);
    }
}

// Run the check
checkPrice().then(() => {
    console.log(`[${new Date().toISOString()}] Price check completed successfully.`);
    process.exit(0);
}).catch((error) => {
    console.error(`[${new Date().toISOString()}] FATAL ERROR: Unexpected error in main flow`);
    console.error(`[${new Date().toISOString()}] Error:`, error);
    process.exit(1);
});
