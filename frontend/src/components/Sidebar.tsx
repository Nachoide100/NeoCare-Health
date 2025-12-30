import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  if (!open) return null;

  return (
    <nav style={{ width: '240px', background: '#f4f5f7', padding: '16px', boxSizing: 'border-box' }}>
      <h3 style={{ marginTop: 0 }}>NeoCare</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '8px' }}>
          <Link to="/board">Mi Tablero</Link>
        </li>
        <li style={{ marginBottom: '8px' }}>
          <Link to="/my-hours">Mis Horas</Link>
        </li>
        <li style={{ marginBottom: '8px' }}>
          <Link to="/report">Informe</Link>
        </li>
        <li style={{ marginTop: '16px' }}>
          <Link to="/logout">Cerrar Sesión</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
