/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */

// Package evocore provides Go bindings for Talon EvoCore — AI 自进化运行时。
//
// 两行代码，赋予 AI 进化的灵魂。
//
// Example:
//
//	evo, _ := evocore.Open("./data", nil)
//	defer evo.Close()
//	result, _ := evo.Learn(evocore.LearningInput{Domain: "coding", Success: true})
package evocore

/*
#cgo darwin,arm64 LDFLAGS: -L${SRCDIR}/native/darwin-arm64 -levocore
#cgo darwin,amd64 LDFLAGS: -L${SRCDIR}/native/darwin-amd64 -levocore
#cgo linux,amd64 LDFLAGS: -L${SRCDIR}/native/linux-amd64 -levocore
#cgo linux,arm64 LDFLAGS: -L${SRCDIR}/native/linux-arm64 -levocore
#cgo windows,amd64 LDFLAGS: -L${SRCDIR}/native/windows-amd64 -levocore

#include <stdlib.h>

extern char* evo_open(const char* db_path, const char* config_json);
extern char* evo_execute(unsigned long long id, const char* action, const char* params_json);
extern char* evo_close(unsigned long long id);
extern void  evo_free_string(char* ptr);
*/
import "C"

import (
	"encoding/json"
	"fmt"
	"unsafe"
)

// EvoCore 实例。
type EvoCore struct {
	id uint64
}

// LearningInput 学习输入。
type LearningInput struct {
	Domain      string            `json:"domain"`
	TaskType    string            `json:"task_type"`
	Success     bool              `json:"success"`
	Complexity  int               `json:"complexity,omitempty"`
	Strategy    string            `json:"strategy,omitempty"`
	SkillName   string            `json:"skill_name,omitempty"`
	ErrorType   string            `json:"error_type,omitempty"`
	ExecutionID string            `json:"execution_id,omitempty"`
	UserID      string            `json:"user_id,omitempty"`
	Context     map[string]string `json:"context,omitempty"`
}

// Open 创建 EvoCore 实例。
func Open(dbPath string, config interface{}) (*EvoCore, error) {
	cPath := C.CString(dbPath)
	defer C.free(unsafe.Pointer(cPath))

	var cConfig *C.char
	if config != nil {
		b, _ := json.Marshal(config)
		cConfig = C.CString(string(b))
		defer C.free(unsafe.Pointer(cConfig))
	}

	cResult := C.evo_open(cPath, cConfig)
	result, err := parseResult(cResult)
	if err != nil {
		return nil, err
	}

	id, _ := result["id"].(float64)
	return &EvoCore{id: uint64(id)}, nil
}

// Learn 执行后学习。
func (e *EvoCore) Learn(input LearningInput) (json.RawMessage, error) {
	return e.execute("learn", input)
}

// RecommendStrategy 推荐策略。
func (e *EvoCore) RecommendStrategy(signals []string) (json.RawMessage, error) {
	return e.execute("recommend_strategy", map[string]interface{}{"signals": signals})
}

// EvolveSkill 技能进化。
func (e *EvoCore) EvolveSkill(skillName string) (json.RawMessage, error) {
	return e.execute("evolve_skill", map[string]interface{}{"skill_name": skillName})
}

// PersonalitySnapshot 获取个性快照。
func (e *EvoCore) PersonalitySnapshot() (json.RawMessage, error) {
	return e.execute("personality_snapshot", nil)
}

// EvolutionReport 获取进化报告。
func (e *EvoCore) EvolutionReport(slowThresholdMs int64) (json.RawMessage, error) {
	return e.execute("evolution_report", map[string]interface{}{"slow_threshold_ms": slowThresholdMs})
}

// ── Soul 操作 ──────────────────────────────────────────────

// ConfigureSoul 配置灵魂。
func (e *EvoCore) ConfigureSoul(soul interface{}) error {
	_, err := e.execute("configure_soul", map[string]interface{}{"soul": soul})
	return err
}

// GetSoul 获取当前灵魂。
func (e *EvoCore) GetSoul() (json.RawMessage, error) {
	return e.execute("get_soul", nil)
}

// EvolveSoul 确认/拒绝灵魂进化提议。
func (e *EvoCore) EvolveSoul(version int, accept bool) (json.RawMessage, error) {
	return e.execute("evolve_soul", map[string]interface{}{"version": version, "accept": accept})
}

// Introspect 手动触发自省。
func (e *EvoCore) Introspect() (json.RawMessage, error) {
	return e.execute("introspect", nil)
}

// Heartbeat 心跳 — 建议每 5 分钟调用一次。
func (e *EvoCore) Heartbeat() (json.RawMessage, error) {
	return e.execute("heartbeat", nil)
}

// ── 认知模块操作 ──────────────────────────────────────────

// PollIntents 非阻塞轮询意图 — 获取大脑的自发想法。
//
// 返回意图列表（JSON），每个意图带类型标签：
// Explore, Verify, EpiphanyDiscovered, SoulAmendmentProposal 等。
func (e *EvoCore) PollIntents(maxCount int) (json.RawMessage, error) {
	return e.execute("poll_intents", map[string]interface{}{"max_count": maxCount})
}

// FeedObservation 向大脑投喂观察数据。
func (e *EvoCore) FeedObservation(domain, content string, metadata map[string]string) error {
	if metadata == nil {
		metadata = map[string]string{}
	}
	_, err := e.execute("feed_sensory", map[string]interface{}{
		"input": map[string]interface{}{
			"type":     "observation",
			"domain":   domain,
			"content":  content,
			"metadata": metadata,
		},
	})
	return err
}

// FeedExplorationResult 回传探索结果 — 完成好奇心闭环。
func (e *EvoCore) FeedExplorationResult(intentID, findings string, hypothesisConfirmed *bool) error {
	input := map[string]interface{}{
		"type":      "exploration_result",
		"intent_id": intentID,
		"findings":  findings,
	}
	if hypothesisConfirmed != nil {
		input["hypothesis_confirmed"] = *hypothesisConfirmed
	}
	_, err := e.execute("feed_sensory", map[string]interface{}{"input": input})
	return err
}

// CognitiveState 获取认知状态快照。
func (e *EvoCore) CognitiveState() (json.RawMessage, error) {
	return e.execute("get_cognitive_state", nil)
}

// Close 关闭实例。
func (e *EvoCore) Close() {
	if e.id != 0 {
		C.evo_close(C.ulonglong(e.id))
		e.id = 0
	}
}

func (e *EvoCore) execute(action string, params interface{}) (json.RawMessage, error) {
	cAction := C.CString(action)
	defer C.free(unsafe.Pointer(cAction))

	var cParams *C.char
	if params != nil {
		b, _ := json.Marshal(params)
		cParams = C.CString(string(b))
		defer C.free(unsafe.Pointer(cParams))
	}

	cResult := C.evo_execute(C.ulonglong(e.id), cAction, cParams)
	result, err := parseResult(cResult)
	if err != nil {
		return nil, err
	}

	data, _ := json.Marshal(result)
	return data, nil
}

func parseResult(cStr *C.char) (map[string]interface{}, error) {
	goStr := C.GoString(cStr)
	// Note: in production, call evo_free_string here
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(goStr), &result); err != nil {
		return nil, err
	}
	if ok, _ := result["ok"].(bool); !ok {
		errMsg, _ := result["error"].(string)
		return nil, fmt.Errorf("evocore: %s", errMsg)
	}
	if data, ok := result["data"].(map[string]interface{}); ok {
		return data, nil
	}
	return result, nil
}
