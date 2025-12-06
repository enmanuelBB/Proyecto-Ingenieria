"use client";

import React from 'react';
import ExportDataView from '../components/ExportDataView';
import Sidebar from '../components/Sidebar';
import styles from '../dashboard/dashboard.module.css';

export default function ExportDataPage() {
    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />
            <main className={styles.mainContent} style={{ padding: 0 }}>
                <ExportDataView />
            </main>
        </div>
    );
}