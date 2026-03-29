#!/usr/bin/env node
import { execSync } from 'node:child_process'

const args = process.argv.slice(2)
const taskIdx = args.indexOf('--task')
const taskId = taskIdx >= 0 ? args[taskIdx + 1] : `loop-${Date.now()}`

const steps = [
  `npm run harness:eval -- --task ${taskId}`,
  `npm run harness:judge -- --task ${taskId}`,
  `npm run harness:govern -- --task ${taskId}`,
  'npm run harness:aggregate',
  'npm run harness:task-pack',
  'npm run harness:next-plan',
  'npm run harness:weekly',
]

for (const cmd of steps) {
  console.log(`[harness:loop] running: ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

console.log(`[harness:loop] done task=${taskId}`)
