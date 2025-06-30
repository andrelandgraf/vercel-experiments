import React, { useCallback, useEffect, useMemo, useState } from "react";

export type Route = {
  path: string;
  component: React.ComponentType<any>;
};

type RouterState = {
  url: URL;
  search: Record<string, string>;
  params: Record<string, string>;
};

type RouterContextValue = RouterState & {
  navigate: (to: string, options?: { replace?: boolean }) => void;
};

const RouterContext = React.createContext<RouterContextValue | undefined>(
  undefined,
);

function parseSearch(url: URL): Record<string, string> {
  const search: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    search[key] = value;
  });
  return search;
}

function matchRoute(pathname: string, routes: Route[]) {
  for (const route of routes) {
    const names: string[] = [];
    const pattern = route.path
      .split("/")
      .map((segment) => {
        if (segment.startsWith(":")) {
          names.push(segment.slice(1));
          return "([^/]+)";
        }
        return segment.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      })
      .join("/");
    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      names.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      return { component: route.component, params };
    }
  }
  return null;
}

function createState(url: URL, routes: Route[]): RouterState {
  const match = matchRoute(url.pathname, routes);
  return {
    url,
    search: parseSearch(url),
    params: match?.params ?? {},
  };
}

export type RouterProps = {
  routes: Route[];
  children?: React.ReactNode;
};

export function Router({ routes, children }: RouterProps) {
  const [state, setState] = useState(() =>
    createState(new URL(window.location.href), routes),
  );

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      const url = new URL(to, window.location.origin);
      if (options?.replace) {
        window.history.replaceState(null, "", url.toString());
      } else {
        window.history.pushState(null, "", url.toString());
      }
      setState(createState(url, routes));
    },
    [routes],
  );

  useEffect(() => {
    const handler = () => {
      setState(createState(new URL(window.location.href), routes));
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [routes]);

  const value = useMemo<RouterContextValue>(
    () => ({ ...state, navigate }),
    [state, navigate],
  );

  const match = matchRoute(state.url.pathname, routes);
  const Component = match?.component ?? React.Fragment;

  return (
    <RouterContext.Provider value={value}>
      <Component />
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = React.useContext(RouterContext);
  if (!ctx) throw new Error("useNavigate must be used within Router");
  return ctx.navigate;
}

export function useRouterState() {
  const ctx = React.useContext(RouterContext);
  if (!ctx) throw new Error("useRouterState must be used within Router");
  const { url, search, params } = ctx;
  return { url, search, params };
}

export type LinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  to: string;
  replace?: boolean;
};

export function Link({ to, replace, ...props }: LinkProps) {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to, { replace });
  };
  return <a href={to} onClick={handleClick} {...props} />;
}
