import React, { useState, useEffect } from 'react';
import { tcgdexApi, TcgdexSet } from '../../services/tcgdexApi';
import './Filters.css';

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  setId?: string;
  types?: string[];
  subtypes?: string[];
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
              {set.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Note: Les filtres suivants ne fonctionneront correctement qu'avec des données de carte détaillées */}
      {/* Nous les gardons pour l'interface utilisateur, mais ils n'auront pas d'effet jusqu'à ce que nous 
          implémentions un filtre côté client plus avancé */}
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
    </div>
  );
};

export default Filters;