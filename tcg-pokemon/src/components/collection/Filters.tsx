import React, { useState, useEffect } from 'react';
import { tcgdexApi, TcgdexSet } from '../../services/tcgdexApi';
import './Filters.css';

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
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
        // Tri des sets par date de sortie (le plus récent en premier)
        const sortedSets = data.sort((a, b) => {
          if (!a.releaseDate || !b.releaseDate) return 0;
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        });
        setSets(sortedSets);
        setLoading(false);
        handleFilterChange('setId', sortedSets[0]?.id); // Appliquer le premier set par défaut
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

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, type: 'logo' | 'symbol') => {
    const target = event.target as HTMLImageElement;
    const setId = target.getAttribute('data-setid');
    
    // Essayer avec l'extension JPG si WebP échoue
    if (target.src.endsWith('.webp') && setId) {
      target.src = `https://assets.tcgdex.net/en/sets/${setId}/${type}.jpg`;
      target.onerror = () => {
        // Si JPG échoue aussi, utiliser un fallback
        target.onerror = null;
        target.style.display = 'none';
        target.parentElement?.querySelector('.fallback-text')?.classList.remove('hidden');
      };
    } else {
      // Si ce n'est pas WebP ou après avoir essayé JPG
      target.style.display = 'none';
      target.parentElement?.querySelector('.fallback-text')?.classList.remove('hidden');
    }
  };

  if (loading) {
    return <div className="filters-loading">Chargement des filtres...</div>;
  }

  return (
    <div className="filters-container">
      <h3>Filtres</h3>
      
      <div className="filter-group set-filter">
        <label>Set</label>
        <div className="custom-select">
          <select 
            onChange={(e) => handleFilterChange('setId', e.target.value)}
            value={filters.setId || ''}
          >
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                <img 
                  src={`https://assets.tcgdex.net/univ/sets/${filters.setId}/symbol.webp`}
                  alt={`Symbole ${sets.find(set => set.id === filters.setId)?.name}`}
                  className="set-symbol-image"
                  data-setid={filters.setId}
                  onError={(e) => handleImageError(e, 'symbol')}
                />
                <span>{set.name}</span>
              </option>
            ))}
          </select>
          <div className="select-with-icon">
            {/* Affichage du symbole du set sélectionné dans la dropdown */}
            {filters.setId && (
              <div className="set-symbol-container">
                <img 
                  src={`https://assets.tcgdex.net/univ/sets/${filters.setId}/symbol.webp`}
                  alt={`Symbole ${sets.find(set => set.id === filters.setId)?.name}`}
                  className="set-symbol-image"
                  data-setid={filters.setId}
                  onError={(e) => handleImageError(e, 'symbol')}
                />
                <span className="fallback-text hidden">{sets.find(set => set.id === filters.setId)?.name.substring(0, 2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Filters;