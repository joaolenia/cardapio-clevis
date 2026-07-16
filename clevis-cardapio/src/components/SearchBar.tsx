import React from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className={styles.searchContainer}>
      <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`}></i>
      <input
        type="text"
        placeholder="🔍 Pesquisar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};