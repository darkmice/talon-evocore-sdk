# 🧠 Talon EvoCore SDK

**两行代码，赋予 AI 进化的灵魂。**

多语言 SDK，支持 Node.js / Go / Python / Rust / PHP / .NET / Java。

## 架构

EvoCore 是闭源产品。SDK 通过 FFI 调用预编译的原生库 (`libevocore.{so|dylib|dll}`)。
安装 SDK 时会自动从 Release 服务器下载对应平台的二进制文件。

```
┌──────────────────────────────────────────┐
│  Your Application (Node.js/Go/Python/…)  │
├──────────────────────────────────────────┤
│  EvoCore SDK (Language-specific wrapper) │
├──────────────────────────────────────────┤
│  FFI (C ABI: JSON in → JSON out)         │
├──────────────────────────────────────────┤
│  libevocore.{so|dylib|dll}  (闭源)       │
│  ├── Talon EvoCore (进化引擎)            │
│  ├── Talon AI Engine (AI 能力层)         │
│  └── Talon Engine (数据引擎)             │
└──────────────────────────────────────────┘
```

## FFI 接口

所有 SDK 调用相同的 4 个 C 函数：

| 函数 | 签名 | 说明 |
|------|------|------|
| `evo_open` | `(db_path: *c_char, config_json: *c_char) -> *c_char` | 创建实例 |
| `evo_execute` | `(id: u64, action: *c_char, params: *c_char) -> *c_char` | 执行命令 |
| `evo_close` | `(id: u64) -> *c_char` | 关闭实例 |
| `evo_free_string` | `(ptr: *c_char)` | 释放返回的字符串 |

## 支持平台

| 平台 | 架构 | 库文件 |
|------|------|--------|
| macOS | arm64 / x86_64 | `libevocore.dylib` |
| Linux | x86_64 / arm64 | `libevocore.so` |
| Windows | x86_64 | `evocore.dll` |

## 各语言 SDK

| 语言 | 目录 | 包管理 | FFI 方式 |
|------|------|--------|----------|
| Node.js | `nodejs/` | npm | koffi |
| Go | `go/` | go modules | CGO |
| Python | `python/` | pip | ctypes |
| Rust | `rust/` | cargo | 原生依赖 |
| PHP | `php/` | composer | FFI ext |
| .NET | `dotnet/` | NuGet | P/Invoke |
| Java | `java/` | Maven | JNA |

## 快速开始

### Node.js
```bash
npm install talon-evocore
```
```javascript
const { EvoCore } = require('talon-evocore');
const evo = new EvoCore('./data');
const result = evo.learn({
  domain: 'coding',
  task_type: 'review',
  success: true,
});
console.log(result.strategy_used);
```

### Python
```bash
pip install talon-evocore
```
```python
from talon_evocore import EvoCore
evo = EvoCore('./data')
result = evo.learn(domain='coding', task_type='review', success=True)
print(result['strategy_used'])
```

### Go
```go
import evocore "github.com/darkmice/talon-evocore-sdk/go"
evo, _ := evocore.Open("./data", nil)
defer evo.Close()
result, _ := evo.Learn(evocore.LearningInput{
    Domain:   "coding",
    TaskType: "review",
    Success:  true,
})
```

## License

Commercial. See LICENSE file.
