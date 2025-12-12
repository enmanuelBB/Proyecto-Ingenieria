"use client";

import React from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import styles from './dashboard.module.css';
import Sidebar from '../components/Sidebar';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />
            <main className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ''}`}>
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
    );
}
