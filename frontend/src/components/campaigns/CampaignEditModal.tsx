import { useState } from 'react';
import { Save } from 'lucide-react';
import type { Campaign, Taxonomy } from '@/types';
import type { CampaignUpdatePayload } from '@/types/campaign-detail';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Campaign"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            icon={<Save className="w-4 h-4" />}
            loading={isPending}
            disabled={!form.name}
            onClick={() => onSave({
              ...form,
              budget_total: form.budget_total ? Number(form.budget_total) : null,
              budget_daily: form.budget_daily ? Number(form.budget_daily) : null,
              start_date: form.start_date || null,
              end_date: form.end_date || null,
            })}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
          <Select
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
          >
            <option value="">Select objective…</option>
            {OBJECTIVES.map((o) => (
              <option key={o} value={o} className="capitalize">
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
            <Input
              type="number" min="0" value={form.budget_total}
              onChange={(e) => setForm({ ...form, budget_total: e.target.value })}
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
            <Input
              type="number" min="0" value={form.budget_daily}
              onChange={(e) => setForm({ ...form, budget_daily: e.target.value })}
              placeholder="500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input type="date" value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input type="date" value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
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
                  <Select
                    value={form.taxonomy_values[type] || ''}
                    onChange={(e) =>
                      setForm({ ...form, taxonomy_values: { ...form.taxonomy_values, [type]: e.target.value } })
                    }
                  >
                    <option value="">— none —</option>
                    {taxonomies
                      .filter((t) => t.type === type)
                      .map((t) => (
                        <option key={t.id} value={t.code}>{t.name} ({t.code})</option>
                      ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
