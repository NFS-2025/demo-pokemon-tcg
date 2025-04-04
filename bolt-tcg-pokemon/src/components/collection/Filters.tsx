import React, { useState, useEffect } from 'react';
import { tcgdexApi, TcgdexSet } from '../../services/tcgdexApi';
import './Filters.css';

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  types?: string[];
  subtypes?: string[];
  setId?: string;
  rarity?: string;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [sets, setSets] = useState<TcgdexSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const data = await tcgdexApi.getSets();
        setSets(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sets:', error);
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === '') {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  if (loading) {
    return <div>Chargement des filtres...</div>;
  }

  return (
    <div className="filters-container">
      <h3>Filtres</h3>
      
      <div className="filter-group">
        <label>Set</label>
        <select 
          onChange={(e) => handleFilterChange('setId', e.target.value)}
          value={filters.setId || ''}
        >
          <option value="">Tous les sets</option>
          {sets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name} ({set.serie})
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Rareté</label>
        <select 
          onChange={(e) => handleFilterChange('rarity', e.target.value)}
          value={filters.rarity || ''}
        >
          <option value="">Toutes les raretés</option>
          <option value="Common">Commune</option>
          <option value="Uncommon">Peu commune</option>
          <option value="Rare">Rare</option>
          <option value="Rare Holo">Rare Holo</option>
          <option value="Rare Ultra">Rare Ultra</option>
          <option value="Rare Secret">Rare Secrète</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Type</label>
        <select 
          onChange={(e) => handleFilterChange('types', e.target.value ? [e.target.value] : [])}
          value={filters.types?.[0] || ''}
        >
          <option value="">Tous les types</option>
          <option value="Grass">Plante</option>
          <option value="Fire">Feu</option>
          <option value="Water">Eau</option>
          <option value="Lightning">Électrique</option>
          <option value="Psychic">Psy</option>
          <option value="Fighting">Combat</option>
          <option value="Darkness">Obscurité</option>
          <option value="Metal">Métal</option>
          <option value="Fairy">Fée</option>
          <option value="Dragon">Dragon</option>
          <option value="Colorless">Incolore</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sous-type</label>
        <select 
          onChange={(e) => handleFilterChange('subtypes', e.target.value ? [e.target.value] : [])}
          value={filters.subtypes?.[0] || ''}
        >
          <option value="">Tous les sous-types</option>
          <option value="Basic">De base</option>
          <option value="Stage 1">Niveau 1</option>
          <option value="Stage 2">Niveau 2</option>
          <option value="EX">EX</option>
          <option value="GX">GX</option>
          <option value="V">V</option>
          <option value="VMAX">VMAX</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;