import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import axios from "axios";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [clarificationAnswers, setClarificationAnswers] = useState({});
  const [step, setStep] = useState("ask");
  const [testResult, setTestResult] = useState(null);

  // --------------------------------
  // START RESEARCH
  // --------------------------------

  const handleStart = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/research/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setAnalysis(data);
      setClarificationAnswers({});

      if (data.ready_to_test) {
        setStep("define");
      } else {
        setStep("clarify");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // GET ANSWER BY FIELD
  // --------------------------------

  const getAnswer = (...fieldNames) => {
    const normalize = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const item = analysis?.missing_information?.find((item) => {
      const field = normalize(item.field);

      return fieldNames.some((name) =>
        field.includes(normalize(name))
      );
    });

    if (!item) return "";

    return clarificationAnswers[item.field] || "";
  };

  // --------------------------------
  // NEW RESEARCH
  // --------------------------------

  const handleNewResearch = () => {
    setQuestion("");
    setAnalysis(null);
    setError("");
    setClarificationAnswers({});
    setStep("ask");
  };

  // --------------------------------
  // EXAMPLE
  // --------------------------------

  const handleExample = (exampleQuestion) => {
    setQuestion(exampleQuestion);
    setAnalysis(null);
    setError("");
    setClarificationAnswers({});
    setStep("ask");
  };

  // --------------------------------
  // WORKFLOW ACTIVE STATE
  // --------------------------------

  const isActive = (currentStep) => {
    return step === currentStep ? "active" : "";
  };

  return (
    <div className="app">

      {/* ============================= */}
      {/* NAVBAR */}
      {/* ============================= */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-icon">
            <Sparkles size={18} />
          </div>

          <span>AlgoResearch</span>

        </div>

        <button
          className="new-research"
          onClick={handleNewResearch}
        >
          + New Research
        </button>

      </header>


      <main className="main-content">

        {/* ============================= */}
        {/* ASK SECTION */}
        {/* ============================= */}

        {step === "ask" && (
          <>
            <div className="hero-badge">
              AI TRADING RESEARCH
            </div>

            <h1>
              Turn a market question
              <br />
              into <span>evidence.</span>
            </h1>

            <p className="subtitle">
              Ask a question about the market. We'll help you
              <br />
              define, test and understand the idea.
            </p>

            <div className="question-section">

              <label>
                What do you want to investigate?
              </label>

              <div className="question-box">

                <textarea
                  value={question}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setQuestion(e.target.value);
                    }
                  }}
                  placeholder="e.g. Does buying NIFTY after a sharp fall work?"
                  rows={4}
                />

                <div className="question-footer">

                  <span>
                    {question.length}/500
                  </span>

                  <button
                    onClick={handleStart}
                    disabled={!question.trim() || loading}
                  >
                    {loading
                      ? "Analyzing..."
                      : "Start Research"}

                    {!loading && (
                      <ArrowRight size={17} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {loading && (
              <div className="loading">
                Analyzing your research question...
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <div className="example-section">

              <span>TRY AN EXAMPLE</span>

              <button
                onClick={() =>
                  handleExample(
                    "Does buying NIFTY after a sharp fall work?"
                  )
                }
              >
                Does buying NIFTY after a sharp fall work?
              </button>

              <button
                onClick={() =>
                  handleExample(
                    "Does buying NIFTY after a 1% fall have an edge?"
                  )
                }
              >
                Does buying NIFTY after a 1% fall have an edge?
              </button>

            </div>
          </>
        )}


        {/* ============================= */}
        {/* ERROR / LOADING AFTER ASK */}
        {/* ============================= */}

        {step !== "ask" && error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* ============================= */}
        {/* CLARIFY */}
        {/* ============================= */}

        {analysis && step === "clarify" && (
          <div className="clarify-section">

            <div className="clarify-header">

              <div className="clarify-label">
                STEP 02 · CLARIFY
              </div>

              <h2>
                Let's clarify your research.
              </h2>

              <p>
                Your question is a good starting point,
                but a few details need to be defined
                before we can test it.
              </p>

            </div>


            {/* WHAT WE UNDERSTOOD */}

            <div className="understanding-card">

              <div className="card-title">
                What we understood
              </div>

              <div className="understanding-grid">

                <div>
                  <span>Instrument</span>

                  <strong>
                    {analysis.understanding.instrument ||
                      "Not specified"}
                  </strong>
                </div>


                <div>
                  <span>Entry</span>

                  <strong>
                    {analysis.understanding.entry_condition ||
                      "Not specified"}
                  </strong>
                </div>


                <div>
                  <span>Timeframe</span>

                  <strong>
                    {analysis.understanding.timeframe ||
                      "Not specified"}
                  </strong>
                </div>


                <div>
                  <span>Holding period</span>

                  <strong>
                    {analysis.understanding.holding_period ||
                      "Not specified"}
                  </strong>
                </div>

              </div>

            </div>


            {/* MISSING INFORMATION */}

            {analysis.missing_information?.length > 0 && (
              <div className="missing-list">

                <div className="section-title">
                  Information we need
                </div>


                {analysis.missing_information.map(
                  (item, index) => (

                    <div
                      className="clarification-card"
                      key={`${item.field}-${index}`}
                    >

                      <div className="clarification-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>


                      <div className="clarification-content">

                        <h3>
                          {item.question}
                        </h3>

                        <p>
                          {item.reason}
                        </p>


                        <div className="clarification-input">

                          <input
                            type="text"
                            placeholder="Enter your answer..."
                            value={
                              clarificationAnswers[
                                item.field
                              ] || ""
                            }
                            onChange={(e) =>
                              setClarificationAnswers(
                                (previous) => ({
                                  ...previous,
                                  [item.field]:
                                    e.target.value,
                                })
                              )
                            }
                          />

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}


            {/* CONTINUE */}

            <button
              className="continue-button"
              onClick={() => setStep("define")}
            >
              Continue to Experiment
              <ArrowRight size={17} />
            </button>

          </div>
        )}


        {/* ============================= */}
        {/* DEFINE */}
        {/* ============================= */}

        {analysis && step === "define" && (
          <div className="clarify-section">

            <div className="clarify-header">

              <div className="clarify-label">
                STEP 03 · DEFINE
              </div>

              <h2>
                Let's define the experiment.
              </h2>

              <p>
                We've turned your idea into a
                testable research experiment.
              </p>

            </div>


            <div className="understanding-card">

              <div className="card-title">
                Experiment Definition
              </div>


              <div className="understanding-grid">

                {/* INSTRUMENT */}

                <div>
                  <span>Instrument</span>

                  <strong>
                    {getAnswer("instrument") ||
                      analysis.understanding.instrument ||
                      "NIFTY 50 Spot Index"}
                  </strong>
                </div>


                {/* ENTRY */}

                <div>
                  <span>Entry condition</span>

                  <strong>
                    {getAnswer(
                      "entry_condition",
                      "entry"
                    ) ||
                      analysis.understanding
                        .entry_condition ||
                      "Not specified"}
                  </strong>
                </div>


                {/* EXIT */}

                <div>
                  <span>Exit condition</span>

                  <strong>
                    {getAnswer(
                      "exit_condition",
                      "exit"
                    ) ||
                      analysis.understanding
                        .exit_condition ||
                      "Not specified"}
                  </strong>
                </div>


                {/* TIMEFRAME */}

                <div>
                  <span>Timeframe</span>

                  <strong>
                    {getAnswer(
                      "timeframe",
                      "bar timeframe",
                      "chart timeframe"
                    ) ||
                      analysis.understanding
                        .timeframe ||
                      "Not specified"}
                  </strong>
                </div>


                {/* HOLDING PERIOD */}

                <div>
                  <span>Holding period</span>

                  <strong>
                    {getAnswer(
                      "holding_period",
                      "holding"
                    ) ||
                      analysis.understanding
                        .holding_period ||
                      "Not specified"}
                  </strong>
                </div>


                {/* TEST PERIOD */}

                <div>
                  <span>Test period</span>

                  <strong>
                    {getAnswer(
                      "test_period",
                      "historical",
                      "date range"
                    ) ||
                      analysis.understanding
                        .test_period ||
                      "Not specified"}
                  </strong>
                </div>

              </div>


              {/* EXPERIMENT DETAILS */}

              <div className="experiment-details">

                <div className="detail-block">

                  <span>
                    Research hypothesis
                  </span>

                  <p>
                    {analysis.understanding
                      .research_question
                      ? `Test whether the strategy described by "${analysis.understanding.research_question}" produces a meaningful edge under the defined experiment conditions.`
                      : "Test whether the defined entry rule produces a meaningful edge over the selected historical period."}
                  </p>

                </div>


                <div className="detail-block">

                  <span>
                    Cost assumptions
                  </span>

                  <p>
                    Baseline experiment assumes
                    zero transaction costs and
                    slippage. These should be added
                    later as a sensitivity test.
                  </p>

                </div>

              </div>

            </div>


            {/* MOVE TO TEST */}

         <button
  className="primary-button"
  onClick={async () => {
    setStep("test");
    setTestResult(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/research/test"
      );

      console.log("Backtest result:", response.data);

      setTestResult(response.data);

    } catch (error) {
      console.error("Backtest failed:", error);

      setTestResult({
        error:
          error?.response?.data?.error ||
          "Failed to run the historical experiment."
      });
    }
  }}
>
  Run Experiment
</button>

          </div>
        )}


        {/* ============================= */}
        {/* TEST PLACEHOLDER */}
        {/* ============================= */}

  {step === "test" && (
  <main className="research-container">

    <div className="step-label">
      STEP 04 · TEST
    </div>

    <h1>Test the idea.</h1>

    <p className="page-description">
      The experiment is evaluated against historical market data.
    </p>

    {!testResult && (
      <div className="analysis-card">
        <h3>Running experiment...</h3>
        <p>
          Testing the defined strategy against historical NIFTY 50 data.
        </p>
      </div>
    )}

    {testResult?.error && (
      <div className="analysis-card">
        <h3>Experiment failed</h3>
        <p>{testResult.error}</p>
      </div>
    )}

    {testResult && !testResult.error && (
      <>

        {/* BASELINE RESULTS */}

        <div className="analysis-card">

          <span className="section-label">
            BASELINE RESULT
          </span>

          <h2>Historical backtest</h2>

          <div className="stats-grid">

            <div className="stat-card">
              <span>Total Trades</span>
              <strong>
                {testResult.statistics.totalTrades}
              </strong>
            </div>

            <div className="stat-card">
              <span>Win Rate</span>
              <strong>
                {testResult.statistics.winRate}%
              </strong>
            </div>

            <div className="stat-card">
              <span>Average Return</span>
              <strong>
                {testResult.statistics.averageReturn}%
              </strong>
            </div>

            <div className="stat-card">
              <span>Median Return</span>
              <strong>
                {testResult.statistics.medianReturn}%
              </strong>
            </div>

            <div className="stat-card">
              <span>Best Trade</span>
              <strong>
                {testResult.statistics.bestReturn}%
              </strong>
            </div>

            <div className="stat-card">
              <span>Worst Trade</span>
              <strong>
                {testResult.statistics.worstReturn}%
              </strong>
            </div>

          </div>

          <div className="experiment-details">

            <div className="detail-block">
              <span>Strategy</span>
              <p>
                {testResult.strategy.signal}
              </p>
            </div>

            <div className="detail-block">
              <span>Entry</span>
              <p>
                {testResult.strategy.entry}
              </p>
            </div>

            <div className="detail-block">
              <span>Exit</span>
              <p>
                {testResult.strategy.exit}
              </p>
            </div>

            <div className="detail-block">
              <span>Test Period</span>
              <p>
                {testResult.strategy.period}
              </p>
            </div>

            <div className="detail-block">
              <span>Data Source</span>
              <p>
                {testResult.dataSource.provider} ·{" "}
                {testResult.dataSource.symbol} ·{" "}
                {testResult.dataSource.interval}
              </p>
            </div>

          </div>

        </div>


        {/* SENSITIVITY TEST */}

        <div className="analysis-card sensitivity-card">

          <span className="section-label">
            ROBUSTNESS CHECK
          </span>

          <h2>Does the result survive friction?</h2>

          <p className="card-description">
            The same average return is evaluated under different
            transaction-cost assumptions.
          </p>

          <div className="sensitivity-grid">

            <div className="sensitivity-item">
              <span>Baseline</span>
              <strong>
                {
                  testResult.statistics.sensitivity
                    .baseline.averageReturn
                }%
              </strong>
              <small>
                0.00% assumed cost
              </small>
            </div>

            <div className="sensitivity-item">
              <span>Moderate friction</span>
              <strong>
                {
                  testResult.statistics.sensitivity
                    .moderateFriction.averageReturn
                }%
              </strong>
              <small>
                0.10% assumed cost
              </small>
            </div>

            <div className="sensitivity-item">
              <span>Higher friction</span>
              <strong>
                {
                  testResult.statistics.sensitivity
                    .higherFriction.averageReturn
                }%
              </strong>
              <small>
                0.20% assumed cost
              </small>
            </div>

          </div>

        </div>


        {/* BENCHMARK */}

        <div className="analysis-card benchmark-card">

          <span className="section-label">
            BENCHMARK
          </span>

          <h2>Compared with buy & hold</h2>

          <div className="benchmark-result">

            <div>
              <span>Strategy average return / trade</span>
              <strong>
                {testResult.statistics.averageReturn}%
              </strong>
            </div>

            <div>
              <span>NIFTY buy & hold</span>
              <strong>
                {testResult.statistics.buyAndHoldReturn}%
              </strong>
            </div>

          </div>

          <p className="card-description">
            This benchmark provides context, but it is not directly
            comparable to a per-trade average return. A future version
            should compare both strategies using the same capital and
            compounding methodology.
          </p>

        </div>


        {/* CONTINUE TO LEARN */}

        {/* TRADE EVIDENCE */}

<div className="analysis-card trades-card">

  <span className="section-label">
    TRADE EVIDENCE
  </span>

  <h2>Sample historical trades</h2>

  <p className="card-description">
    A sample of the trades generated by the deterministic backtest.
  </p>

  <div className="trade-table-wrapper">
    <table className="trade-table">
      <thead>
        <tr>
          <th>Signal Date</th>
          <th>Entry Date</th>
          <th>Exit Date</th>
          <th>Fall</th>
          <th>Entry</th>
          <th>Exit</th>
          <th>Return</th>
        </tr>
      </thead>

      <tbody>
        {testResult.trades.map((trade, index) => (
          <tr key={index}>
            <td>{trade.signalDate}</td>
            <td>{trade.entryDate}</td>
            <td>{trade.exitDate}</td>
            <td>{trade.fallPct}%</td>
            <td>{trade.entryPrice}</td>
            <td>{trade.exitPrice}</td>
            <td>{trade.returnPct}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <p className="table-note">
    Showing the first {testResult.trades.length} trades returned by
    the backtest. Summary statistics use the complete trade set.
  </p>

</div>

      
<button
  className="primary-button"
  onClick={() => setStep("learn")}
>
  Interpret Results
</button>
    )}

  </main>
)}

{step === "learn" && testResult && !testResult.error && (
  <main className="research-container">

    <div className="step-label">
      STEP 05 · LEARN
    </div>

    <h1>Understand the result.</h1>

    <p className="page-description">
      Turn the experiment into a conclusion without overstating
      what the evidence shows.
    </p>


    {/* WHAT WE OBSERVED */}

    <div className="analysis-card">

      <span className="section-label">
        OBSERVATION
      </span>

      <h2>What happened?</h2>

      <p className="learning-text">
        The strategy generated{" "}
        <strong>
          {testResult.statistics.totalTrades}
        </strong>{" "}
        historical trades with a win rate of{" "}
        <strong>
          {testResult.statistics.winRate}%
        </strong>.
      </p>

      <p className="learning-text">
        The average return per trade was{" "}
        <strong>
          {testResult.statistics.averageReturn}%
        </strong>,
        while the median return was{" "}
        <strong>
          {testResult.statistics.medianReturn}%
        </strong>.
      </p>

    </div>


    {/* WHAT IT MEANS */}

    <div className="analysis-card">

      <span className="section-label">
        INTERPRETATION
      </span>

      <h2>What can we conclude?</h2>

      <p className="learning-text">

        The historical test provides evidence about whether
        the defined post-fall strategy had positive average
        returns during the selected period.

      </p>

      <p className="learning-text">

        However, the baseline edge is small compared with the
        variation between the best and worst trades. Therefore,
        the result should be treated as an initial signal rather
        than proof of a reliable trading strategy.

      </p>

    </div>


    {/* LIMITATIONS */}

    <div className="analysis-card">

      <span className="section-label">
        LIMITATIONS
      </span>

      <h2>What could make this conclusion wrong?</h2>

      <div className="learning-list">

        <div>
          <strong>Transaction costs</strong>
          <p>
            Real execution costs can reduce or eliminate a small
            observed edge.
          </p>
        </div>

        <div>
          <strong>Slippage</strong>
          <p>
            Actual execution prices may differ from the assumed
            entry price.
          </p>
        </div>

        <div>
          <strong>Overfitting</strong>
          <p>
            The 3% threshold and 5-day holding period may perform
            differently outside this historical sample.
          </p>
        </div>

        <div>
          <strong>Market regime</strong>
          <p>
            A relationship observed during one period may not
            remain stable across different market conditions.
          </p>
        </div>

      </div>

    </div>


    {/* NEXT EXPERIMENT */}

    <div className="learning-card">

      <span className="section-label">
        NEXT EXPERIMENT
      </span>

      <h2>What should we test next?</h2>

      <p>
        Instead of immediately accepting the result, test whether
        it remains stable when the fall threshold, holding period,
        transaction costs, and market period are changed.
      </p>

      <p>
        A particularly useful next step is an out-of-sample test:
        define the strategy using one period and evaluate it on
        a later period that was not used to make the decision.
      </p>

    </div>


    <button
      className="primary-button"
      onClick={() => {
        setStep("ask");
        setQuestion("");
        setAnalysis(null);
        setTestResult(null);
        setClarificationAnswers({});
      }}
    >
      Start New Research
    </button>

  </main>
)}


        {/* ============================= */}
        {/* WORKFLOW */}
        {/* ============================= */}

        <div className="workflow">

          {/* ASK */}

          <div
            className={`workflow-step ${isActive("ask")}`}
          >
            <div className="step-number">
              01
            </div>

            <div>
              <strong>Ask</strong>
              <span>State your idea</span>
            </div>
          </div>


          <div className="workflow-line" />


          {/* CLARIFY */}

          <div
            className={`workflow-step ${isActive(
              "clarify"
            )}`}
          >
            <div className="step-number">
              02
            </div>

            <div>
              <strong>Clarify</strong>
              <span>Resolve ambiguity</span>
            </div>
          </div>


          <div className="workflow-line" />


          {/* DEFINE */}

          <div
            className={`workflow-step ${isActive(
              "define"
            )}`}
          >
            <div className="step-number">
              03
            </div>

            <div>
              <strong>Define</strong>
              <span>Build experiment</span>
            </div>
          </div>


          <div className="workflow-line" />


          {/* TEST */}

          <div
            className={`workflow-step ${isActive(
              "test"
            )}`}
          >
            <div className="step-number">
              04
            </div>

            <div>
              <strong>Test</strong>
              <span>Run the evidence</span>
            </div>
          </div>


          <div className="workflow-line" />


          {/* LEARN */}

          <div
            className={`workflow-step ${isActive(
              "learn"
            )}`}
          >
            <div className="step-number">
              05
            </div>

            <div>
              <strong>Learn</strong>
              <span>Understand results</span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

export default App;
