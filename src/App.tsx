import './App.css'
import { formatCurrency, summarizePortfolio, workflowSpend } from './spend'

const portfolio = summarizePortfolio(workflowSpend)

function App() {
  return (
    <main className="app-shell">
      <section className="overview">
        <div>
          <p className="eyebrow">AI Spend Command Center</p>
          <h1>Turn model, agent, and tool usage into governed operating spend.</h1>
          <p className="lede">
            Synthetic workflow data is attributed to customers, outcomes, budget caps,
            runaway-spend alerts, approval thresholds, and a CFO-ready control memo.
          </p>
        </div>
        <div className="kpi-grid" aria-label="Portfolio spend summary">
          <article>
            <span>Total spend</span>
            <strong>{formatCurrency(portfolio.totalSpend)}</strong>
            <small>{formatCurrency(portfolio.totalCap)} cap</small>
          </article>
          <article>
            <span>Risk-adjusted value</span>
            <strong>{formatCurrency(portfolio.riskAdjustedValue)}</strong>
            <small>{portfolio.portfolioRoi.toFixed(1)}x portfolio ROI</small>
          </article>
          <article>
            <span>Control load</span>
            <strong>{portfolio.approvalCount} approvals</strong>
            <small>{portfolio.runawayCount} runaway alert</small>
          </article>
        </div>
      </section>

      <section className="workspace" aria-label="Spend table and control memo">
        <div className="panel spend-panel">
          <div className="section-heading">
            <p className="eyebrow">Spend table</p>
            <h2>Workflow attribution</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Workflow</th>
                  <th>Customer</th>
                  <th>Model</th>
                  <th>Agent/tools</th>
                  <th>Cap variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.workflows.map((workflow) => (
                  <tr key={workflow.id}>
                    <td>
                      <strong>{workflow.workflow}</strong>
                      <span>{workflow.outcome}</span>
                    </td>
                    <td>{workflow.customer}</td>
                    <td>{formatCurrency(workflow.modelCost)}</td>
                    <td>{formatCurrency(workflow.agentRuntimeCost + workflow.toolCost)}</td>
                    <td className={workflow.variance > 0 ? 'negative' : 'positive'}>
                      {workflow.variance > 0 ? '+' : ''}
                      {formatCurrency(workflow.variance)}
                    </td>
                    <td>
                      <span className={`status ${workflow.alertLevel}`}>{workflow.alertLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel memo-panel">
          <div className="section-heading">
            <p className="eyebrow">CFO-ready control memo</p>
            <h2>Approval posture</h2>
          </div>
          {portfolio.workflows.map((workflow) => (
            <article className="memo" key={workflow.id}>
              <div>
                <strong>{workflow.owner}</strong>
                <span>{workflow.approvalRequired ? 'Approval threshold crossed' : 'Within delegated spend'}</span>
              </div>
              <p>{workflow.memo}</p>
            </article>
          ))}
          <div className="note">
            Synthetic data only. This is an operating-control demo, not financial advice or a live billing system.
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
