import { describe, expect, it } from 'vitest'
import { summarizePortfolio, summarizeWorkflowSpend, workflowSpend } from './spend'

describe('AI spend controls', () => {
  it('attributes model, agent runtime, and tool costs to one workflow', () => {
    const support = summarizeWorkflowSpend(workflowSpend[0])

    expect(support.totalSpend).toBe(1455)
    expect(support.customer).toBe('Northstar Analytics')
    expect(support.roiRatio).toBeGreaterThan(3)
  })

  it('flags runaway spend when budget variance or recent spike crosses control limits', () => {
    const procurement = summarizeWorkflowSpend(workflowSpend[1])

    expect(procurement.alertLevel).toBe('runaway')
    expect(procurement.approvalRequired).toBe(true)
    expect(procurement.memo).toContain('CFO approval')
  })

  it('builds a portfolio summary with approval workload and ROI uncertainty', () => {
    const portfolio = summarizePortfolio(workflowSpend)

    expect(portfolio.workflows).toHaveLength(3)
    expect(portfolio.runawayCount).toBe(1)
    expect(portfolio.approvalCount).toBe(2)
    expect(portfolio.portfolioRoi).toBeGreaterThan(2)
  })

  it('keeps zero-spend workflows out of the controlled bucket when ROI is unavailable', () => {
    const summary = summarizeWorkflowSpend({
      id: 'wf-zero-spend',
      workflow: 'Zero Spend Research Agent',
      customer: 'Synthetic Customer',
      owner: 'AI Ops',
      modelCost: 0,
      agentRuntimeCost: 0,
      toolCost: 0,
      budgetCap: 500,
      estimatedOutcomeValue: 0,
      outcomeConfidence: 0,
      approvalThreshold: 250,
      lastSpikePercent: 0,
      outcome: 'No measurable outcome captured',
    })

    expect(summary.roiRatio).toBe(0)
    expect(summary.alertLevel).toBe('watch')
  })

  it('returns a stable zero portfolio ROI when no workflows are present', () => {
    const portfolio = summarizePortfolio([])

    expect(portfolio.totalSpend).toBe(0)
    expect(portfolio.portfolioRoi).toBe(0)
  })
})
