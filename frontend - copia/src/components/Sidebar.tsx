import React from 'react';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  if (!open) return null; // Simple control for visibility based on 'open' prop

  return (
    <div style={{ width: '240px', background: '#f4f5f7', padding: '16px', boxSizing: 'border-box' }}>
      {/* Sidebar content goes here */}
      <h3>Sidebar</h3>
      <ul>
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
      </ul>
    </div>
  );
};

export default Sidebar;
