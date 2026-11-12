import { useCallback, useEffect, useState } from 'react';

// Tiny router: the current page lives in the URL hash (#/ or #/rooms/<id>),
// so refreshing the page or using back/forward keeps you on the same screen.
const currentPath = () => window.location.hash.replace(/^#/, '') || '/';

export function useHashRoute() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to) => {
    window.location.hash = to;
  }, []);

  return [path, navigate];
}
