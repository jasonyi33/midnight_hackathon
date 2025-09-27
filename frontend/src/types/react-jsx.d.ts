// Minimal JSX declarations to satisfy TypeScript in environments where React types
// are not yet installed. This is a stop-gap to allow the editor/typechecker to
// recognize JSX intrinsic elements. Installing `@types/react` is the recommended
// long-term fix.

declare namespace JSX {
  // Allow any intrinsic element name with any props to avoid "JSX.IntrinsicElements"
  // missing errors in editors before dependencies are installed.
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
