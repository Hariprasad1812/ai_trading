import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AlgoResearch backend is running",
  });
});
async function generateWithRetry(prompt, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              understanding: {
                type: "object",
                properties: {
                  instrument: { type: "string" },
                  timeframe: { type: "string" },
                  entry_condition: { type: "string" },
                  exit_condition: { type: "string" },
                  holding_period: { type: "string" },
                  filters: { type: "string" },
                  test_period: { type: "string" },
                  research_question: { type: "string" }
                },
                required: [
                  "instrument",
                  "timeframe",
                  "entry_condition",
                  "exit_condition",
                  "holding_period",
                  "filters",
                  "test_period",
                  "research_question"
                ]
              },
              missing_information: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    question: { type: "string" },
                    reason: { type: "string" }
                  },
                  required: [
                    "field",
                    "question",
                    "reason"
                  ]
                }
              },
              assumptions: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              ready_to_test: {
                type: "boolean"
              }
            },
            required: [
              "understanding",
              "missing_information",
              "assumptions",
              "ready_to_test"
            ]
          }
        }
      });
    } catch (error) {
      lastError = error;

      if (error?.status !== 503) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt);

        console.log(
          `Gemini temporarily unavailable. Retrying in ${delay / 1000}s...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }
  }

  throw lastError;
}
// Analyze research question
app.post("/api/research/analyze", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Research question is required.",
      });
    }

    const systemInstruction = `
You are an AI trading research assistant.

Your job is NOT to provide financial advice.

Your job is to convert a user's natural-language
market research question into a structured experiment
and identify important missing information.

Never silently invent important parameters.

Return JSON using exactly this structure:

{
  "understanding": {
    "instrument": "",
    "timeframe": "",
    "entry_condition": "",
    "exit_condition": "",
    "holding_period": "",
    "filters": "",
    "test_period": "",
    "research_question": ""
  },
  "missing_information": [
    {
      "field": "",
      "question": "",
      "reason": ""
    }
  ],
  "assumptions": [],
  "ready_to_test": false
}

Rules:

1. Extract only information explicitly supported by the user.
2. Identify important missing parameters.
3. Do not decide what words such as "sharp",
   "large", "strong", or "high volatility" mean.
4. Make ambiguity visible.
5. Important experiment parameters include:
   instrument,
   entry condition,
   exit condition,
   holding period,
   and test period.
6. Do not ask for information that the user already provided.
7. Set ready_to_test to true only when the experiment
   is sufficiently defined.
8. Clearly distinguish user-provided information
   from assumptions.
9. This is a research assistant, not a financial advisor.
`;

    const prompt = `
${systemInstruction}

User's research question:

"${question}"
`;

    const response = await generateWithRetry(prompt);
    const result = JSON.parse(response.text);

    res.json(result);

  } catch (error) {
    console.error("Gemini analysis error:", error);

    res.status(500).json({
      error: error?.message || "Failed to analyze the research question."
    });
  }
});

const PORT = process.env.PORT || 5000;
// ========================================
// BACKTEST: NIFTY 3% FALL STRATEGY
// ========================================

app.post("/api/research/test", async (req, res) => {
  try {
    const startDate = "2018-01-01";
    const endDate = "2025-12-31";

    const period1 = Math.floor(
      new Date(startDate).getTime() / 1000
    );

    const period2 = Math.floor(
      new Date("2026-01-02").getTime() / 1000
    );

    const yahooUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI` +
      `?period1=${period1}` +
      `&period2=${period2}` +
      `&interval=1d` +
      `&events=history`;

    const response = await fetch(yahooUrl);

    if (!response.ok) {
      throw new Error(
        `Market data request failed: ${response.status}`
      );
    }

    const data = await response.json();

    const result = data.chart?.result?.[0];

    if (!result) {
      throw new Error("No historical market data returned.");
    }

    const timestamps = result.timestamp;
    const quote = result.indicators?.quote?.[0];

    if (!timestamps || !quote) {
      throw new Error("Historical OHLC data is incomplete.");
    }

    const rows = timestamps
      .map((timestamp, index) => ({
        date: new Date(timestamp * 1000)
          .toISOString()
          .slice(0, 10),

        open: quote.open[index],
        close: quote.close[index],
      }))
      .filter(
        (row) =>
          row.open != null &&
          row.close != null
      );

    // --------------------------------
    // Strategy:
    //
    // Signal:
    // Today's close is at least 3%
    // below the close 3 trading days ago.
    //
    // Entry:
    // Next trading day's open.
    //
    // Exit:
    // Close after 5 trading days.
    // --------------------------------

const trades = [];

let lastExitIndex = -1;

for (let i = 3; i < rows.length - 6; i++) {

  // Only one position can be open at a time.
  if (i <= lastExitIndex) {
    continue;
  }

  const currentClose = rows[i].close;
  const threeDaysAgoClose = rows[i - 3].close;

  const fall =
    ((currentClose - threeDaysAgoClose) /
      threeDaysAgoClose) * 100;

  if (fall <= -3) {

    const entryIndex = i + 1;
    const exitIndex = entryIndex + 5;

    if (exitIndex >= rows.length) {
      continue;
    }

    const entryPrice = rows[entryIndex].open;
    const exitPrice = rows[exitIndex].close;

    const returnPct =
      ((exitPrice - entryPrice) /
        entryPrice) * 100;

    trades.push({
      signalDate: rows[i].date,
      entryDate: rows[entryIndex].date,
      exitDate: rows[exitIndex].date,
      fallPct: Number(fall.toFixed(2)),
      entryPrice: Number(entryPrice.toFixed(2)),
      exitPrice: Number(exitPrice.toFixed(2)),
      returnPct: Number(returnPct.toFixed(2)),
    });

    // Prevent another overlapping position.
    lastExitIndex = exitIndex;
  }
}
    // --------------------------------
    // Statistics
    // --------------------------------

    const returns = trades.map(
      (trade) => trade.returnPct
    );

    const totalTrades = returns.length;

    const winningTrades = returns.filter(
      (value) => value > 0
    ).length;

    const losingTrades = returns.filter(
      (value) => value <= 0
    ).length;

    const averageReturn =
      totalTrades > 0
        ? returns.reduce(
            (sum, value) => sum + value,
            0
          ) / totalTrades
        : 0;

    const sortedReturns = [...returns].sort(
      (a, b) => a - b
    );

    const medianReturn =
      totalTrades > 0
        ? totalTrades % 2 === 1
          ? sortedReturns[
              Math.floor(totalTrades / 2)
            ]
          : (
              sortedReturns[
                totalTrades / 2 - 1
              ] +
              sortedReturns[
                totalTrades / 2
              ]
            ) / 2
        : 0;

    const bestReturn =
      totalTrades > 0
        ? Math.max(...returns)
        : 0;

    const worstReturn =
      totalTrades > 0
        ? Math.min(...returns)
        : 0;

    const winRate =
      totalTrades > 0
        ? (winningTrades / totalTrades) * 100
        : 0;
        // ========================================
// COST / SLIPPAGE SENSITIVITY
// ========================================

const calculateNetReturns = (costPerTrade) => {
  return returns.map((value) => value - costPerTrade);
};

const netReturns001 = calculateNetReturns(0.10);
const netReturns002 = calculateNetReturns(0.20);

const averageNetReturn001 =
  totalTrades > 0
    ? netReturns001.reduce(
        (sum, value) => sum + value,
        0
      ) / totalTrades
    : 0;

const averageNetReturn002 =
  totalTrades > 0
    ? netReturns002.reduce(
        (sum, value) => sum + value,
        0
      ) / totalTrades
    : 0;

// ========================================
// BUY & HOLD BENCHMARK
// ========================================

const firstClose = rows[0]?.close;
const lastClose = rows[rows.length - 1]?.close;

const buyAndHoldReturn =
  firstClose && lastClose
    ? ((lastClose - firstClose) / firstClose) * 100
    : 0;

    res.json({
      strategy: {
        instrument: "NIFTY 50",
        signal:
          "Close falls at least 3% over the previous 3 trading days",
        entry:
          "Next trading day's open",
        exit:
          "Close after 5 trading days",
        period: "2018-01-01 to 2025-12-31",
        transactionCosts: "0%",
        slippage: "0%",
      },

      dataSource: {
        provider: "Yahoo Finance",
        symbol: "^NSEI",
        interval: "1d",
      },

     statistics: {
  totalTrades,
  winningTrades,
  losingTrades,

  winRate: Number(
    winRate.toFixed(2)
  ),

  averageReturn: Number(
    averageReturn.toFixed(2)
  ),

  medianReturn: Number(
    medianReturn.toFixed(2)
  ),

  bestReturn: Number(
    bestReturn.toFixed(2)
  ),

  worstReturn: Number(
    worstReturn.toFixed(2)
  ),

  buyAndHoldReturn: Number(
    buyAndHoldReturn.toFixed(2)
  ),

  sensitivity: {
    baseline: {
      assumedCost: "0.00%",
      averageReturn: Number(
        averageReturn.toFixed(2)
      ),
    },

    moderateFriction: {
      assumedCost: "0.10%",
      averageReturn: Number(
        averageNetReturn001.toFixed(2)
      ),
    },

    higherFriction: {
      assumedCost: "0.20%",
      averageReturn: Number(
        averageNetReturn002.toFixed(2)
      ),
    },
  },
},

      trades: trades.slice(0, 20),
    });

  } catch (error) {

    console.error(
      "Backtest error:",
      error
    );

    res.status(500).json({
      error:
        error?.message ||
        "Failed to run historical test.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});