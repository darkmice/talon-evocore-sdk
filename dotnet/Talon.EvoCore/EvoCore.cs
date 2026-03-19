/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */

using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace Talon.EvoCore;

/// <summary>
/// Talon EvoCore — AI 自进化运行时 .NET SDK。
/// 两行代码，赋予 AI 进化的灵魂。
/// </summary>
public sealed class EvoCore : IDisposable
{
    private ulong _id;
    private bool _disposed;

    // ── P/Invoke ────────────────────────────────────────

    [DllImport("evocore", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr evo_open(
        [MarshalAs(UnmanagedType.LPUTF8Str)] string dbPath,
        [MarshalAs(UnmanagedType.LPUTF8Str)] string? configJson);

    [DllImport("evocore", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr evo_execute(
        ulong id,
        [MarshalAs(UnmanagedType.LPUTF8Str)] string action,
        [MarshalAs(UnmanagedType.LPUTF8Str)] string paramsJson);

    [DllImport("evocore", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr evo_close(ulong id);

    [DllImport("evocore", CallingConvention = CallingConvention.Cdecl)]
    private static extern void evo_free_string(IntPtr ptr);

    // ── 构建/销毁 ──────────────────────────────────────

    /// <summary>创建 EvoCore 实例。</summary>
    public EvoCore(string dbPath, object? config = null)
    {
        var configJson = config != null ? JsonSerializer.Serialize(config) : null;
        var result = ParseResult(evo_open(dbPath, configJson));
        _id = result.GetProperty("id").GetUInt64();
    }

    /// <summary>执行后学习。</summary>
    public JsonElement Learn(object input) => Execute("learn", input);

    /// <summary>推荐策略。</summary>
    public JsonElement RecommendStrategy(string[] signals)
        => Execute("recommend_strategy", new { signals });

    /// <summary>技能进化。</summary>
    public JsonElement? EvolveSkill(string skillName)
    {
        var result = Execute("evolve_skill", new { skill_name = skillName });
        return result.TryGetProperty("skipped", out _) ? null : result;
    }

    /// <summary>个性快照。</summary>
    public JsonElement PersonalitySnapshot() => Execute("personality_snapshot", new { });

    /// <summary>进化报告。</summary>
    public JsonElement EvolutionReport(long slowThresholdMs = 5000)
        => Execute("evolution_report", new { slow_threshold_ms = slowThresholdMs });

    /// <summary>关闭实例。</summary>
    public void Dispose()
    {
        if (!_disposed && _id != 0)
        {
            evo_close(_id);
            _id = 0;
            _disposed = true;
        }
    }

    private JsonElement Execute(string action, object param)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        var paramsJson = JsonSerializer.Serialize(param);
        return ParseResult(evo_execute(_id, action, paramsJson));
    }

    private static JsonElement ParseResult(IntPtr ptr)
    {
        var json = Marshal.PtrToStringUTF8(ptr)
            ?? throw new InvalidOperationException("Null FFI response");
        // evo_free_string(ptr);  // TODO: 启用后取消注释

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        if (!root.GetProperty("ok").GetBoolean())
        {
            var error = root.GetProperty("error").GetString();
            throw new InvalidOperationException($"[evocore] {error}");
        }
        return root.GetProperty("data").Clone();
    }
}
