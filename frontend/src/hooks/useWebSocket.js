// ============================================================
// FILE: frontend/src/hooks/useWebSocket.js
// Generic React hook that manages a WebSocket connection.
// Handles: connect, auto-reconnect, send, disconnect, cleanup.
//
// Usage:
//   const { lastMessage, isConnected, send } = useWebSocket(
//     'ws://localhost:8000/ws/logs/'
//   );
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

const WS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws')
  : 'ws://localhost:8000';

const RECONNECT_DELAY_MS = 3000;  // wait 3s before reconnecting
const MAX_RECONNECTS     = 10;    // give up after 10 attempts

export function useWebSocket(path) {
  const url = `${WS_BASE}${path}`;

  const [isConnected,  setIsConnected]  = useState(false);
  const [lastMessage,  setLastMessage]  = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const wsRef        = useRef(null);
  const mountedRef   = useRef(true);
  const reconnectRef = useRef(null);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        setReconnectCount(0);
        console.log(`[WS] connected → ${url}`);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        console.log(`[WS] closed (code ${event.code}) → ${url}`);

        // Auto-reconnect unless we closed deliberately (code 1000)
        if (event.code !== 1000) {
          setReconnectCount(prev => {
            if (prev < MAX_RECONNECTS) {
              reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
              return prev + 1;
            }
            console.warn(`[WS] max reconnects reached for ${url}`);
            return prev;
          });
        }
      };

      ws.onerror = (err) => {
        console.error(`[WS] error → ${url}`, err);
      };

    } catch (err) {
      console.error(`[WS] failed to create WebSocket → ${url}`, err);
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, 'component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Send a message to the server (e.g. change hours filter)
  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, lastMessage, reconnectCount, send };
}


// ============================================================
// FILE: frontend/src/hooks/useLogStream.js
// Built on top of useWebSocket — specific to the log stream.
// Manages a rolling buffer of the latest N logs.
// Also tracks live metric counters.
//
// Usage:
//   const { logs, isConnected } = useLogStream(50);
// ============================================================

export function useLogStream(maxLogs = 50) {
  const { lastMessage, isConnected, send } = useWebSocket('/ws/logs/');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'initial_logs') {
      // Replace buffer with initial load from server
      setLogs(lastMessage.logs || []);
    }

    if (lastMessage.type === 'new_log') {
      // Prepend new log, keep buffer size under maxLogs
      setLogs(prev => [lastMessage.log, ...prev].slice(0, maxLogs));
    }
  }, [lastMessage, maxLogs]);

  return { logs, isConnected, send };
}


// ============================================================
// FILE: frontend/src/hooks/useStatsStream.js
// Built on top of useWebSocket — specific to live stats.
// Receives updated metric counts every 5 seconds from server.
//
// Usage:
//   const { stats, isConnected } = useStatsStream(24);
// ============================================================

export function useStatsStream(hours = 24) {
  const { lastMessage, isConnected, send } = useWebSocket('/ws/stats/');
  const [stats, setStats] = useState(null);

  // When hours changes, tell the server to switch time window
  useEffect(() => {
    if (isConnected) {
      send({ hours });
    }
  }, [hours, isConnected, send]);

  useEffect(() => {
    if (lastMessage?.type === 'stats') {
      setStats(lastMessage);
    }
  }, [lastMessage]);

  return { stats, isConnected };
}