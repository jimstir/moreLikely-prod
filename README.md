# moreLikely - Prediction Insights

A Next.js full-stack application integrating prediction markets (Kalshi & Polymarket), 0G Inference Network, and Gemini-curated market recommendations.

## Setup Instructions

If you are cloning this repository to run it locally, follow the steps below to get started:

### 1. Configuration & Mock Data (0G Inference Mode)
Before running the application, decide whether you want to run in **Mock Mode** or **Live Mode**. Open `morelikely.config.ts` in the root directory:

- **Mock Mode (`useMockData: true`)**: Bypasses all APIs, databases, and blockchain RPC calls. The app will launch instantly with static offline data. Recommended for UI/UX development.
- **Live Mode (`useMockData: false`)**: Connects to the live PostgreSQL database, queries the Polymarket/Kalshi APIs, and sends requests to the **0G Inference Network**. 
  - *0G Instructions:* If running in Live Mode, ensure your MetaMask wallet is connected to the 0G Mainnet (Chain ID: `0x4115`) to properly interact with the 0G Compute TS SDK for the AI Insights Agent.

### 2. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 3. Environment Variables
You need to set up your local environment variables. Create a `.env` file in the root directory (you can copy from a template if one exists) and fill in the following:

```env
# Database Connection String
DATABASE_URL="postgresql://user:password@localhost:5432/morelikely?schema=public"

# Third-party APIs
KALSHI_API_KEY="your_kalshi_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
FIRECRAWL_API_KEY="your_firecrawl_api_key_here"
```

*Note: You must have a PostgreSQL database running locally (or remotely) and provide the correct connection string in `DATABASE_URL`.*

### 4. Initialize the Database
Once your PostgreSQL database is running and your `.env` is configured, push the Prisma schema to create the tables:
```bash
npx prisma db push
```

### 5. Run the Development Server
Start the Next.js dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies Used
- Next.js (React)
- TailwindCSS v4
- Prisma (PostgreSQL)
- ethers.js v6 (MetaMask integration)
- Google GenAI (Gemini)
- 0G Compute TS SDK
- Firecrawl JS
