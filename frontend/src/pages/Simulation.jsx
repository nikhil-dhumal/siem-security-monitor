import { useEffect, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import TopBar from "../components/layout/TopBar";
import SimulationPanel from "../components/SimulationPanel";
import simulationApi from "../api/simulationApi";
import {
  setSimulationStatus,
  setSimulationAction,
  setSimulationConfig,
} from "../features/simulation/simulationSlice";

const Simulation = () => {
  const dispatch = useDispatch();
  const simulation = useSelector((state) => state.simulation);
  const debounceRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'

  useEffect(() => {
    dispatch(setSimulationStatus("ready"));
  }, [dispatch]);

  const handleAction = async (action) => {
    dispatch(setSimulationAction(action));
    
    try {
      const { response, err } = await simulationApi.triggerSimulation(action);
      if (err) {
        console.error('Simulation action failed:', err);
        dispatch(setSimulationStatus('error'));
        toast.error(`Simulation ${action} failed: ${err.message || 'Unknown error'}`);
      } else {
        let newStatus;
        if (action === 'stop') {
          newStatus = 'stopped';
        } else if (action === 'start') {
          newStatus = 'running';
        } else if (action === 'reset') {
          newStatus = 'ready';
          // Reset config to default values
          const defaultConfig = {
            eventRate: 1,
            agentProbabilities: {
              auth: 0.2,
              network: 0.15,
              file: 0.1,
              vpn: 0.1,
              web: 0.15,
              dns: 0.1,
              process: 0.2,
            },
            detailedProbabilities: {
              auth: {
                ssh_login_success: 0.1,
                ssh_login_failure: 0.01,
                invalid_user: 0.05,
                sudo_command: 0.74,
                user_logout: 0.1,
              },
              web: {
                page_access: 0.46,
                login_request: 0.05,
                admin_access_denied: 0.01,
                directory_traversal: 0.01,
                api_access: 0.46,
              },
              dns: {
                dns_query: 0.3,
                internal_lookup: 0.3,
                suspicious_domain: 0.01,
                cloud_lookup: 0.3,
                dns_failure: 0.09,
              },
              process: {
                normal_process: 0.85,
                admin_command: 0.03,
                network_scan: 0.01,
                reverse_shell: 0.01,
                file_download: 0.1,
              },
              file_access: {
                file_read: 0.55,
                file_write: 0.4,
                sensitive_file_read: 0.01,
                file_delete: 0.05,
                config_change: 0.04,
              },
            },
          };
          dispatch(setSimulationConfig(defaultConfig));
        } else {
          newStatus = 'ready';
        }
        dispatch(setSimulationStatus(newStatus));
        toast.success(`Simulation ${action} successful`);
      }
    } catch (error) {
      console.error('Simulation action error:', error);
      dispatch(setSimulationStatus('error'));
      toast.error(`Simulation ${action} error: ${error.message}`);
    }
  };

  const handleConfigChange = useCallback(async (config) => {
    dispatch(setSimulationConfig(config));
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set saving state immediately
    setIsSaving(true);
    setSaveStatus('saving');
    
    // Debounce the API call to prevent excessive requests
    debounceRef.current = setTimeout(async () => {
      try {
        const { err } = await simulationApi.updateSimulationConfig(config);
        if (err) {
          console.error('Config update failed:', err);
          setSaveStatus('error');
          toast.error('Configuration update failed');
        } else {
          setSaveStatus('saved');
          // Clear saved status after 2 seconds
          setTimeout(() => setSaveStatus(null), 2000);
        }
      } catch (error) {
        console.error('Config update error:', error);
        setSaveStatus('error');
        toast.error('Configuration update error');
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms debounce
  }, [dispatch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <TopBar title="Simulation Dashboard" />

      <div className="flex-1 min-h-0 p-3">
        <div className="h-full rounded-lg border border-gray-200 bg-white shadow overflow-hidden">
          <SimulationPanel
            onAction={handleAction}
            config={simulation.config}
            onConfigChange={handleConfigChange}
            simulation={simulation}
            isSaving={isSaving}
            saveStatus={saveStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default Simulation;
