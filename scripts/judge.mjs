#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const evalDir = resolve(root, 'reports/eval')
const outDir = resolve(root, 'harness/metrics/judgements')
mkdirSync(outDir, { recursive: true })

const args = process.argv.slice(2)
const taskIdx = args.indexOf('--task')

let taskId = taskIdx >= 0 ? args[taskIdx + 1] : null
if (!taskId) {
  const latest = readdirSync(evalDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_template'))
    .sort()
    .pop()
  if (!latest) {
    console.error('No eval report found.')
    process.exit(1)
  }
  taskId = latest.replace(/\.md$/, '')
}

const evalPath = resolve(evalDir, `${taskId}.md`)
if (!existsSync(evalPath)) {
  console.error(`Eval report not found: ${evalPath}`)
  process.exit(1)
}

const text = readFileSync(evalPath, 'utf8')

const stepFail = {
  lint: text.includes('### lint (FAIL)'),
  unit: text.includes('### unit test (FAIL)'),
  e2e: text.includes('### e2e test (FAIL)'),
  build: text.includes('### build (FAIL)'),
}

const anyStepFail = Object.values(stepFail).some(Boolean)

function baseScore() {
  return anyStepFail ? 2 : 4
}

const scores = {
  functionalCorrectness: baseScore() + (stepFail.e2e ? 0 : 1),
  regressionRisk: baseScore() + (stepFail.unit ? 0 : 1),
  maintainability: stepFail.lint ? 2 : 4,
  architectureConsistency: 4,
  observability: 3,
  uxCriticalPath: stepFail.e2e ? 2 : 4,
}

for (const k of Object.keys(scores)) {
  scores[k] = Math.max(0, Math.min(5, scores[k]))
}

const total = Object.values(scores).reduce((a, b) => a + b, 0)
const hardFail = anyStepFail || Object.values(scores).some((v) => v < 3) || total < 22
const verdict = hardFail ? 'FAIL' : 'PASS'

const payload = {
  taskId,
  generatedAt: new Date().toISOString(),
  inputs: { evalPath },
  stepFail,
  scores,
  total,
  verdict,
}

const jsonPath = resolve(outDir, `${taskId}.json`)
writeFileSync(jsonPath, JSON.stringify(payload, null, 2))

const md = `# Judgement\n\n- Task ID: ${taskId}\n- Verdict: ${verdict}\n- Total Score: ${total}/30\n\n## Step Fail Signals\n\n- lint: ${stepFail.lint}\n- unit: ${stepFail.unit}\n- e2e: ${stepFail.e2e}\n- build: ${stepFail.build}\n\n## Scores\n\n- Functional correctness: ${scores.functionalCorrectness}\n- Regression risk: ${scores.regressionRisk}\n- Maintainability: ${scores.maintainability}\n- Architecture consistency: ${scores.architectureConsistency}\n- Observability / diagnosability: ${scores.observability}\n- UX critical path: ${scores.uxCriticalPath}\n\n## Hard Fail Rule\n\n${hardFail ? '- Triggered' : '- Not triggered'}\n`

const mdPath = resolve(outDir, `${taskId}.md`)
writeFileSync(mdPath, md)

console.log(`[harness:judge] task=${taskId} verdict=${verdict} total=${total}`)
console.log(`[harness:judge] json=${jsonPath}`)
console.log(`[harness:judge] md=${mdPath}`)

if (hardFail) process.exit(1)
