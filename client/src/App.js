import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes de páginas
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

// Componentes de layout
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      {/* Rutas principales - sin autenticación */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="equipos" element={<Equipos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App; 