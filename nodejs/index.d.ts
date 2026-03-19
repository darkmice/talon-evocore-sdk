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

export declare class EvoCore {
  constructor(dbPath: string, config?: EvoConfig);
  learn(input: LearningInput): LearningResult;
  recommendStrategy(signals: string[]): StrategyRecommendation;
  evolveSkill(skillName: string): MutationRecord | null;
  personalitySnapshot(): PersonalitySnapshot;
  evolutionReport(slowThresholdMs?: number): EvolutionReport;
  storeEvolutionMemory(content: string, domain: string, ttlSecs?: number): { id: number };
  recallEvolutionMemory(query: string, topK?: number): { results: any[] };
  close(): void;
}
