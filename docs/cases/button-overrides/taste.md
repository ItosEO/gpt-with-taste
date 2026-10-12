# Button Class Name Guide

Use a shared `cn` helper that runs `clsx` first, then `tailwind-merge`.
`clsx` handles conditional inputs; `tailwind-merge` removes conflicting Tailwind
utilities. Pass the caller's `className` last so it overrides base and variant
styles.

Using `clsx` alone leaves both `px-4` and `px-6` in the class string. The order of
classes in HTML does not decide which CSS rule wins, so simply appending caller
classes is not a reliable override.

## Create the helper

For Tailwind CSS 4, install:

```sh
npm install clsx tailwind-merge
```

For Tailwind CSS 3, use `npm install clsx tailwind-merge@2.6.0` instead.

Create `cn.ts` alongside the component (or in your shared utilities directory):

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Merge defaults, variant styles, then caller classes

```tsx
import type { ReactNode } from 'react';
import { cn } from './cn';

type ButtonProps = {
  className?: string;
  variant?: 'primary' | 'secondary';
  children?: ReactNode;
};

export function Button({ className, variant, children }: ButtonProps) {
  return (
    <button
      className={cn(
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

Callers can now override just the utilities they need:

```tsx
<Button variant="primary" className="px-6 bg-red-500">
  Delete
</Button>
```

The resulting class string is:

```text
py-2 rounded font-medium text-white px-6 bg-red-500
```

`px-6` replaces `px-4`, and `bg-red-500` replaces `bg-blue-600`.
Non-conflicting defaults, including `py-2` and `text-white`, remain.

Overrides apply within the same modifier context. For example:

```ts
cn('px-4 hover:bg-blue-600', 'px-6 hover:bg-red-500');
// => 'px-6 hover:bg-red-500'

cn('px-4', 'md:px-6');
// => 'px-4 md:px-6'
```

To replace a `hover:` or responsive default, pass a utility with the matching
modifier. If your project adds custom utilities with new conflict groups or a
Tailwind prefix, configure `tailwind-merge` to recognize them before relying on
overrides.
