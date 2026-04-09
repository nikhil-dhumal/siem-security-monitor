import { useEffect, useState } from "react";

const SimulationPanel = ({ onAction, config, onConfigChange, simulation, isSaving, saveStatus }) => {
  const [localConfig, setLocalConfig] = useState({
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
  });

  const normalizeSection = (values, changedKey, changedValue) => {
    const nextValues = {
      ...values,
      [changedKey]: Number(changedValue),
    };

    const total = Object.values(nextValues).reduce((sum, v) => sum + v, 0);
    if (total === 0) {
      return nextValues;
    }
    if (Math.abs(total - 1) < 0.0001) {
      return nextValues;
    }

    const changedValueNumber = Number(changedValue);
    const otherKeys = Object.keys(nextValues).filter((key) => key !== changedKey);
    const oldOtherSum = otherKeys.reduce((sum, key) => sum + values[key], 0);
    const remainder = 1 - changedValueNumber;

    if (oldOtherSum <= 0 || remainder <= 0) {
      const equalShare = otherKeys.length > 0 ? remainder / otherKeys.length : 0;
      return Object.fromEntries(
        Object.keys(nextValues).map((key) => [
          key,
          key === changedKey ? changedValueNumber : Math.max(0, equalShare),
        ]),
      );
    }

    return Object.fromEntries(
      Object.entries(nextValues).map(([key, value]) => [
        key,
        key === changedKey
          ? changedValueNumber
          : Math.max(0, (remainder * values[key]) / oldOtherSum),
      ]),
    );
  };

  useEffect(() => {
    if (config) {
      setLocalConfig({
        eventRate: config.eventRate || 1,
        agentProbabilities: {
          auth: config.agentProbabilities?.auth ?? 0.2,
          network: config.agentProbabilities?.network ?? 0.15,
          file: config.agentProbabilities?.file ?? 0.1,
          vpn: config.agentProbabilities?.vpn ?? 0.1,
          web: config.agentProbabilities?.web ?? 0.15,
          dns: config.agentProbabilities?.dns ?? 0.1,
          process: config.agentProbabilities?.process ?? 0.2,
        },
        detailedProbabilities: {
          auth: {
            ssh_login_success:
              config.detailedProbabilities?.auth?.ssh_login_success ?? 0.1,
            ssh_login_failure:
              config.detailedProbabilities?.auth?.ssh_login_failure ?? 0.01,
            invalid_user:
              config.detailedProbabilities?.auth?.invalid_user ?? 0.05,
            sudo_command:
              config.detailedProbabilities?.auth?.sudo_command ?? 0.74,
            user_logout: config.detailedProbabilities?.auth?.user_logout ?? 0.1,
          },
          web: {
            page_access: config.detailedProbabilities?.web?.page_access ?? 0.46,
            login_request:
              config.detailedProbabilities?.web?.login_request ?? 0.05,
            admin_access_denied:
              config.detailedProbabilities?.web?.admin_access_denied ?? 0.01,
            directory_traversal:
              config.detailedProbabilities?.web?.directory_traversal ?? 0.01,
            api_access: config.detailedProbabilities?.web?.api_access ?? 0.46,
          },
          dns: {
            dns_query: config.detailedProbabilities?.dns?.dns_query ?? 0.3,
            internal_lookup:
              config.detailedProbabilities?.dns?.internal_lookup ?? 0.3,
            suspicious_domain:
              config.detailedProbabilities?.dns?.suspicious_domain ?? 0.01,
            cloud_lookup:
              config.detailedProbabilities?.dns?.cloud_lookup ?? 0.3,
            dns_failure: config.detailedProbabilities?.dns?.dns_failure ?? 0.09,
          },
          process: {
            normal_process:
              config.detailedProbabilities?.process?.normal_process ?? 0.85,
            admin_command:
              config.detailedProbabilities?.process?.admin_command ?? 0.03,
            network_scan:
              config.detailedProbabilities?.process?.network_scan ?? 0.01,
            reverse_shell:
              config.detailedProbabilities?.process?.reverse_shell ?? 0.01,
            file_download:
              config.detailedProbabilities?.process?.file_download ?? 0.1,
          },
          file_access: {
            file_read:
              config.detailedProbabilities?.file_access?.file_read ?? 0.55,
            file_write:
              config.detailedProbabilities?.file_access?.file_write ?? 0.4,
            sensitive_file_read:
              config.detailedProbabilities?.file_access?.sensitive_file_read ??
              0.01,
            file_delete:
              config.detailedProbabilities?.file_access?.file_delete ?? 0.05,
            config_change:
              config.detailedProbabilities?.file_access?.config_change ?? 0.04,
          },
        },
      });
    }
  }, [config]);

  const handleProbabilityChange = (category, key, value) => {
    const updated = { ...localConfig };

    if (key in updated.agentProbabilities) {
      updated.agentProbabilities = normalizeSection(
        updated.agentProbabilities,
        key,
        value,
      );
    } else if (category && key in updated.detailedProbabilities[category]) {
      updated.detailedProbabilities = {
        ...updated.detailedProbabilities,
        [category]: normalizeSection(
          updated.detailedProbabilities[category],
          key,
          value,
        ),
      };
    }

    setLocalConfig(updated);
    onConfigChange?.(updated);
  };

  const handleRateChange = (value) => {
    const updated = { ...localConfig, eventRate: Number(value) };
    setLocalConfig(updated);
    onConfigChange?.(updated);
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Save Status Indicator */}
      {(isSaving || saveStatus) && (
        <div className="rounded-lg border border-gray-200 bg-white p-2 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {isSaving && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-blue-600 font-medium">Saving configuration...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <div className="rounded-full h-4 w-4 bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-green-600 font-medium">Configuration saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <div className="rounded-full h-4 w-4 bg-red-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-red-600 font-medium">Save failed</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-[80%] min-h-0 grid grid-cols-4 gap-3 overflow-hidden">
        {/* Column 1: Agent Probabilities */}
        <div className="col-span-1 rounded-lg border border-gray-200 bg-white p-4 flex flex-col overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Agent Probabilities
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {localConfig.agentProbabilities &&
              Object.entries(localConfig.agentProbabilities).map(
                ([key, value]) => (
                  <div key={key} className="rounded bg-gray-50 p-3">
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="font-semibold text-xs">
                        {value.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={value}
                      onChange={(e) =>
                        handleProbabilityChange(null, key, e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                ),
              )}
          </div>
        </div>

        {/* Column 2: Detailed Probabilities */}
        <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4 flex flex-col overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Detailed Probabilities
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {/* Row 1: Auth & Web */}
            <div className="grid grid-cols-2 gap-3">
              {localConfig.detailedProbabilities && (
                <>
                  <div className="border rounded p-2">
                    <h4 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                      Auth Events
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(
                        localConfig.detailedProbabilities.auth,
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-gray-700 font-medium">
                            {key.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={value}
                              onChange={(e) =>
                                handleProbabilityChange(
                                  "auth",
                                  key,
                                  e.target.value,
                                )
                              }
                              className="w-24"
                            />
                            <span className="font-mono text-sm w-10 text-right">
                              {value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <h4 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                      Web Events
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(
                        localConfig.detailedProbabilities.web,
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-gray-700 font-medium">
                            {key.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={value}
                              onChange={(e) =>
                                handleProbabilityChange(
                                  "web",
                                  key,
                                  e.target.value,
                                )
                              }
                              className="w-24"
                            />
                            <span className="font-mono text-sm w-10 text-right">
                              {value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Row 2: DNS & Process */}
            <div className="grid grid-cols-2 gap-3">
              {localConfig.detailedProbabilities && (
                <>
                  <div className="border rounded p-2">
                    <h4 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                      DNS Events
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(
                        localConfig.detailedProbabilities.dns,
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-gray-700 font-medium">
                            {key.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={value}
                              onChange={(e) =>
                                handleProbabilityChange(
                                  "dns",
                                  key,
                                  e.target.value,
                                )
                              }
                              className="w-24"
                            />
                            <span className="font-mono text-sm w-10 text-right">
                              {value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <h4 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                      Process Events
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(
                        localConfig.detailedProbabilities.process,
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-gray-700 font-medium">
                            {key.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={value}
                              onChange={(e) =>
                                handleProbabilityChange(
                                  "process",
                                  key,
                                  e.target.value,
                                )
                              }
                              className="w-24"
                            />
                            <span className="font-mono text-sm w-10 text-right">
                              {value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Row 3: File Access */}
            <div className="border rounded p-2">
              <h4 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                File Access Events
              </h4>

              <div className="grid grid-cols-2 divide-x">
                {/* Left Column */}
                <div className="pr-2 space-y-2">
                  {Object.entries(localConfig.detailedProbabilities.file_access)
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-gray-700 font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={value}
                            onChange={(e) =>
                              handleProbabilityChange(
                                "file_access",
                                key,
                                e.target.value,
                              )
                            }
                            className="w-24"
                          />
                          <span className="font-mono text-sm w-10 text-right">
                            {value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="pl-2 space-y-2">
                  {Object.entries(localConfig.detailedProbabilities.file_access)
                    .slice(2)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-gray-700 font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={value}
                            onChange={(e) =>
                              handleProbabilityChange(
                                "file_access",
                                key,
                                e.target.value,
                              )
                            }
                            className="w-24"
                          />
                          <span className="font-mono text-sm w-10 text-right">
                            {value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Attack Templates + Event Rate (separate sections) */}
       <div className="col-span-1 flex flex-col h-full gap-3">
          {/* Attack Templates */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col flex-1 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Attack Templates
            </h3>
            <div className="flex-1 overflow-y-auto flex flex-col space-y-2">
              {[
                "Brute Force",
                "Failed Logins",
                "Suspicious IP",
                "DDoS Burst",
                "Data Exfil",
                "Privilege Esc",
              ].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAction(label)}
                  className="rounded bg-gray-100 px-3 py-2 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-200"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Rate (separate box BELOW) */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Event Rate
            </h3>
            <div className="rounded bg-gray-50 p-2">
              <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                <span>Rate multiplier</span>
                <span className="font-semibold">
                  {localConfig.eventRate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={localConfig.eventRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - 15% Height */}
      <div className="h-[20%] grid grid-cols-3 gap-4 text-base">
        {/* Column 2: Controls */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col justify-center">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Simulation Controls
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAction("start")}
              className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => onAction("stop")}
              className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Stop
            </button>
            <button
              type="button"
              onClick={() => onAction("reset")}
              className="rounded bg-gray-600 px-4 py-2 text-sm font-semibold font-semibold text-white transition hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Column 3: Metrics */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col justify-center">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Live Metrics
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-blue-50 p-2">
              <p className="text-blue-600 font-bold text-lg">0</p>
              <p className="text-blue-500">Events/min</p>
            </div>
            <div className="rounded bg-green-50 p-2">
              <p className="text-green-600 font-bold text-lg">0</p>
              <p className="text-green-500">Active</p>
            </div>
          </div>
        </div>

        {/* Column 4: Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col justify-center">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Attack Status
          </h3>
          <div className="rounded bg-gray-50 p-2 text-center">
            <p className="text-xl font-bold text-blue-600">Current state</p>
            <p className="text-lg font-semibold text-blue-600">
              {simulation?.status || "idle"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
