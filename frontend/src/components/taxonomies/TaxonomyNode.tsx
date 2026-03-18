import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { TaxonomyNodeData } from './TaxonomyEditModal';

interface TaxonomyNodeProps {
  node: TaxonomyNodeData;
  depth?: number;
  onEdit: (node: TaxonomyNodeData) => void;
  onDelete: (node: TaxonomyNodeData) => void;
  canManage: boolean;
  canAdmin: boolean;
}

export function TaxonomyNode({ node, depth = 0, onEdit, onDelete, canManage, canAdmin }: TaxonomyNodeProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center gap-2 py-2 pr-3 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        {node.children?.length ? (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 flex-shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : <div className="w-4 flex-shrink-0" />}
        <span className="flex-1 text-sm text-gray-900 truncate">{node.name}</span>
        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{node.code}</span>
        <span className="text-xs text-gray-400 capitalize flex-shrink-0 w-20 text-right">{node.type}</span>
        {canManage && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
            <button onClick={() => onEdit(node)}
              className="p-1 hover:bg-blue-100 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            {canAdmin && (
              <button onClick={() => onDelete(node)}
                className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      {expanded && node.children?.map((child) => (
        <TaxonomyNode key={child.id} node={child} depth={depth + 1}
          onEdit={onEdit} onDelete={onDelete} canManage={canManage} canAdmin={canAdmin} />
      ))}
    </div>
  );
}
