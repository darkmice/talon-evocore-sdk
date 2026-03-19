/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */
package com.talon.evocore;

import com.sun.jna.Library;
import com.sun.jna.Native;

/**
 * JNA 接口定义 — 映射 libevocore 的 C FFI。
 */
interface EvoCoreNative extends Library {
    EvoCoreNative INSTANCE = Native.load("evocore", EvoCoreNative.class);

    String evo_open(String dbPath, String configJson);
    String evo_execute(long id, String action, String paramsJson);
    String evo_close(long id);
    void   evo_free_string(String ptr);
}
