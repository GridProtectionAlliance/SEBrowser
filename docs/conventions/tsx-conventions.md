# React/TSX Component Conventions

These conventions define the shape of a well-formed component file. Follow them
when writing new components; check against them when reviewing or refactoring.
The goal is that any developer can open any component and find things in the
same place every time: constants at top, hooks grouped by kind, JSX in the
middle, pure helpers at the bottom.

When editing an existing file, match what's already there for anything not
covered here — never reformat unrelated code just to satisfy a rule.

## File anatomy

Every component file follows this top-to-bottom order:

```
1. License/file header comment (if project uses one — copy an existing file's)
2. Imports (React first, then third-party, then project imports)
3. Props interface(s)
5. Module-level constants and default objects
6. The component
7. Pure helper functions
8. export default ComponentName;
```

### One component per file

Each exported component gets its own file, named after the component
(`AdapterStateBadge.tsx` exports `AdapterStateBadge`). Small private
sub-components used only by this component (a `HeaderContent`, a table row)
may live in the same file below the main component — they still get their own
props interface.

### Constants at the top

Anything that doesn't depend on props or state is module-level, defined above
the component: option lists, default records, page sizes, format strings.

```ts
const PAGE_SIZE = 25;
const format = 'MM/DD/YYYY HH:mm:ss.SSS';
const limitClauseOptions = [
    { Label: "TOP", Value: "TOP" },
    { Label: "ALL", Value: "ALL" },
]
```

If it's inside the component but never uses props/state/hooks, move it out.

### Pure functions at the bottom

Any function that doesn't touch component state belongs outside the component
body, placed **before** the `export default` line at the bottom of the file.
Export them (named) only if another file reuses them. This keeps the component
body focused on state and rendering, and keeps helpers from being re-created
per render.

```ts

const getClassName = (status: ServiceStatus) => {
    switch (status) {
        case ServiceStatus.Normal: return 'badge-success';
        ...
    }
}

export default AdapterStateBadge;
```

## Props

### Document every prop

Add a JSDoc comment immediately above every property in a props interface.
Describe what the prop provides or controls; for callbacks, describe when the
component invokes it.

```ts
interface IProps {
    /** The adapter record displayed by the component. */
    Adapter: Common.IAdapter;
    /** Called after the user saves a valid adapter change. */
    OnSave: (adapter: Common.IAdapter) => void;
}
```

### Every component takes an interface

No inline prop type literals. Declare an interface — `IProps` for the file's
main component, `I<Name>Props` for secondary components in the same file
(`IHeaderContentProps`). Interface names are prefixed with `I`. Generic
components parameterize the interface: `IProps<T>`.

### Props are PascalCase

`HeaderText`, `SetIsCardOpen`, `IsOpenByDefault` — not `headerText`. Callback
props are verbs in PascalCase (`SetRecord`, `HandleSave`, `OnClick`); boolean
props read as assertions (`IsCardEnabled`, `Disabled`, `AllowSort`).

### Accessing props

Either destructure in the signature or use `props.X` — but pick one per
component. Prefer destructuring when the component takes function(s) as props, with one
prop per line:

```ts
const AdapterStateBadge = ({
    AdapterAcronym,
    AdapterType,
    RefreshIntervalMs
}: IProps) => {
```

## Component body ordering

Inside the component, group by kind, in this order:

```
1. Context / store / ref hooks   (usePageContext, useAppSelector, useRef)
2. State                          (all useState together)
3. Derived values                 (all useMemo together)
4. Effects                        (all useEffect together)
5. Callbacks / handlers           (all useCallback / handler fns together)
6. Early returns                  (null guards, loading states)
7. return ( ...JSX... )
```

Additional rules within this structure:

- **Type state explicitly**: `React.useState<boolean>(false)`,
  `React.useState<Application.Types.Status>('uninitiated')`.
