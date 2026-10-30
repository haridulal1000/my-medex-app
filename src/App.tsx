import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@components/errors/ErrorBoundary';
import ServiceExplorerPage from '@page/ServiceExplorerPage';
import NotFoundPage from '@page/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<ServiceExplorerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}