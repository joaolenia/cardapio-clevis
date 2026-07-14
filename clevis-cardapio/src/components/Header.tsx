import React from 'react';
export const Header: React.FC = () => {
  return (
    <header className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="brand-title">CLEVI'S</h1>
        {/* CORRIGIDO: de class para className */}
        <p className="brand-subtitle">
          <span>LANCHES</span> • <span>SUSHI</span> • <span>SORVETES</span> • <span>CHOPP</span>
        </p>
        <div className="shop-info">
          <span className="status-badge"><i className="fa-solid fa-circle"></i> Aberto Agora</span>
          {/* CORRIGIDO: de class para className */}
          <span className="delivery-time"><i className="fa-solid fa-clock"></i> 40-50 min</span>
        </div>
      </div>
    </header>
  );
};