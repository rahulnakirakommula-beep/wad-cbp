import { useState, useMemo } from 'react';
import DomainTagChip from './DomainTagChip';

/**
 * TagPicker following Section 3 specified behavior (Lines 1414-1468).
 * Supports categories, max selection limits, and clear all functionality.
 */
export default function TagPicker({ 
  tags, 
  selectedTags = [], 
  onChange, 
  max = 8,
  categories = [] 
}) {
  const atMax = selectedTags.length >= max;

  const handleToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else if (!atMax) {
      onChange([...selectedTags, tagId]);
    }
  };

  const groupedTags = useMemo(() => {
    if (categories.length === 0) return { '': tags };
    return categories.reduce((acc, cat) => {
      acc[cat] = tags.filter(t => t.category === cat);
      return acc;
    }, {});
  }, [tags, categories]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-black uppercase tracking-widest ${atMax ? 'text-amber-600 animate-pulse' : 'text-slate-500'}`}>
          {selectedTags.length} of {max} selected
        </span>
        {selectedTags.length > 0 && (
          <button 
            type="button" 
            onClick={() => onChange([])}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {atMax && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium animate-in slide-in-from-top-2">
          Maximum of {max} reached. Remove one to select another focus area.
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedTags).map(([category, catTags]) => (
          <div key={category} className="space-y-3">
            {category && <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</h4>}
            <div className="flex flex-wrap gap-2">
              {catTags.map(tag => (
                <DomainTagChip
                  key={tag.id}
                  label={tag.name}
                  active={selectedTags.includes(tag.id)}
                  onClick={() => handleToggle(tag.id)}
                  variant="picker"
                  disabled={atMax && !selectedTags.includes(tag.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
