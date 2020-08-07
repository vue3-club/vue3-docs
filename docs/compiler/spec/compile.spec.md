###  compile.spec

`parse` 顾名思义，解析的意思，在这里指的是将 `Dom` 解析成 `Ast` 格式的数据，我们先来看一下测试结果

```js
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   3 passed, 3 total
Time:        6.933s
```
从结果中我们看到一共 `Tests` (单元) 3个，`Snapshots`(快照) 3个

### 文本解析



```js
import { ParserOptions } from '../src/options'
import { baseParse, TextModes } from '../src/parse'
import { ErrorCodes } from '../src/errors'
import {
  CommentNode,
  ElementNode,
  ElementTypes,
  Namespaces,
  NodeTypes,
  Position,
  TextNode,
  InterpolationNode
} from '../src/ast'
```

