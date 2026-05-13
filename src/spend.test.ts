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

  it('flags positive spend against a zero budget cap as runaway', () => {
    const summary = summarizeWorkflowSpend({
      id: 'wf-zero-cap',
      workflow: 'Uncapped Research Agent',
      customer: 'Synthetic Customer',
      owner: 'AI Ops',
      modelCost: 120,
      agentRuntimeCost: 40,
      toolCost: 20,
      budgetCap: 0,
      estimatedOutcomeValue: 10000,
      outcomeConfidence: 0.9,
      approvalThreshold: 1000,
      lastSpikePercent: 0,
      outcome: 'Spend posted without an approved cap',
    })

    expect(summary.variance).toBe(180)
    expect(summary.alertLevel).toBe('runaway')
    expect(summary.memo).toContain('CFO approval')
  })

  it('does not request CFO approval for spike-only runaway alerts below the approval threshold', () => {
    const summary = summarizeWorkflowSpend({
      id: 'wf-spike-only',
      workflow: 'Spike Only Research Agent',
      customer: 'Synthetic Customer',
      owner: 'AI Ops',
      modelCost: 120,
      agentRuntimeCost: 40,
      toolCost: 20,
      budgetCap: 1000,
      estimatedOutcomeValue: 2000,
      outcomeConfidence: 0.8,
      approvalThreshold: 500,
      lastSpikePercent: 64,
      outcome: 'Usage spike detected before customer impact review',
    })

    expect(summary.alertLevel).toBe('runaway')
    expect(summary.approvalRequired).toBe(false)
    expect(summary.memo).toContain('spike')
    expect(summary.memo).not.toContain('CFO approval')
  })

  it('returns a stable zero portfolio ROI when no workflows are present', () => {
    const portfolio = summarizePortfolio([])

    expect(portfolio.totalSpend).toBe(0)
    expect(portfolio.portfolioRoi).toBe(0)
  })
})
