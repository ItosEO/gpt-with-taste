# Button Class Name Guide

Use `clsx` to combine conditional classes, then `tailwind-merge` to remove
conflicting Tailwind utilities. `clsx` alone leaves both `px-4` and `px-6` in
the result; putting a class last in the HTML attribute does not guarantee it
wins, because CSS precedence depends on the generated stylesheet.

## Create a shared helper

Install the dependencies for Tailwind CSS 4:

```sh
npm install clsx tailwind-merge
```

For Tailwind CSS 3, use `npm install clsx tailwind-merge@2.6.0` instead.
If your project defines custom utilities or changes Tailwind's utility groups,
configure `tailwind-merge` to match before relying on those overrides.

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Merge caller classes last

Replace the component's `clsx` call with `cn`. Keep the order as base classes,
variant classes, then the caller's `className`, so later conflicting utilities
replace earlier ones:

```tsx
import { cn } from './lib/utils';

export function Button({ className, variant, children }) {
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

Callers can now override padding and the primary background:

```tsx
<Button variant="primary" className="px-6 bg-red-500">
  Delete
</Button>
```

The resulting class string is:

```text
py-2 rounded font-medium text-white px-6 bg-red-500
```

`px-4` and `bg-blue-600` are removed; non-conflicting defaults stay intact.
Without a caller's `className`, the base and variant classes remain unchanged.
Overrides must target the same modifier: `hover:bg-red-500` overrides an earlier
`hover:bg-blue-600`, not an unprefixed `bg-blue-600`.
