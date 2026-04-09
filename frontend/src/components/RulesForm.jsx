import { useEffect, useState } from 'react';

const RulesForm = ({ rule, onSave }) => {
  const [formState, setFormState] = useState({});

  // Rules that use threshold and window parameters
  const rulesWithThresholds = ['AUTH_001', 'FW_001', 'NET_002'];

  // Default values for each rule
  const getDefaults = (ruleId) => {
    const defaults = {
      'AUTH_001': { threshold: 5, window_seconds: 60 },
      'FW_001': { threshold: 10, window_seconds: 60 },
      'NET_002': { threshold: 10, window_seconds: 30 },
    };
    return defaults[ruleId] || { threshold: 5, window_seconds: 300 };
  };

  useEffect(() => {
    if (rule) {
      const defaults = getDefaults(rule.rule_id);
      setFormState({
        name: rule.name,
        severity: rule.severity,
        enabled: rule.enabled ?? true,
        ...(rulesWithThresholds.includes(rule.rule_id) && {
          threshold: rule.threshold ?? defaults.threshold,
          window_seconds: rule.window_seconds ?? defaults.window_seconds,
        }),
      });
    }
  }, [rule]);

  if (!rule) {
    return <div className="text-gray-600">Select a rule to edit its parameters.</div>;
  }

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const defaults = getDefaults(rule.rule_id);
    setFormState((prev) => ({
      ...prev,
      enabled: true,
      ...(rulesWithThresholds.includes(rule.rule_id) && {
        threshold: defaults.threshold,
        window_seconds: defaults.window_seconds,
      }),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(rule.id, {
      enabled: formState.enabled,
      ...(rulesWithThresholds.includes(rule.rule_id) && {
        threshold: Number(formState.threshold),
        window_seconds: Number(formState.window_seconds),
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{rule.name}</h2>
        <p className="mt-2 text-sm text-gray-600">{rule.description}</p>
        {rulesWithThresholds.includes(rule.rule_id) ? (
          <p className="mt-1 text-sm text-gray-600">Configure the threshold and time window for this detection rule.</p>
        ) : (
          <p className="mt-1 text-sm text-gray-600">This rule triggers on pattern matches and has no configurable parameters.</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Enabled</span>
          <select
            value={formState.enabled ? 'true' : 'false'}
            onChange={(e) => handleChange('enabled', e.target.value === 'true')}
            className="mt-2 w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Severity</span>
          <input
            value={formState.severity}
            readOnly
            className="mt-2 w-full rounded border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
          />
        </label>
      </div>
      {rulesWithThresholds.includes(rule.rule_id) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Threshold</span>
            <div className="mt-1 text-xs text-gray-500">Current: {rule.threshold ?? 'Not set'}</div>
            <input
              type="number"
              min="0"
              value={formState.threshold}
              onChange={(e) => handleChange('threshold', e.target.value)}
              className="mt-2 w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Window (seconds)</span>
            <div className="mt-1 text-xs text-gray-500">Current: {rule.window_seconds ?? 'Not set'}</div>
            <input
              type="number"
              min="0"
              value={formState.window_seconds}
              onChange={(e) => handleChange('window_seconds', e.target.value)}
              className="mt-2 w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900"
            />
          </label>
        </div>
      )}
      <div className="flex space-x-4">
        <button
          type="submit"
          className="rounded bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Save Changes
        </button>
        {rulesWithThresholds.includes(rule.rule_id) && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded bg-gray-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Reset to Defaults
          </button>
        )}
      </div>
    </form>
  );
};

export default RulesForm;
