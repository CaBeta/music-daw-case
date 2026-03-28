# music-daw-case

一个用于 **Harness 工程开发 case** 的在线音乐编辑器 MVP（浏览器端 DAW）。

目标：复现 Anthropic 在博客中提到的「浏览器 DAW」方向，但保持实现足够轻量，便于在 OpenClaw 里反复迭代、评测和演进。

## 技术栈

- Vite
- React + TypeScript
- Web Audio API（浏览器原生）

## 功能（MVP 最小闭环）

- 4 轨时间轴（16 beats）
- 每轨可新增/删除 clip（矩形块）
- Transport：播放 / 暂停 / 停止
- BPM 设置（60~200）
- 每个 clip 可触发基础音源（sine / square）与固定音高
- 每轨音量控制（mixer 最小版）
- 主输出电平可视化（简单 meter）

## 本地运行

```bash
cd music-daw-case
npm install
npm run dev
```

打开终端输出里的本地地址（通常是 http://localhost:5173 ）。

## 构建验证

```bash
npm run build
```

## 交互说明

- 点击 `Play` 开始从头播放整个时间轴
- `Pause` 暂停当前播放
- `Stop` 停止并回到开头
- 每个 Track 可调节 Vol
- 点击 `+ Clip` 给轨道添加一个随机位置 clip
- 双击 clip 删除
- 播放中会禁用新增 clip 和 BPM 修改，避免调度冲突

## 数据结构（核心）

- `ProjectState`
  - `bpm`
  - `tracks: Track[]`
- `Track`
  - `id`
  - `name`
  - `volume`
  - `clips: Clip[]`
- `Clip`
  - `id`
  - `startBeat`
  - `lengthBeats`
  - `noteHz`
  - `wave`

## 已知限制

- clip 位置暂不支持拖拽编辑（当前通过随机新增快速验证闭环）
- 没有钢琴卷帘、和弦、量化、自动化曲线
- 音色仅基础振荡器，不含采样器/合成器参数面板
- 暂无项目持久化（刷新页面会重置）

## 下一步演进建议（对接 Harness 循环）

1. **Planner 阶段**：把需求转成 sprint contract（功能+验收）
2. **Builder 阶段**：按 contract 产出代码 + 测试
3. **Evaluator 阶段**：
   - Playwright 自动走查 UI
   - 音频行为断言（播放状态、节点调度、峰值检测）
4. **Governor 阶段**：
   - 对失败样本归因（需求歧义/规则缺失/测试盲区）
   - 将经验沉淀到 lint、测试模板、docs 规范

这个项目可作为 OpenClaw 自进化 harness 的标准样本库之一，用于持续比较：
- 交付时长
- 自动通过率
- 回归缺陷率
- 规则增量效果
