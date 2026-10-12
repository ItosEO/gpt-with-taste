# Task and starting document

Model: GPT-6.1 Sol, reasoning effort: high. Both runs used native Codex 0.162.0-alpha.17.2 with Hooks disabled.

## User request

> Please inspect BUTTON_GUIDE.md and update it so callers can safely override Tailwind utility classes without conflicts, showing the recommended helper and usage pattern.

## Starting BUTTON_GUIDE.md

````markdown
# Button Class Name Guide

Our component currently combines classes like this:

```tsx
import { clsx } from 'clsx';

export function Button({ className, variant, children }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded font-medium',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-black',
        className
      )}
    >
      {children}
    </button>
  );
}
```

Sometimes callers pass conflicting Tailwind classes like `px-6` or `bg-red-500`.
````
