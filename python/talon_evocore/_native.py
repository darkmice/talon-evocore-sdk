#
# Copyright (c) 2026 Talon Contributors
# Author: dark.lijin@gmail.com
# Licensed under the Talon Community Dual License Agreement.
# See the LICENSE file in the project root for full license information.
#
"""原生库加载器 — 自动查找并加载 libevocore。"""

import ctypes
import os
import platform
import sys
from pathlib import Path


def _find_library() -> str:
    """查找 libevocore 原生库路径。"""
    # 1. 环境变量
    env_path = os.environ.get("EVOCORE_LIB_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path

    # 2. 包内 native/ 目录
    system = platform.system().lower()
    if system == "darwin":
        lib_name = "libevocore.dylib"
    elif system == "windows":
        lib_name = "evocore.dll"
    else:
        lib_name = "libevocore.so"

    pkg_native = Path(__file__).parent / "native" / lib_name
    if pkg_native.exists():
        return str(pkg_native)

    raise FileNotFoundError(
        f"[evocore] Native library not found. "
        f"Install with 'pip install talon-evocore' or set EVOCORE_LIB_PATH."
    )


def load_library():
    """加载 libevocore 并返回 ctypes 句柄。"""
    lib_path = _find_library()
    lib = ctypes.CDLL(lib_path)

    # evo_open(db_path, config_json) -> c_char_p
    lib.evo_open.argtypes = [ctypes.c_char_p, ctypes.c_char_p]
    lib.evo_open.restype = ctypes.c_char_p

    # evo_execute(id, action, params_json) -> c_char_p
    lib.evo_execute.argtypes = [ctypes.c_uint64, ctypes.c_char_p, ctypes.c_char_p]
    lib.evo_execute.restype = ctypes.c_char_p

    # evo_close(id) -> c_char_p
    lib.evo_close.argtypes = [ctypes.c_uint64]
    lib.evo_close.restype = ctypes.c_char_p

    # evo_free_string(ptr)
    lib.evo_free_string.argtypes = [ctypes.c_char_p]
    lib.evo_free_string.restype = None

    return lib
