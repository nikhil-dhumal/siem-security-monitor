import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import rulesApi from '../api/rulesApi';
import { setRules, setRulesLoading, setRulesError, updateRuleInList } from '../features/rules/rulesSlice';
import TopBar from '../components/layout/TopBar';
import RulesForm from '../components/RulesForm';

const Rules = () => {
  const authState = useSelector((state) => state.auth);
  useEffect(() => {
  }, [authState]);
  const dispatch = useDispatch();
  const rules = useSelector((state) => state.rules.list);
  const loading = useSelector((state) => state.rules.loading);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadRules = async () => {
      dispatch(setRulesLoading(true));
      const { response, err } = await rulesApi.fetchRules();
      if (err) {
        dispatch(setRulesError(err));
      } else {
        dispatch(setRules(response?.results || response || []));
      }
      dispatch(setRulesLoading(false));
    };

    loadRules();
  }, [dispatch]);

  useEffect(() => {
    if (rules.length && !selected) {
      setSelected(rules[0]);
    }
  }, [rules, selected]);

  const handleSave = async (ruleId, changes) => {
    try {
      const { response, err } = await rulesApi.updateRule(ruleId, changes);
      if (err) {
        toast.error('Failed to save rule');
        dispatch(setRulesError(err));
      } else if (response) {
        dispatch(updateRuleInList(response));
        setSelected(response);
        toast.success('Rule saved successfully');
      }
    } catch (error) {
      toast.error('Error saving rule');
      dispatch(setRulesError(error));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBar title="Detection Rule Settings" />
      <div className="px-6 pb-6">
        <div className="grid gap-6 lg:grid-cols-[0.4fr_1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Detection Rules</h2>
            <div className="mt-4 space-y-3">
              {loading && <p className="text-gray-600">Loading rules...</p>}
              {rules.map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  className={`block w-full rounded-lg px-4 py-3 text-left transition ${
                    selected?.id === rule.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelected(rule)}
                >
                  <div className="font-semibold">{rule.name}</div>
                  <div className="text-sm text-gray-600">{rule.severity} severity</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <RulesForm rule={selected} onSave={handleSave} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
