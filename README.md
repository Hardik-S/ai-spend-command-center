# AI Spend Command Center

AI Spend Command Center is a fixture-first portfolio product that turns synthetic model, agent, and tool usage into workflow-level cost attribution, runaway-spend alerts, approval thresholds, ROI uncertainty, and a CFO-ready control memo.

## Portfolio Signal

This project demonstrates production AI operating discipline: the product is not a generic chart, and it does not call a live model. It shows how AI usage can be governed as a measurable business workflow with accountable owners, customer context, outcome confidence, and budget controls.

## Stack Rationale

- Vite + React + TypeScript keeps the first slice static, fast to verify, and easy to deploy on Vercel.
- Fixture-first data avoids secrets, live customer data, billing APIs, or private financial records.
- Vitest covers the spend math and alert policy so the demo is reproducible.
- Plain CSS is used because the product needs a dense command-center surface, not a marketing landing page.

## File Map

- `src/spend.ts`: typed synthetic workflow records, cost formulas, alert classification, and memo generation.
- `src/spend.test.ts`: deterministic tests for attribution, runaway alerts, approval thresholds, and portfolio rollup.
- `src/App.tsx`: React surface for the spend table, alert state, control load, and CFO-ready memo.
- `src/App.css`: responsive command-center layout and visual states.
- `package.json`: scripts for development, testing, and production build.

## Synthetic Fixture Provenance

All records are invented examples. They represent three fictional workflows, customers, owners, and outcomes:

- Support Triage Agent for Northstar Analytics.
- Procurement Evidence Collector for Cobalt Health.
- Renewal Risk Researcher for Atlas Freight.

No real customer, employee, invoice, token, payment, or billing data is included. This public repo is intentionally safe for portfolio review.

## Formulas And Controls

- `totalSpend = modelCost + agentRuntimeCost + toolCost`
- `variance = totalSpend - budgetCap`
- `riskAdjustedValue = estimatedOutcomeValue * outcomeConfidence`
- `roiRatio = riskAdjustedValue / totalSpend`
- ROI and variance ratios fall back to `0` when the denominator is zero so empty or zero-spend fixtures remain deterministic instead of producing `NaN`.
- `approvalRequired = totalSpend >= approvalThreshold`
- Positive spend against a zero or negative budget cap is still treated as a cap breach, even though the displayed variance ratio remains deterministic at `0`.
- `runaway` is triggered when cap variance exceeds 5% or recent spend spike is at least 50%.
- `watch` is triggered when approval is required or risk-adjusted ROI is below 2.5x.
- `controlled` means the workflow is below those control limits.

These thresholds are product-design assumptions for the demo, not financial advice or a recommended control framework.

## Local Setup

```powershell
npm ci
npm run test -- --run
npm run build
npm run dev
```

## Verification

Expected worker verification:

```powershell
npm ci
npm run test -- --run
npm run build
```

Local preview or built-output smoke should confirm these visible strings:

- `AI Spend Command Center`
- `Spend table`
- `runaway`
- `CFO-ready control memo`

## Deployment

The deployment target is Vercel as a static Vite app.

Production URL: https://ai-spend-command-center.vercel.app

Deployment evidence:

- Vercel deployment id: `dpl_6wZZ9RX9iTPCzteVkaGQ76XfHF34`
- Inspect URL: https://vercel.com/batb4016-9101s-projects/ai-spend-command-center/6wZZ9RX9iTPCzteVkaGQ76XfHF34
- Production deployment: https://ai-spend-command-center-ebe2ef3qa-batb4016-9101s-projects.vercel.app
- Production alias smoke passed for `AI Spend Command Center`, `Spend table`, `runaway`, and `CFO-ready control memo`.

## Decisions Made

- Chose static fixtures instead of live OpenAI, Vercel, or billing APIs because the portfolio signal is operating governance, not API connectivity.
- Kept one dashboard surface for the first slice so reviewer attention goes to attribution, alert state, and control memo quality.
- Included explicit no-advice and no-real-data boundaries because the product touches AI spend, ROI, approval, and CFO language.
- Used deterministic threshold tests to make later fixer passes safer when they refine copy or layout.
- Recorded both the Vercel inspect URL and the stable production alias so future automation runs can distinguish deployment identity from public review URL.
