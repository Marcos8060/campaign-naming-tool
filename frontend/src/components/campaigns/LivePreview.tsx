import type { LivePreviewProps } from '@/types/campaign-create';

export function LivePreview({ generatedName, platformConfig, form }: LivePreviewProps) {
  const maxLen = platformConfig?.max_length ?? 100;
  const charCount = generatedName.length;
  const pct = Math.min((charCount / maxLen) * 100, 100);
  const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-positive';

  // Sticky only once this sits beside the form (lg breakpoint, see the
  // create-campaign page's grid) — stacked full-width below the form on
  // mobile, sticky positioning there would just pin an already-visible
  // block, serving no purpose.
  return (
    <div className="bg-blue-50 border border-primary/20 rounded-xl p-5 space-y-4 lg:sticky lg:top-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Live Preview</span>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Generated Name</p>
        {generatedName ? (
          <div className="bg-white border border-primary/20 rounded-lg px-3 py-2 font-mono text-sm text-gray-900 break-all">
            {generatedName}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 italic">
            Select values to generate name…
          </div>
        )}
      </div>

      {generatedName && (
        <>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Character count</span>
              <span className={charCount > maxLen ? 'text-red-600 font-medium' : ''}>
                {charCount}/{maxLen}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {platformConfig?.naming_template && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Template</p>
              <p className="text-xs font-mono text-gray-600 bg-white border border-gray-200 rounded px-2 py-1 break-all">
                {platformConfig.naming_template}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-2">Taxonomy values used</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(form.taxonomy_values)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary-soft text-primary font-medium">
                    {String(v)}
                  </span>
                ))}
              {form.objective && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 font-medium">
                  {form.objective.toUpperCase()}
                </span>
              )}
              {!Object.values(form.taxonomy_values).some(Boolean) && !form.objective && (
                <span className="text-xs text-gray-400 italic">None selected</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
