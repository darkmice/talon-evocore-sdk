#
# Copyright (c) 2026 Talon Contributors
# Author: dark.lijin@gmail.com
# Licensed under the Talon Community Dual License Agreement.
# See the LICENSE file in the project root for full license information.
#
"""EvoCore Python 客户端。"""

import json
from typing import Any, Dict, List, Optional, Tuple

from talon_evocore._native import load_library


class EvoCore:
    """Talon EvoCore — 会记忆、会学习、会生长的 AI 运行时。

    Example::

        evo = EvoCore('./data')
        result = evo.learn(domain='coding', task_type='review', success=True)
        print(result['strategy_used'])
    """

    def __init__(self, db_path: str, config: Optional[Dict] = None):
        self._lib = load_library()
        config_json = json.dumps(config).encode() if config else None
        result = self._parse(self._lib.evo_open(db_path.encode(), config_json))
        self._id = result["id"]

    def learn(
        self,
        domain: str = "general",
        task_type: str = "unknown",
        success: bool = True,
        complexity: int = 50,
        strategy: str = "balanced",
        skill_name: Optional[str] = None,
        error_type: Optional[str] = None,
        execution_id: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """执行后学习 — 触发完整进化周期。"""
        params = {
            "domain": domain,
            "task_type": task_type,
            "success": success,
            "complexity": complexity,
            "strategy": strategy,
        }
        if skill_name:
            params["skill_name"] = skill_name
        if error_type:
            params["error_type"] = error_type
        if execution_id:
            params["execution_id"] = execution_id
        params.update(kwargs)
        return self._exec("learn", params)

    def recommend_strategy(self, signals: List[str]) -> Dict[str, Any]:
        """推荐策略。"""
        return self._exec("recommend_strategy", {"signals": signals})

    def evolve_skill(self, skill_name: str) -> Optional[Dict[str, Any]]:
        """技能进化。"""
        result = self._exec("evolve_skill", {"skill_name": skill_name})
        return None if result.get("skipped") else result

    def personality_snapshot(self) -> Dict[str, Any]:
        """获取个性快照。"""
        return self._exec("personality_snapshot", {})

    def evolution_report(self, slow_threshold_ms: int = 5000) -> Dict[str, Any]:
        """获取进化报告。"""
        return self._exec("evolution_report", {"slow_threshold_ms": slow_threshold_ms})

    def store_evolution_memory(
        self, content: str, domain: str, ttl_secs: Optional[int] = None
    ) -> Dict[str, Any]:
        """存储进化记忆。"""
        params = {"content": content, "domain": domain}
        if ttl_secs is not None:
            params["ttl_secs"] = ttl_secs
        return self._exec("store_evolution_memory", params)

    def recall_evolution_memory(
        self, query: str, top_k: int = 10
    ) -> Dict[str, Any]:
        """召回进化记忆。"""
        return self._exec("recall_evolution_memory", {"query": query, "top_k": top_k})

    def close(self):
        """关闭实例。"""
        if self._id is not None:
            self._lib.evo_close(self._id)
            self._id = None

    def __del__(self):
        self.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    def _exec(self, action: str, params: Dict) -> Dict[str, Any]:
        if self._id is None:
            raise RuntimeError("EvoCore instance is closed")
        result = self._lib.evo_execute(
            self._id, action.encode(), json.dumps(params).encode()
        )
        return self._parse(result)

    @staticmethod
    def _parse(raw: bytes) -> Dict[str, Any]:
        data = json.loads(raw.decode())
        if not data.get("ok"):
            raise RuntimeError(data.get("error", "unknown error"))
        return data.get("data", {})
