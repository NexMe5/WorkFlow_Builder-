import { lazy, Suspense, useEffect, useState } from 'react';
import LandingPage from '../pages/landing/LandingPage';

const BuilderPage = lazy(() => import('../features/pipeline-builder/BuilderPage'));

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => setPath(window.location.pathname);

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (path === '/builder') {
    return (
      <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading" />}>
        <BuilderPage />
      </Suspense>
    );
  }

  return <LandingPage />;
}
