import { Navigate, useSearchParams } from 'react-router-dom';

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  return <Navigate to={`/app/feed${queryString ? `?${queryString}` : ''}`} replace />;
}
