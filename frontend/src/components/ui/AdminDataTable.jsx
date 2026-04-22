import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  CheckSquare, 
  Square,
  Search,
  Filter
} from 'lucide-react';

export default function AdminDataTable({ 
  columns, 
  data, 
  loading, 
  onRowClick, 
  selectedRows = [], 
  onSelectRows,
  actions 
}) {
  const [sortConfig, setSortConfig] = useState(null);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      onSelectRows([]);
    } else {
      onSelectRows(data.map(item => item.id || item._id));
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedRows.includes(id)) {
      onSelectRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      onSelectRows([...selectedRows, id]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm animate-pulse">
        <div className="h-16 bg-slate-50 border-b border-slate-100" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 border-b border-slate-50 mx-6" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="pl-8 py-5 w-10">
              <button onClick={handleSelectAll} className="text-slate-300 hover:text-primary-navy transition-colors">
                {selectedRows.length === data.length && data.length > 0 ? <CheckSquare size={18} className="text-primary-navy" /> : <Square size={18} />}
              </button>
            </th>
            {columns.map(col => (
              <th 
                key={col.key} 
                className={`py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary-navy transition-colors ${col.className || ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <div className="flex flex-col opacity-30">
                      <ChevronUp size={10} className={sortConfig?.key === col.key && sortConfig.direction === 'ascending' ? 'text-primary-navy opacity-100' : ''} />
                      <ChevronDown size={10} className={sortConfig?.key === col.key && sortConfig.direction === 'descending' ? 'text-primary-navy opacity-100' : ''} />
                    </div>
                  )}
                </div>
              </th>
            ))}
            <th className="pr-8 py-5 text-right"><MoreVertical size={16} className="text-slate-300 ml-auto" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length > 0 ? (
            data.map((row) => (
              <tr 
                key={row.id || row._id}
                onClick={() => onRowClick?.(row)}
                className={`
                  group cursor-pointer transition-all hover:bg-blue-50/30
                  ${selectedRows.includes(row.id || row._id) ? 'bg-blue-50/50' : ''}
                `}
              >
                <td className="pl-8 py-4">
                  <button 
                    onClick={(e) => handleSelectRow(e, row.id || row._id)} 
                    className={`transition-colors ${selectedRows.includes(row.id || row._id) ? 'text-primary-navy' : 'text-slate-200 group-hover:text-slate-300'}`}
                  >
                    {selectedRows.includes(row.id || row._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </td>
                {columns.map(col => (
                  <td key={col.key} className={`py-4 px-4 text-sm font-bold text-primary-navy ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="pr-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions?.map((action, i) => (
                      <button 
                        key={i}
                        onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                        className={`p-2 rounded-lg transition-all ${action.variant === 'danger' ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-400 hover:bg-white hover:shadow-sm'}`}
                        title={action.label}
                      >
                        <action.icon size={16} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 2} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center opacity-30">
                  <Search size={48} className="mb-4 text-slate-200" />
                  <p className="text-xl font-black text-slate-300 uppercase tracking-widest">No matching records</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
