import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { TaxonomyNodeData } from './TaxonomyEditModal';
import { Button } from '@/components/ui/Button';

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
      {/* flex-wrap lets a row spill onto a second line on narrow screens
          instead of forcing the name to truncate and everything else to
          cram onto one unreadable line. min-w-0 on the name lets truncate
          still kick in on wider screens where it does stay on one line. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 pr-3 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        {node.children?.length ? (
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="text-gray-400 flex-shrink-0 p-0 hover:bg-transparent hover:text-gray-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        ) : <div className="w-4 flex-shrink-0" />}
        <span className="flex-1 min-w-0 sm:min-w-[80px] text-sm text-gray-900 truncate">{node.name}</span>
        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{node.code}</span>
        <span className="text-xs text-gray-400 capitalize flex-shrink-0 sm:w-20 sm:text-right">{node.type}</span>
        {canManage && (
          // Hover-to-reveal only makes sense with a mouse — on touch devices
          // there's no hover state, so these would be effectively invisible.
          // Always visible below the sm breakpoint; hover-reveal kicks back
          // in once there's a pointer that can actually hover.
          <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0 ml-auto sm:ml-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(node)}
              className="p-1 hover:bg-primary-soft rounded text-gray-400 hover:text-primary transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            {canAdmin && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(node)}
                className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
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
