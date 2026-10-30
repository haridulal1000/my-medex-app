import ServiceExplorerPage from '@page/ServiceExplorerPage';
import { Route, Routes } from 'react-router-dom';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ServiceExplorerPage />} />
    </Routes>
  );
}