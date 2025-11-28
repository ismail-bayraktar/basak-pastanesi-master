// Basit test component - syntax hatası kontrolü için
import React from 'react';

const TestApp: React.FC = () => {
  console.log('✅ TestApp rendering...');
  
  return (
    <div style={{ padding: '20px', background: '#F9F7E8', minHeight: '100vh' }}>
      <h1 style={{ color: '#FF7A00' }}>✅ React Çalışıyor!</h1>
      <p>Eğer bu mesajı görüyorsanız, React ve Vite düzgün çalışıyor.</p>
      <p>Şimdi gerçek App component'ini yükleyelim...</p>
    </div>
  );
};

export default TestApp;

