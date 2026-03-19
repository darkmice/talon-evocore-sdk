/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */
package com.talon.evocore;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.Map;

/**
 * Talon EvoCore — AI 自进化运行时 Java SDK。
 *
 * <p>两行代码，赋予 AI 进化的灵魂。</p>
 *
 * <pre>{@code
 * try (EvoCore evo = new EvoCore("./data")) {
 *     JsonObject result = evo.learn(Map.of(
 *         "domain", "coding",
 *         "task_type", "review",
 *         "success", true
 *     ));
 * }
 * }</pre>
 */
public class EvoCore implements AutoCloseable {

    private static final Gson GSON = new Gson();
    private static final EvoCoreNative LIB = EvoCoreNative.INSTANCE;

    private long id;

    /** 创建 EvoCore 实例。 */
    public EvoCore(String dbPath) {
        this(dbPath, null);
    }

    /** 创建 EvoCore 实例（带配置）。 */
    public EvoCore(String dbPath, Object config) {
        String configJson = config != null ? GSON.toJson(config) : null;
        JsonObject result = parseResult(LIB.evo_open(dbPath, configJson));
        this.id = result.get("id").getAsLong();
    }

    /** 执行后学习。 */
    public JsonObject learn(Map<String, Object> input) {
        return execute("learn", input);
    }

    /** 推荐策略。 */
    public JsonObject recommendStrategy(String[] signals) {
        return execute("recommend_strategy", Map.of("signals", signals));
    }

    /** 技能进化。 */
    public JsonObject evolveSkill(String skillName) {
        return execute("evolve_skill", Map.of("skill_name", skillName));
    }

    /** 个性快照。 */
    public JsonObject personalitySnapshot() {
        return execute("personality_snapshot", Map.of());
    }

    /** 进化报告。 */
    public JsonObject evolutionReport(long slowThresholdMs) {
        return execute("evolution_report", Map.of("slow_threshold_ms", slowThresholdMs));
    }

    /** 关闭实例。 */
    @Override
    public void close() {
        if (id != 0) {
            LIB.evo_close(id);
            id = 0;
        }
    }

    private JsonObject execute(String action, Object params) {
        if (id == 0) throw new IllegalStateException("EvoCore instance is closed");
        String paramsJson = GSON.toJson(params);
        return parseResult(LIB.evo_execute(id, action, paramsJson));
    }

    private static JsonObject parseResult(String raw) {
        JsonObject obj = GSON.fromJson(raw, JsonObject.class);
        if (!obj.get("ok").getAsBoolean()) {
            String error = obj.has("error") ? obj.get("error").getAsString() : "unknown error";
            throw new RuntimeException("[evocore] " + error);
        }
        return obj.getAsJsonObject("data");
    }
}
