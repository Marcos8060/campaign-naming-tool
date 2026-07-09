import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Campaign, Taxonomy } from '@/types';
import type { CampaignUpdatePayload } from '@/types/campaign-detail';

const OBJECTIVES = ['awareness', 'consideration', 'conversion', 'retention', 'traffic', 'leads'];

interface CampaignEditModalProps {
  campaign: Campaign;
  taxonomies: Taxonomy[];
  onClose: () => void;
  onSave: (data: CampaignUpdatePayload) => void;
  isPending: boolean;
}

export function CampaignEditModal({ campaign, taxonomies, onClose, onSave, isPending }: CampaignEditModalProps) {
  const [form, setForm] = useState({
    name: campaign.name || '',
    objective: campaign.objective || '',
    budget_total: campaign.budget_total ? String(campaign.budget_total) : '',
    budget_daily: campaign.budget_daily ? String(campaign.budget_daily) : '',
    start_date: campaign.start_date || '',
    end_date: campaign.end_date || '',
    taxonomy_values: (campaign.taxonomy_values || {}) as Record<string, string>,
  });

  const taxonomyTypes: string[] = Array.from(new Set(taxonomies.map((t) => t.type)));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900 text-lg">Edit Campaign</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
            <select
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select objective…</option>
              {OBJECTIVES.map((o) => (
                <option key={o} value={o} className="capitalize">
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
              <input
                type="number" min="0" value={form.budget_total}
                onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
              <input
                type="number" min="0" value={form.budget_daily}
                onChange={(e) => setForm({ ...form, budget_daily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {taxonomyTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxonomy Values</label>
              <div className="space-y-3">
                {taxonomyTypes.map((type) => (
                  <div key={type}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">{type}</label>
                    <select
                      value={form.taxonomy_values[type] || ''}
                      onChange={(e) =>
                        setForm({ ...form, taxonomy_values: { ...form.taxonomy_values, [type]: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">— none —</option>
                      {taxonomies
                        .filter((t) => t.type === type)
                        .map((t) => (
                          <option key={t.id} value={t.code}>{t.name} ({t.code})</option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave({
              ...form,
              budget_total: form.budget_total ? Number(form.budget_total) : null,
              budget_daily: form.budget_daily ? Number(form.budget_daily) : null,
              start_date: form.start_date || null,
              end_date: form.end_date || null,
            })}
            disabled={!form.name || isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
