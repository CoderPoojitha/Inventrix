import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#0c0b0f] text-[#f5f3ef] font-sans antialiased overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0c0b0f] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
