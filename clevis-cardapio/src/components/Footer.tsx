import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '20px', 
      fontSize: '0.8rem', 
      color: '#777e90', 
      marginTop: '40px',
      borderTop: '1px solid #232627' 
    }}>
      <p style={{ margin: '5px 0' }}>
        Desenvolvido por <strong>João Pedro Golenia</strong>
      </p>
      <p style={{ margin: '5px 0' }}>
        <a href="https://wa.me/5542998259010" target="_blank" rel="noopener noreferrer" style={{ color: '#ff5e00', textDecoration: 'none' }}>
          Contato: (42) 99825-9010
        </a>
      </p>
      <p style={{ margin: '5px 0', fontSize: '0.7rem' }}>
        &copy; {new Date().getFullYear()} Todos os direitos reservados.
      </p>
    </footer>
  );
};