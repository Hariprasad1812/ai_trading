# AI Usage Note — AlgoResearch

## 1. Where AI Was Used

Google Gemini was used as a reasoning assistant during the development
of AlgoResearch.

The primary use of AI in the product is ambiguity detection and
experiment definition.

For example, when the user asks:

> "Does buying NIFTY after a sharp fall work?"

Gemini identifies that "sharp fall" is ambiguous and helps identify
missing parameters such as the entry condition, holding period,
timeframe, and test period.

---

## 2. What AI Does in the Application

Gemini is responsible for:

- Understanding natural-language research questions
- Identifying ambiguous terms
- Identifying missing experiment parameters
- Structuring the research question
- Separating assumptions from user-provided information

The application uses structured JSON output so that the frontend can
reliably display the AI's analysis.

---

## 3. What AI Does NOT Do

Gemini does not generate the numerical backtest results.

The actual historical experiment is performed by deterministic
JavaScript backend code.

The backend:

- Retrieves historical market data
- Applies the defined trading rule
- Determines entries and exits
- Calculates individual trade returns
- Calculates aggregate statistics
- Performs transaction-cost sensitivity calculations

This separation was intentional.

The purpose was to avoid treating an AI-generated numerical response
as empirical evidence.

---

## 4. AI-Assisted Development

AI assistance was also used during development for:

- Discussing application architecture
- Designing the ASK → CLARIFY → DEFINE → TEST → LEARN workflow
- Generating and refining frontend components
- Debugging implementation issues
- Designing the experiment structure
- Improving documentation

The implementation was reviewed and tested locally during development.

---

## 5. Human Decisions

Important product and experiment decisions were made explicitly rather
than delegated to AI.

These include:

- Choosing the thinking-first research workflow
- Making ambiguity visible to the user
- Defining the experimental parameters
- Using the next trading day's open for entry
- Using a five-trading-day holding period
- Separating AI reasoning from deterministic numerical computation
- Challenging the result using transaction-cost assumptions
- Treating historical results as evidence rather than proof
- Identifying limitations such as overfitting, slippage, and market
  regime changes

---

## 6. Principle

The guiding principle for AI usage was:

> **Use AI to help structure the question, not to manufacture the evidence.**

The final system therefore combines AI-assisted reasoning with
deterministic computation and explicit assumptions.