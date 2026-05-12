export type WorkflowSpend = {
  id: string
  workflow: string
  customer: string
  owner: string
  modelCost: number
  agentRuntimeCost: number
  toolCost: number
  budgetCap: number
  estimatedOutcomeValue: number
  outcomeConfidence: number
  approvalThreshold: number
  lastSpikePercent: number
  outcome: string
}

export type WorkflowSpendSummary = WorkflowSpend & {
  totalSpend: number
  variance: number
  variancePercent: number
  riskAdjustedValue: number
  roiRatio: number
  approvalRequired: boolean
  alertLevel: 'controlled' | 'watch' | 'runaway'
  memo: string
}

export const workflowSpend: WorkflowSpend[] = [
  {
    id: 'wf-support-triage',
    workflow: 'Support Triage Agent',
    customer: 'Northstar Analytics',
    owner: 'CX Ops',
    modelCost: 820,
    agentRuntimeCost: 390,
    toolCost: 245,
    budgetCap: 1800,
    estimatedOutcomeValue: 7200,
    outcomeConfidence: 0.71,
    approvalThreshold: 1500,
    lastSpikePercent: 18,
    outcome: '2.4 hour faster first response on priority tickets',
  },
  {
    id: 'wf-procurement-audit',
    workflow: 'Procurement Evidence Collector',
    customer: 'Cobalt Health',
    owner: 'Finance Ops',
    modelCost: 1140,
    agentRuntimeCost: 710,
    toolCost: 420,
    budgetCap: 2100,
    estimatedOutcomeValue: 5100,
    outcomeConfidence: 0.46,
    approvalThreshold: 2000,
    lastSpikePercent: 64,
    outcome: 'Invoice exception packet prepared before month close',
  },
  {
    id: 'wf-sales-renewal',
    workflow: 'Renewal Risk Researcher',
    customer: 'Atlas Freight',
    owner: 'Revenue Ops',
    modelCost: 660,
    agentRuntimeCost: 280,
    toolCost: 190,
    budgetCap: 1200,
    estimatedOutcomeValue: 4300,
    outcomeConfidence: 0.58,
    approvalThreshold: 1000,
    lastSpikePercent: 37,
    outcome: 'Churn-risk account brief delivered before QBR',
  },
]

function safeRatio(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator
}

export function summarizeWorkflowSpend(record: WorkflowSpend): WorkflowSpendSummary {
  const totalSpend = record.modelCost + record.agentRuntimeCost + record.toolCost
  const variance = totalSpend - record.budgetCap
  const variancePercent = safeRatio(variance, record.budgetCap)
  const riskAdjustedValue = record.estimatedOutcomeValue * record.outcomeConfidence
  const roiRatio = safeRatio(riskAdjustedValue, totalSpend)
  const approvalRequired = totalSpend >= record.approvalThreshold
  const alertLevel =
    variancePercent > 0.05 || record.lastSpikePercent >= 50
      ? 'runaway'
      : approvalRequired || roiRatio < 2.5
        ? 'watch'
        : 'controlled'

  const memo =
    alertLevel === 'runaway'
      ? `${record.workflow} needs CFO approval: spend is ${formatCurrency(totalSpend)} against a ${formatCurrency(record.budgetCap)} cap, with ${record.lastSpikePercent}% recent spike.`
      : `${record.workflow} is ${alertLevel}: ${formatCurrency(totalSpend)} spend supports ${formatCurrency(riskAdjustedValue)} risk-adjusted value.`

  return {
    ...record,
    totalSpend,
    variance,
    variancePercent,
    riskAdjustedValue,
    roiRatio,
    approvalRequired,
    alertLevel,
    memo,
  }
}

export function summarizePortfolio(records: WorkflowSpend[]) {
  const workflows = records.map(summarizeWorkflowSpend)
  const totalSpend = workflows.reduce((sum, workflow) => sum + workflow.totalSpend, 0)
  const totalCap = workflows.reduce((sum, workflow) => sum + workflow.budgetCap, 0)
  const riskAdjustedValue = workflows.reduce((sum, workflow) => sum + workflow.riskAdjustedValue, 0)
  const runawayCount = workflows.filter((workflow) => workflow.alertLevel === 'runaway').length
  const approvalCount = workflows.filter((workflow) => workflow.approvalRequired).length

  return {
    workflows,
    totalSpend,
    totalCap,
    riskAdjustedValue,
    runawayCount,
    approvalCount,
    portfolioRoi: safeRatio(riskAdjustedValue, totalSpend),
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
