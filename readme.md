# AlgoResearch — AI Trading Research Assistant

AlgoResearch is a thinking-first AI research assistant that helps users
turn ambiguous trading ideas into explicit, testable experiments.

The core workflow is:

**ASK → CLARIFY → DEFINE → TEST → LEARN**

---

## Problem

Trading questions are often ambiguous and underspecified.

For example:

> "Does buying NIFTY after a sharp fall work?"

The phrase **"sharp fall"** does not have a precise definition.

Instead of silently choosing a definition and producing a potentially
misleading result, AlgoResearch identifies the ambiguity and asks the
user to clarify the missing parameters before testing the idea.

---

## Core Workflow

### 1. ASK

The user enters a natural-language market research question.

Example:

> Does buying NIFTY after a sharp fall work?

---

### 2. CLARIFY

The AI analyzes the question and identifies missing or ambiguous
experiment parameters.

Examples include:

- Instrument
- Entry condition
- Exit condition
- Timeframe
- Holding period
- Test period
- Filters

The user resolves the ambiguities instead of allowing the system to
silently invent important assumptions.

---

### 3. DEFINE

The clarified idea is converted into an explicit experiment.

Example experiment:

- **Instrument:** NIFTY 50
- **Signal:** Close falls at least 3% over the previous 3 trading days
- **Entry:** Next trading day's open
- **Exit:** Close after 5 trading days
- **Timeframe:** Daily
- **Test Period:** 2018–2025

This creates a reproducible definition of the hypothesis before testing.

---

### 4. TEST

The backend evaluates the defined strategy against historical NIFTY 50
daily market data.

The backtest calculates:

- Total trades
- Winning trades
- Losing trades
- Win rate
- Average return
- Median return
- Best trade
- Worst trade

The application also displays individual historical trades so that
the aggregate statistics can be inspected.

### Important Design Decision

The AI does **not** generate the numerical backtest result.

Gemini is used to:

- Understand the user's research question
- Detect ambiguity
- Identify missing information
- Help define the experiment

The actual numerical results are calculated deterministically by the
backend using historical market data.

This separation makes the experiment more transparent and auditable.

---

### 5. LEARN

The final stage separates observations from conclusions.

The system highlights:

- What happened in the historical test
- What can reasonably be concluded
- What assumptions could affect the result
- What should be tested next

The goal is not to claim that a strategy "works", but to determine
whether the available evidence supports further investigation.

---

## Robustness Checks

The prototype also tests whether the observed result is sensitive to
transaction-cost assumptions.

The baseline uses:

- 0.00% assumed cost
- 0.10% assumed cost
- 0.20% assumed cost

This helps challenge a small observed edge rather than accepting the
baseline result immediately.

The application also provides a NIFTY buy-and-hold benchmark for
additional context.

---

## Technical Architecture

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express
- REST API

### AI

- Google Gemini API

### Market Data

- Yahoo Finance historical market data

---

## Project Structure

```text
ai-trading-research-assistant/
│
├── README.md
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
│
└── server/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── .env
    └── .gitignore