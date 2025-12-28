import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './routes/Dashboard';
import Landing from './routes/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

