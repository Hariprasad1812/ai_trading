# Thinking Note — AlgoResearch

## 1. Problem Understanding

The initial problem appears simple:

> "Does buying NIFTY after a sharp fall work?"

However, this question is not directly testable because several important
terms are ambiguous.

In particular, "sharp fall" could mean a percentage decline, a fixed
point decline, or a decline over a particular number of trading days.

Other missing parameters include the entry timing, exit condition,
holding period, timeframe, and historical test period.

The main design decision was therefore to avoid answering the question
immediately.

Instead, the system follows:

**ASK → CLARIFY → DEFINE → TEST → LEARN**

The goal is to turn an ambiguous idea into a reproducible experiment.

---

## 2. ASK

The user starts with a natural-language research question.

Example:

> "Does buying NIFTY after a sharp fall work?"

At this stage, the system does not assume that the question is precise
enough to test.

---

## 3. CLARIFY

Gemini is used to identify missing or ambiguous information.

For example, the system can identify:

- Instrument
- Entry condition
- Exit condition
- Timeframe
- Holding period
- Test period
- Filters

An important design principle is:

> **Do not silently invent important experiment parameters.**

The user is asked to resolve the ambiguity.

For the example experiment, "sharp fall" was defined as:

> A fall of at least 3% from the closing price three trading days earlier.

The holding period was defined as five trading days and the entry was
defined as the next trading day's open.

---

## 4. DEFINE

After clarification, the experiment becomes explicit:

- Instrument: NIFTY 50
- Timeframe: Daily
- Signal: Close falls at least 3% over the previous 3 trading days
- Entry: Next trading day's open
- Exit: Close after 5 trading days
- Test period: 2018–2025

This step is important because the same natural-language question could
produce very different results depending on how these parameters are
defined.

The system therefore separates the user's original idea from the
assumptions required to make it testable.

---

## 5. TEST

The numerical experiment is performed by deterministic backend code.

Gemini is deliberately not used to generate the backtest result.

The backend retrieves historical NIFTY 50 daily data and calculates
individual trade returns.

For each qualifying signal:

1. Identify the closing-price fall.
2. Enter at the next trading day's open.
3. Hold for five trading days.
4. Exit at the fifth trading day's close.
5. Calculate the percentage return.

The system then calculates aggregate statistics such as:

- Total trades
- Win rate
- Average return
- Median return
- Best trade
- Worst trade

Individual sample trades are also displayed so that the aggregate
numbers are not treated as an unexplained black box.

### Look-ahead bias

The strategy enters at the next trading day's open rather than at the
same closing price that generates the signal.

This avoids using information from the future when defining the
execution price.

The distinction between:

**signal → future execution**

is therefore explicit in the experiment.

---

## 6. Robustness Check

A positive historical result should not immediately be treated as
evidence that the strategy is useful.

The prototype therefore challenges the baseline assumption by testing
different transaction-cost assumptions:

- 0.00%
- 0.10%
- 0.20%

This is particularly important because the observed baseline average
return is small.

If a small historical edge disappears after reasonable friction is
introduced, that is important evidence rather than a failure of the
experiment.

---

## 7. What the Initial Test Showed

The baseline experiment produced:

- 70 historical trades
- 55.71% win rate
- 0.05% average return per trade
- 0.68% median return
- 9.86% best trade
- -20.63% worst trade

These numbers are observations from the selected historical sample.

They should not be interpreted as proof that the strategy will work
in the future.

One important observation is that the average return is relatively
small compared with the variation between individual trades.

Therefore, the initial result is better interpreted as:

> **Evidence worth investigating further, rather than evidence that
> establishes a reliable trading strategy.**

---

## 8. Limitations

Several factors could make the observed relationship weaker outside
the experiment.

### Transaction Costs

Real trading involves costs that can reduce returns.

### Slippage

The actual execution price may differ from the assumed entry price.

### Overfitting

The selected 3% threshold and five-day holding period may work well in
one historical sample but not generalize to unseen data.

### Market Regimes

Relationships observed during one market environment may change under
different market conditions.

### Instrument Limitation

The experiment uses the NIFTY 50 index as the research instrument.
The index itself does not represent a directly executable trade.

### Historical Data

Historical performance is not a guarantee of future performance.

---

## 9. What I Would Test Next

The next experiment should challenge whether the result is robust to
changes in the experiment definition.

Possible tests include:

- Different fall thresholds
- Different holding periods
- Different transaction-cost assumptions
- Different historical periods
- Different market regimes

A particularly important next step would be an out-of-sample test.

For example, the strategy could be defined using an earlier period and
then evaluated on a later period that was not used when making the
original decision.

This reduces the risk of selecting parameters simply because they
performed well in the original sample.

---

## 10. Key Product Insight

The main product insight is that the valuable part of the system is
not simply producing a backtest.

The valuable part is making the reasoning process visible.

Instead of:

**Question → AI Answer**

AlgoResearch uses:

**Question → Ambiguity → Clarification → Experiment → Evidence →
Interpretation → Next Experiment**

This makes the system useful as a research assistant rather than as a
black-box prediction tool.

---

## 11. Key Technical Decision

The architecture deliberately separates AI reasoning from numerical
computation.

**Gemini:**
- Understands natural language
- Detects ambiguity
- Identifies missing information
- Helps structure the experiment

**Backend code:**
- Retrieves historical data
- Applies deterministic rules
- Calculates trade returns
- Produces statistics

This separation makes the numerical result more reproducible and
reduces the risk of presenting an AI-generated number as empirical
evidence.