/**
 * Talon EvoCore — Node.js SDK Type Definitions
 */

export interface LearningInput {
  domain: string;
  task_type: string;
  success: boolean;
  complexity?: number;
  strategy?: string;
  skill_name?: string;
  error_type?: string;
  execution_id?: string;
  user_id?: string;
  context?: Record<string, string>;
}

export interface LearningResult {
  signals: string[];
  strategy_used: string;
  personality_shifts: [string, number][];
  mutations: MutationRecord[];
  circuit_breaker_tripped: boolean;
  trace_run_id: string;
}

export interface MutationRecord {
  id: string;
  mutation_type: string;
  target: string;
  before: string;
  after: string;
  reason: string;
  solidified: boolean;
  created_at: number;
}

export interface StrategyRecommendation {
  strategy: string;
  confidence: number;
  reason: string;
  evidence_count: number;
}

export interface PersonalitySnapshot {
  dimensions: Record<string, number>;
  timestamp: number;
  recent_shifts: [string, number][];
}

export interface EvolutionReport {
  total_cycles: number;
  total_tokens: number;
  avg_duration_ms: number;
  p95_duration_ms: number;
  slow_operations: string[];
  personality: Record<string, number>;
}

export interface EvoConfig {
  personality_dimensions?: Array<{
    name: string;
    initial_value?: number;
    max_drift_step?: number;
  }>;
  signal?: { complexity_thresholds?: [number, number] };
  circuit_breaker?: {
    failure_threshold?: number;
    cooldown_secs?: number;
    half_open_attempts?: number;
  };
  memory?: {
    recall_top_k?: number;
    fts_weight?: number;
    vec_weight?: number;
    temporal_boost?: number;
    extract_facts?: boolean;
    graph_depth?: number;
  };
}

// ── Soul 类型 ──────────────────────────────────────────────

export interface Soul {
  identity: SoulIdentity;
  core_truths: CoreTruth[];
  boundaries: string[];
  vibe: 'Sharp' | 'Warm' | 'Chaotic' | 'Calm';
  continuity: ContinuityConfig;
  evolution: SoulEvolutionHistory;
}

export interface SoulIdentity {
  name: string;
  personality_type: 'Professional' | 'Creative' | 'Balanced' | 'Hacker';
  comm_style: 'Concise' | 'Detailed' | 'Casual' | 'Adaptive';
  mission: string;
  emoji?: string;
}

export interface CoreTruth {
  principle: string;
  weight?: number;
}

export interface ContinuityConfig {
  introspect_every_n?: number;
  metacognition?: 'Passive' | 'Active';
}

export interface SoulEvolutionHistory {
  version: number;
  accepted: SoulEvolutionRecord[];
}

export interface SoulEvolutionRecord {
  version: number;
  reason: string;
  changes: string[];
  timestamp: number;
}

export interface IntrospectionReport {
  success_rate: number;
  drift_from_soul: [string, number][];
  total_learns: number;
  timestamp: number;
}

export interface HeartbeatResult {
  introspected: boolean;
  introspection?: IntrospectionReport;
  new_proposal?: SoulEvolutionProposal;
  pending_proposals: number;
  timestamp: number;
}

export interface SoulEvolutionProposal {
  proposed_version: number;
  reason: string;
  proposed_changes: Array<{
    dimension: string;
    old_bias: number;
    current_value: number;
    drift: number;
  }>;
  timestamp: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

// ── 认知模块类型 ──────────────────────────────────────────

export interface EvoIntent {
  /** 意图类型枚举标签（Explore / Verify / EpiphanyDiscovered / ...） */
  [type: string]: any;
}

export interface CognitiveStateSnapshot {
  consciousness: 'Awake' | 'Drowsy' | 'Dreaming';
  total_inputs: number;
  last_input_ms_ago: number;
  learn_count: number;
  domain_count: number;
}

export declare class EvoCore {
  constructor(dbPath: string, config?: EvoConfig);
  learn(input: LearningInput): LearningResult;
  recommendStrategy(signals: string[]): StrategyRecommendation;
  evolveSkill(skillName: string): MutationRecord | null;
  personalitySnapshot(): PersonalitySnapshot;
  evolutionReport(slowThresholdMs?: number): EvolutionReport;
  storeEvolutionMemory(content: string, domain: string, ttlSecs?: number): { id: number };
  recallEvolutionMemory(query: string, topK?: number): { results: any[] };

  // Soul 操作
  configureSoul(soul: Soul): void;
  getSoul(): Soul;
  evolveSoul(version: number, accept?: boolean): boolean;
  introspect(): IntrospectionReport;
  heartbeat(): HeartbeatResult;

  // 认知模块
  pollIntents(maxCount?: number): EvoIntent[];
  feedObservation(domain: string, content: string, metadata?: Record<string, string>): void;
  feedExplorationResult(intentId: string, findings: string, hypothesisConfirmed?: boolean | null): void;
  cognitiveState(): CognitiveStateSnapshot;

  close(): void;
}
