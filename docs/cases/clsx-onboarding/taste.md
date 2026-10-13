# clsx 中文上手

当一个元素的类名要随状态变化时，用 `clsx` 把固定类名和条件类名拼成一个字符串，再交给 `className`。它只负责拼类名，样式仍由你项目中的 CSS 提供。

## 1. 安装并跑通第一个例子

在已有前端项目的根目录（包含 `package.json` 的目录）运行：

```sh
npm install --save clsx
```

在项目的 JavaScript 或 TypeScript 文件中导入：

```js
import clsx from 'clsx';

const isActive = true;
const isDisabled = false;

const className = clsx('button', {
  'button--active': isActive,
  'button--disabled': isDisabled,
});

console.log(className);
// 输出：'button button--active'
```

把 `isActive` 改成 `false`，结果就只剩 `'button'`。在项目现有的开发环境中运行这段代码，查看控制台输出即可确认。

也支持具名导入，两种写法选一种即可：

```js
import { clsx } from 'clsx';
```

包内已包含 TypeScript 类型声明，无需另装 `@types/clsx`。

## 2. 根据条件加入类名

`clsx(...inputs)` 可以接收多个参数，返回用空格分隔的类名字符串。先掌握字符串和对象两种写法。

**字符串：**固定类名直接传入；条件类名用 `条件 && '类名'`。

```js
const isActive = true;
const isDisabled = false;

clsx('button', isActive && 'button--active', isDisabled && 'button--disabled');
// => 'button button--active'
```

**对象：**键是类名，值决定是否加入；值为真值（truthy）时加入，为假值（falsy）时跳过。带连字符的键要加引号。

```js
clsx('button', {
  'button--active': true,
  'button--disabled': false,
});
// => 'button button--active'
```

值不会变成类名。例如下面加入的是 `button--loading`，不是 `loading`：

```js
clsx({ 'button--loading': 'loading' });
// => 'button--loading'
```

**数组：**可以把已有的类名列表传进来，嵌套数组也会展开；数组、对象和字符串可以混用。

```js
clsx('button', ['rounded', false, ['shadow']], { 'button--active': true });
// => 'button rounded shadow button--active'
```

### 哪些值会被跳过？

假值（包括 `false`、`''`、`null`、`undefined`、`0`、`NaN`）会被跳过，单独传入的 `true` 也不会生成类名：

```js
clsx(true, false, '', null, undefined, 0, NaN);
// => ''
```

因此，直接传入布尔状态不会得到类名，要写出状态对应的字符串或对象键。非零数字会被转换成字符串，不要把计数当作类名直接传入：

```js
const count = 3;

clsx('badge', count);
// => 'badge 3'

clsx('badge', count > 0 && 'badge--visible');
// => 'badge badge--visible'
```

## 3. 在 React 按钮中使用

在已有 React 项目中创建 `Button.jsx`：

```jsx
import clsx from 'clsx';
import './Button.css';

export default function Button({
  active = false,
  disabled = false,
  className,
  children,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        'button',
        {
          'button--active': active,
          'button--disabled': disabled,
        },
        className,
      )}
    >
      {children}
    </button>
  );
}
```

在同一目录创建 `Button.css`：

```css
.button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  color: #222;
}

.button--active {
  background: #1d4ed8;
  color: white;
}

.button--disabled {
  opacity: 0.5;
}
```

在同一目录的页面组件中使用：

```jsx
import Button from './Button';

export default function App() {
  return (
    <div>
      <Button>普通按钮</Button>
      <Button active>选中按钮</Button>
      <Button disabled>禁用按钮</Button>
      <Button active className="toolbar-button">工具栏按钮</Button>
    </div>
  );
}
```

选中按钮会有 `class="button button--active"`；禁用按钮会有 `class="button button--disabled"`，并由 HTML 的 `disabled` 属性阻止点击。只添加禁用样式类，不会让按钮真的禁用。

把外部传入的 `className` 一起拼接，可以让调用方追加类名。`clsx` 不会去重或解决样式冲突：`clsx('button', 'button')` 仍返回 `'button button'`。把某个类名放在参数末尾，也不代表它的 CSS 一定优先；样式优先级仍由 CSS 规则决定。

## 4. 什么时候用 `clsx/lite`？

刚开始使用时选默认的 `clsx`，它支持上面的所有写法。只有确定全部使用字符串拼接、不需要对象或数组时，才换成 `clsx/lite`：

```js
import clsx from 'clsx/lite';

const isActive = true;

clsx('button', isActive && 'button--active');
// => 'button button--active'
```

`lite` 会忽略所有非字符串参数，包括对象和数组：

```js
clsx({ 'button--active': true }, ['button']);
// => ''
```

如果用了对象或数组却没有得到类名，检查导入路径；换回 `import clsx from 'clsx'` 即可。
