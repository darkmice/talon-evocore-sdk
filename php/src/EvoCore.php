<?php
/*
 * Copyright (c) 2026 Talon Contributors
 * Author: dark.lijin@gmail.com
 * Licensed under the Talon Community Dual License Agreement.
 * See the LICENSE file in the project root for full license information.
 */

declare(strict_types=1);

namespace Talon\EvoCore;

/**
 * Talon EvoCore — AI 自进化运行时 PHP SDK。
 *
 * 两行代码，赋予 AI 进化的灵魂。
 *
 * @example
 * $evo = new EvoCore('./data');
 * $result = $evo->learn(['domain' => 'coding', 'task_type' => 'review', 'success' => true]);
 */
class EvoCore
{
    private \FFI $ffi;
    private int $id;

    public function __construct(string $dbPath, ?array $config = null)
    {
        $headerDef = <<<CDEF
        char* evo_open(const char* db_path, const char* config_json);
        char* evo_execute(unsigned long long id, const char* action, const char* params_json);
        char* evo_close(unsigned long long id);
        void  evo_free_string(char* ptr);
        CDEF;

        $libPath = $this->findLibrary();
        $this->ffi = \FFI::cdef($headerDef, $libPath);

        $configJson = $config !== null ? json_encode($config) : null;
        $result = $this->parseResult($this->ffi->evo_open($dbPath, $configJson));
        $this->id = (int) $result['id'];
    }

    /** 执行后学习。 */
    public function learn(array $input): array
    {
        return $this->execute('learn', $input);
    }

    /** 推荐策略。 */
    public function recommendStrategy(array $signals): array
    {
        return $this->execute('recommend_strategy', ['signals' => $signals]);
    }

    /** 技能进化。 */
    public function evolveSkill(string $skillName): ?array
    {
        $result = $this->execute('evolve_skill', ['skill_name' => $skillName]);
        return isset($result['skipped']) ? null : $result;
    }

    /** 个性快照。 */
    public function personalitySnapshot(): array
    {
        return $this->execute('personality_snapshot', []);
    }

    /** 进化报告。 */
    public function evolutionReport(int $slowThresholdMs = 5000): array
    {
        return $this->execute('evolution_report', ['slow_threshold_ms' => $slowThresholdMs]);
    }

    /** 关闭实例。 */
    public function close(): void
    {
        if (isset($this->id)) {
            $this->ffi->evo_close($this->id);
            unset($this->id);
        }
    }

    public function __destruct()
    {
        $this->close();
    }

    private function execute(string $action, array $params): array
    {
        $raw = $this->ffi->evo_execute($this->id, $action, json_encode($params));
        return $this->parseResult($raw);
    }

    private function parseResult(string $raw): array
    {
        $data = json_decode($raw, true);
        if (!($data['ok'] ?? false)) {
            throw new \RuntimeException('[evocore] ' . ($data['error'] ?? 'unknown error'));
        }
        return $data['data'] ?? [];
    }

    private function findLibrary(): string
    {
        $env = getenv('EVOCORE_LIB_PATH');
        if ($env && file_exists($env)) return $env;

        $libName = PHP_OS_FAMILY === 'Darwin' ? 'libevocore.dylib'
            : (PHP_OS_FAMILY === 'Windows' ? 'evocore.dll' : 'libevocore.so');
        $pkgPath = __DIR__ . '/../native/' . $libName;
        if (file_exists($pkgPath)) return realpath($pkgPath);

        throw new \RuntimeException(
            "[evocore] Native library not found. Set EVOCORE_LIB_PATH."
        );
    }
}
