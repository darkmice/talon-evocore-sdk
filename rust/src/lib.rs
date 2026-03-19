/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */
//! Talon EvoCore — AI 自进化运行时 Rust SDK.
//!
//! **零 FFI 损耗**：Rust 用户直接调用 `evo_core` crate，
//! 无 JSON 序列化/反序列化、无 C 指针传递、无 unsafe。
//!
//! 其他语言 SDK（Node.js/Go/Python/Java/PHP/.NET）通过 C FFI 调用 `libevocore`，
//! Rust 用户作为一等公民享受零损耗。
//!
//! # Quick Start
//!
//! ```rust,no_run
//! use talon::Talon;
//! use talon_ai::TalonAiExt;
//! use talon_evocore::prelude::*;
//!
//! let db = Talon::open("./data").unwrap();
//! let ai = db.ai().unwrap();
//! let mut evo = EvoCore::new(ai).unwrap();
//!
//! let result = evo.learn(&LearningInput {
//!     domain: "coding".into(),
//!     task_type: "review".into(),
//!     success: true,
//!     ..Default::default()
//! }).unwrap();
//! ```

// 直接重导出 evo_core 的全部公开 API——零包装、零损耗。
pub use evo_core::*;

/// 常用类型 prelude。
pub mod prelude {
    pub use evo_core::{
        CircuitBreakerConfig, EvoConfig, EvoCore, EvoError, EvoResult,
        EventBoundaryResult, EvolutionEventTracker, EvolutionReport,
        LearningInput, LearningResult, MemoryConfig, MemoryStatsReport,
        MutationRecord, MutationType, PersonalityDimension, PersonalitySnapshot,
        SignalConfig, SkillEvolutionConfig, StrategyRecommendation,
    };
}
