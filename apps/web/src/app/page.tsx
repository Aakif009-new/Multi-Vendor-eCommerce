'use client';

import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<string>('Connecting...');
  const [backendMessage, setBackendMessage] = useState<string>('');

  useEffect(() => {
    // Client-side API fetch to verify frontend-backend communication
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBackendStatus('Healthy');
        setBackendMessage(data.message || 'Connected successfully!');
      })
      .catch((err) => {
        setBackendStatus('Failed');
        setBackendMessage(err.message || 'Could not reach backend API');
        console.error('Error connecting to backend:', err);
      });
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      maxWidth: '600px',
      margin: '4rem auto',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{ color: '#2563eb', margin: '0 0 1rem 0' }}>Multi-Vendor Marketplace</h1>
      <p style={{ color: '#475569', fontSize: '1.1rem' }}>
        Welcome to the containerized development environment.
      </p>
      
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        borderLeft: '4px solid ' + (backendStatus === 'Healthy' ? '#22c55e' : backendStatus === 'Failed' ? '#ef4444' : '#eab308')
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Backend Connection Status</h3>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Status: <span style={{
            color: backendStatus === 'Healthy' ? '#22c55e' : backendStatus === 'Failed' ? '#ef4444' : '#eab308'
          }}>{backendStatus}</span>
        </p>
        {backendMessage && (
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Response: <em>{backendMessage}</em>
          </p>
        )}
      </div>
    </div>
  );
}