- **Comment each effect** with one or two lines immediately above it explaining
  the purpose of the effect and, when useful, what causes it to run. Describe
  the behavior specifically rather than restating that it is an effect.

  ```ts
  // Load the adapter commands whenever the selected adapter changes.
  React.useEffect(() => {
      ...
  }, [SelectedAdapter]);
  ```
- **Effects that fetch must clean up**: abort the request handle in the
  cleanup function.

  ```ts
  return () => {
      if (handle?.abort != null) handle.abort();
  }
  ```

- **Track async status** with the Application.Types.Status rather than ad-hoc booleans.
- **Local handlers** are camelCase `handleX` (`handleSetMax`, `handleToggle`);
  memoized callbacks passed down as props may be PascalCase to match the prop
  they fill (`GetAdapterCommands`).
- **Early returns** come after all hooks, before the JSX:
  `if (SelectedRecord == null) return <></>`.

## JSX formatting

### Multiline props

When a component invocation takes more than two props, put each prop on its
own line with the closing `>` aligned:

```tsx
<TextArea<Common.IAdapter>
    Record={SelectedRecord}
    Field='ConnectionString'
    Label=''
    Rows={4}
    Setter={EditSelectedRecord}
    Disabled={props.Disabled}
/>
```

One or two short props can stay inline: `<ReactIcons.Warning Color='red' />`.

### Conditional rendering

Use explicit ternaries against `null`, not `&&` short-circuits (which can leak
`0` or `''` into the output):

```tsx
{props.IsCardEnabled ?
    <CollapsibleCard ... >
        ...
    </CollapsibleCard>
    : null}
```

## Null handling and misc semantics
- Prefer `??` for defaults: `const disabled = Disabled ?? false;`.
- Arrow-function components: `const Card = (props: IProps) => { ... }`.
- Namespace React import (`import * as React from 'react'`) with qualified
  hooks (`React.useState`, `React.useEffect`) — don't destructure hooks from
  the import.

## JSDoc

Use JSDoc comments for every function and component.

- Add a short, simple JSDoc summary immediately above each component
  declaration.
- Keep JSDoc for internal functions concise, usually a single-line summary.
- Give exported functions slightly more complete documentation because callers
  cannot rely on the implementation for context. Describe the public behavior
  and document parameters, return values, and important constraints when they
  are not obvious from the types.

```ts
/** Displays the current state of an adapter. */
const AdapterStateBadge = (props: IProps) => {
    ...
}

/** Returns the CSS class for a service status. */
const getClassName = (status: ServiceStatus) => {
    ...
}

/**
 * Formats an adapter name for display throughout the application.
 *
 * @param adapter - The adapter whose name should be formatted.
 * @returns The display name, or the adapter acronym when no name is available.
 */
export const formatAdapterName = (adapter: Common.IAdapter) => {
    ...
}
```

## Applying these conventions

**Writing a new component**: follow the file anatomy top to bottom; it doubles
as a checklist.

**Reviewing/auditing existing components**: scan for violations in this
priority order — they're ordered by how much they hurt readability:

1. Pure functions defined inside the component body (re-created every render,
   clutters the state logic) → move below `export default`.
2. Missing or inline props typing → introduce `IProps`.
3. camelCase or inconsistently named props → PascalCase (note: renaming props
   is a breaking change for callers — find and update all usages, or flag it
   instead of renaming if the component is widely used).
4. Interleaved hooks (state/effect/state/callback mixed) → regroup by kind.
5. Constants defined inside the component → hoist to module level.
6. Multiple unrelated exported components in one file → split files (update
   imports at all call sites).
7. Single-line JSX invocations with many props → multiline.
8. `&&` conditional rendering → ternary with `: null`.

When auditing, report findings file-by-file before fixing, unless the user
asked you to just fix everything. Structural moves (1, 4, 5) are
behavior-preserving and safe; renames and file splits (3, 6) touch other files
— call those out explicitly. After any refactor, run the project's type-check
or build to verify nothing broke.