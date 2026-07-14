import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="search-container">
      <i className="fa-solid fa-magnifying-glass search-icon"></i>
      <input
        type="text"
        placeholder="O que você quer comer hoje? (Ex: Bacon, Pastéis...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};