import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ScenarioViewer from './pages/ScenarioViewer.jsx';
import Help from './pages/Help.jsx'; // Adicione esta linha

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/ver/:scenarioId',
    element: <ScenarioViewer />,
  },
  {
    path: '/help', // Adicione esta rota
    element: <Help />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
