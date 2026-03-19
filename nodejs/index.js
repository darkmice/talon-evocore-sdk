/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */

/**
 * Talon EvoCore — Node.js SDK
 *
 * 两行代码，赋予 AI 进化的灵魂。
 *
 * @example
 * const { EvoCore } = require('talon-evocore');
 * const evo = new EvoCore('./data');
 * const result = evo.learn({ domain: 'coding', task_type: 'review', success: true });
 */

'use strict';

const koffi = require('koffi');
const path = require('path');
const os = require('os');
const fs = require('fs');

// ── 加载原生库 ──────────────────────────────────────────

function findLibrary() {
  // 1. 环境变量
  if (process.env.EVOCORE_LIB_PATH && fs.existsSync(process.env.EVOCORE_LIB_PATH)) {
    return process.env.EVOCORE_LIB_PATH;
  }
  // 2. native/ 目录
  const plat = os.platform();
  const libName = plat === 'darwin' ? 'libevocore.dylib' : plat === 'win32' ? 'evocore.dll' : 'libevocore.so';
  const nativePath = path.join(__dirname, 'native', libName);
  if (fs.existsSync(nativePath)) return nativePath;
  throw new Error(`[evocore] Native library not found. Run 'npm install' or set EVOCORE_LIB_PATH.`);
}

const lib = koffi.load(findLibrary());

const evo_open = lib.func('evo_open', 'str', ['str', 'str']);
const evo_execute = lib.func('evo_execute', 'str', ['uint64', 'str', 'str']);
const evo_close = lib.func('evo_close', 'str', ['uint64']);
const evo_free_string = lib.func('evo_free_string', 'void', ['str']);

// ── EvoCore 类 ──────────────────────────────────────────

class EvoCore {
  /**
   * 创建 EvoCore 实例。
   * @param {string} dbPath - Talon 数据库路径
   * @param {Object} [config] - 可选配置
   */
  constructor(dbPath, config = null) {
    const configJson = config ? JSON.stringify(config) : null;
    const result = JSON.parse(evo_open(dbPath, configJson));
    if (!result.ok) throw new Error(result.error);
    this._id = result.data.id;
  }

  /**
   * 执行后学习 — 触发完整进化周期。
   * @param {Object} input - 学习输入
   * @returns {Object} 学习结果
   */
  learn(input) {
    return this._exec('learn', input);
  }

  /**
   * 推荐策略。
   * @param {string[]} signals - 信号列表
   * @returns {Object} 策略推荐
   */
  recommendStrategy(signals) {
    return this._exec('recommend_strategy', { signals });
  }

  /**
   * 技能进化。
   * @param {string} skillName - 技能名称
   * @returns {Object|null} 变异记录
   */
  evolveSkill(skillName) {
    return this._exec('evolve_skill', { skill_name: skillName });
  }

  /**
   * 获取个性快照。
   * @returns {Object} 个性快照
   */
  personalitySnapshot() {
    return this._exec('personality_snapshot', {});
  }

  /**
   * 获取进化报告。
   * @param {number} [slowThresholdMs=5000] - 慢操作阈值
   * @returns {Object} 进化报告
   */
  evolutionReport(slowThresholdMs = 5000) {
    return this._exec('evolution_report', { slow_threshold_ms: slowThresholdMs });
  }

  /**
   * 存储进化记忆。
   */
  storeEvolutionMemory(content, domain, ttlSecs = null) {
    const params = { content, domain };
    if (ttlSecs !== null) params.ttl_secs = ttlSecs;
    return this._exec('store_evolution_memory', params);
  }

  /**
   * 召回进化记忆。
   */
  recallEvolutionMemory(query, topK = 10) {
    return this._exec('recall_evolution_memory', { query, top_k: topK });
  }

  /**
   * 关闭实例。
   */
  close() {
    if (this._id != null) {
      evo_close(this._id);
      this._id = null;
    }
  }

  /** @private */
  _exec(action, params) {
    if (this._id == null) throw new Error('EvoCore instance is closed');
    const result = JSON.parse(evo_execute(this._id, action, JSON.stringify(params)));
    if (!result.ok) throw new Error(result.error);
    return result.data;
  }
}

module.exports = { EvoCore };
