# clsx 中文上手指南

`clsx` 用来按条件拼接 CSS 类名，返回一个用空格分隔的字符串。比如按钮始终带有 `button`，选中时再加上 `button--active`。它不生成 CSS，也不依赖 React；在 React 中，把返回值交给 `className` 即可。

本文按本仓库的 `clsx 2.1.1` 编写，适合已经有前端项目、刚开始使用 clsx 的同事。

## 1. 安装并验证

先确认本机有 Node.js 和 npm，然后在前端项目的根目录（有 `package.json` 的目录）运行：

```sh
npm install --save clsx
```

这是应用运行时会用到的依赖，不要加 `--save-dev`。

安装后，在同一目录运行：

```sh
node -e "const clsx = require('clsx'); console.log(clsx('button', { 'button--active': true }));"
```

应输出：

```text
button button--active
```

如果提示找不到 `clsx`，确认安装命令已成功，并且安装和验证都在同一个项目目录执行。

在前端的 JavaScript 或 TypeScript 文件中使用：

```js
import clsx from 'clsx';

const isActive = true;
const className = clsx('button', isActive && 'button--active');
console.log(className); // 'button button--active'
```

也可以写成 `import { clsx } from 'clsx'`，两种导入方式任选一种。项目使用 CommonJS 时，则用 `const clsx = require('clsx')`。

## 2. 掌握三种常用写法

`clsx(...inputs)` 可以接收多个参数，结果始终是字符串。

### 字符串：固定类名加条件类名

```js
import clsx from 'clsx';

const isActive = true;
const isDisabled = false;

clsx(
  'button',
  isActive && 'button--active',
  isDisabled && 'button--disabled'
);
// 'button button--active'
```

`条件 && '类名'` 适合按一个开关添加类名。条件为假时不添加；需要二选一时，使用三元表达式：

```js
clsx('button', isActive ? 'button--active' : 'button--idle');
// 'button button--active'
```

### 对象：集中列出状态

对象的键是类名，值按 JavaScript 的真假值判断：值为真就保留键，为假就丢弃。带连字符的键需要加引号。

```js
clsx('button', {
  'button--active': true,
  'button--disabled': false,
});
// 'button button--active'

clsx({ button: 'yes' });
// 'button'，输出的是键，不是值 'yes'
```

### 数组：组合已有的类名列表

数组会递归展开，也能与字符串、对象混用：

```js
clsx('button', ['wide', false, ['rounded']], { active: true });
// 'button wide rounded active'
```

不用为了调用 clsx 特意创建数组；有现成的列表时直接传入即可。

## 3. 放进 React 组件

在已有 React 项目中创建 `ToggleButton.jsx`：

```jsx
import { useState } from 'react';
import clsx from 'clsx';
import './ToggleButton.css';

export default function ToggleButton({ disabled = false, className }) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      className={clsx(
        'button',
        {
          'button--active': active,
          'button--disabled': disabled,
        },
        className
      )}
      onClick={() => setActive(value => !value)}
    >
      {active ? '已选中' : '未选中'}
    </button>
  );
}
```

在同一目录创建 `ToggleButton.css`：

```css
.button {
  padding: 8px 16px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #fff;
  color: #222;
  cursor: pointer;
}

.button--active {
  background: #176b45;
  color: #fff;
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

在 `App.jsx` 中导入并渲染它，路径按实际文件位置调整：

```jsx
import ToggleButton from './ToggleButton';

export default function App() {
  return (
    <>
      <ToggleButton />
      <ToggleButton disabled />
    </>
  );
}
```

用项目已有的启动命令打开页面。点击第一个按钮，应看到文字和背景切换；第二个按钮应呈现禁用状态且无法点击。

组件中的 `className` 参数允许调用方追加类名，未传入时会被 clsx 忽略。`button--disabled` 只负责样式，真正禁止点击的是 HTML 的 `disabled` 属性，不能用类名代替它。

## 4. 分清哪些值会被忽略

普通版会丢弃 `false`、`0`、`''`、`null`、`undefined` 和 `NaN`；单独传入的 `true` 也不会生成类名。

```js
clsx(true, false, 0, '', null, undefined, NaN);
// ''

clsx('item', 2);
// 'item 2'
```

非零数字会转成字符串。不要把计数直接当类名传入；需要根据数量添加状态时，写清判断：

```js
const count = 2;

clsx('item', count > 0 && 'has-items');
// 'item has-items'
```

clsx 只拼接类名，不去重，也不解决 CSS 冲突：

```js
clsx('button', 'button');
// 'button button'

clsx('p-2', 'p-4');
// 'p-2 p-4'
```

使用 Tailwind 时同样如此。不要把“后传入的类名”理解成“一定覆盖前面的样式”；实际效果仍由 CSS 规则决定。

## 5. TypeScript 和 lite 版怎么选

包内已附带类型声明，不需要额外安装 `@types/clsx`。TypeScript 中可以沿用前面的调用写法，返回值类型是 `string`。

刚开始使用时选普通版 `clsx`。只有项目始终使用“字符串加条件字符串”的写法时，才考虑 `clsx/lite`：

```js
import clsx from 'clsx/lite';

clsx('button', true && 'button--active', false && 'button--disabled');
// 'button button--active'

clsx('button', { active: true }, ['wide'], 2);
// 'button'
```

lite 版会忽略所有非字符串参数，包括对象、数组和数字。要使用对象或数组，就从 `clsx` 导入，不要从 `clsx/lite` 导入。

## 6. 遇到问题先查这里

| 现象 | 检查与处理 |
| --- | --- |
| 提示找不到 `clsx` | 在当前应用的 `package.json` 所在目录安装，再执行上面的验证命令。 |
| 对象或数组里的类名没有输出 | 检查是否误用了 `clsx/lite`；需要这些写法时改为 `clsx`。 |
| 类名已经输出，但样式没变化 | 在浏览器开发者工具中查看元素的 `class`，再检查对应 CSS 是否已加载、选择器是否匹配。 |
| 两个类名都保留，样式却不符合预期 | clsx 不处理冲突；检查 CSS 规则，而不是调整 clsx 的参数顺序来赌覆盖效果。 |

更多用法可查看仓库的 [README](../readme.md)。普通版和 lite 版的具体行为分别见 [普通版源码](../src/index.js) 与 [lite 版源码](../src/lite.js)。
