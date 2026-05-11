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
})
