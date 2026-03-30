# Evaluator Contract (Independent Judge)

目标：把“执行结果”与“质量判定”分离，避免 Builder 自评偏乐观。

## Inputs

- `reports/eval/<task-id>.md`（原始执行证据）
- `harness/metrics/summary.json`（历史趋势）

## Judge Dimensions (0-5)

1. Functional correctness
2. Regression risk
3. Maintainability
4. Architecture consistency
5. Observability / diagnosability
6. UX critical path

## Hard Fail Rules

- 任一执行步骤失败（lint/unit/e2e/build） => FAIL
- 任一维度 < 3 => FAIL
- 总分 < 22 => FAIL

## Outputs

- `harness/metrics/judgements/<task-id>.json`
- `harness/metrics/judgements/<task-id>.md`

## Notes

当前 v0.6 使用规则化启发式评分；后续可升级为模型评审代理（独立 session）。
