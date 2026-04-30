# Price Monitor Automation 🚨

Automated competitor price monitoring system with WhatsApp alerts using GitHub Actions.

## 📋 Features

- ✅ Automated price checking on schedule
- ✅ WhatsApp alerts when prices drop below target
- ✅ Web scraping with proxy support
- ✅ GitHub Actions CI/CD integration
- ✅ Easy configuration via GitHub Secrets
- ✅ Manual trigger capability

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/rohanjoseph30-hub/price-monitor-automation.git
cd price-monitor-automation
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Configure GitHub Secrets

Go to your repository **Settings → Secrets and variables → Actions** and add:

| Secret Name | Value | Example |
|---|---|---|
| `TARGET_PRICE` | Price threshold (AED) | `500` |
| `COMPETITOR_URL` | Website to monitor | `https://example.com/product` |
| `SCRAPING_DOG_API_KEY` | Your Scraping Dog API key | `abc123...` |
| `PROXY_URL` | Proxy endpoint | `https://api.scrapingdog.com/scrape?api_key=` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `ACxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `xxxxxxx...` |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender | `whatsapp:+14155238886` |
| `TWILIO_WHATSAPP_TO` | Your WhatsApp number | `whatsapp:+971xxxxxxxxx` |

### 5. Test Locally (Optional)
```bash
node index.js
```

## ⚙️ Configuration

### Adjust Scheduling
Edit `.github/workflows/price-monitor.yml` to change the schedule:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour at minute 0
```

**Cron Format:** `minute hour day month day-of-week`

Common examples:
- `'0 * * * *'` - Every hour
- `'*/30 * * * *'` - Every 30 minutes
- `'0 9 * * *'` - Daily at 9 AM UTC
- `'0 0,12 * * *'` - Twice daily (12 AM & 12 PM UTC)

### Change Price Selector
If the website HTML structure is different, update the CSS selector in `index.js`:

```javascript
const priceText = $('.price-tag').text();  // Change '.price-tag' to match your target website
```

## 📊 How It Works

1. **Scheduled Trigger:** GitHub Actions runs the script on your specified schedule
2. **Price Fetch:** Script fetches competitor website via proxy
3. **Price Parsing:** Extracts price using CSS selector
4. **Comparison:** Compares with your target price
5. **Alert:** Sends WhatsApp notification if price is lower

## 🔐 Security Tips

- ✅ Never commit `.env` file (use `.env.example` as template)
- ✅ Store all credentials in GitHub Secrets, not in code
- ✅ Use environment variables in the workflow file
- ✅ Rotate API keys regularly

## 🛠️ Required APIs

### Scraping Dog (Web Scraping)
- Sign up: https://www.scrapingdog.com/
- Get API key from dashboard
- Free tier available

### Twilio (WhatsApp Notifications)
- Sign up: https://www.twilio.com/
- Create WhatsApp Sandbox
- Get Account SID & Auth Token
- Free trial credits available

## 📝 Troubleshooting

### Price not detected
- Check the website's HTML and update the CSS selector
- Ensure the proxy is working correctly

### WhatsApp alerts not sending
- Verify Twilio credentials in GitHub Secrets
- Confirm phone numbers are correctly formatted
- Check Twilio account has sufficient credits

### Workflow not running
- Go to **Actions** tab to see workflow status
- Check **Run workflow** dropdown to manually trigger
- Verify cron schedule is correct

## 📧 Support

For issues, check:
- GitHub Actions logs
- Twilio console for message status
- Scraping Dog API documentation

## 📄 License

MIT License - Feel free to use and modify!
