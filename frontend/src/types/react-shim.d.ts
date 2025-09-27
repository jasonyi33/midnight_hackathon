// Minimal React + JSX shims to avoid editor/typechecker errors when
// @types/react isn't installed. This is a temporary, local workaround.
// Long-term: install the real packages `react`, `@types/react`, and
// `@types/react-dom` in the frontend project's node_modules.

declare module 'react' {
  // Basic exports commonly used across the codebase
  export type ReactNode = any;
  export type ReactElement = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null;
  export const Fragment: any;
  export function createElement(type: any, props?: any, ...children: any[]): any;
  const React: {
    createElement: typeof createElement;
    Fragment: any;
  };
  export default React;
}

declare module 'react-dom' {
  export function render(el: any, container: any): any;
  export function createRoot(container: any): { render(el: any): void };
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props?: any): any;
  export function jsxs(type: any, props?: any): any;
  export function jsxDEV(type: any, props?: any): any;
}

// Provide a JSX namespace so TS recognizes JSX elements in .tsx files.
declare global {
  namespace JSX {
    // Allow any intrinsic element name with any props.
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    // Minimal element/children typings
    type Element = any;
    type ElementClass = any;
    interface ElementAttributesProperty { props: any }
    interface ElementChildrenAttribute { children: any }
  }
}

export {};
