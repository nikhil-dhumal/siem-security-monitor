import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addLog } from '../features/logs/logsSlice';
import { addAlert } from '../features/alerts/alertsSlice';

const WebSocketContext = createContext();

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8002';
const RECONNECT_DELAY_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
const THROTTLE_INTERVAL_MS = 100; // Batch messages every 100ms to prevent render storms

// Helper function to create a throttled dispatcher
const createThrottledDispatcher = (dispatch, action, throttleInterval) => {
  let queue = [];
  let dispatchTimer = null;
  let lastDispatchTime = 0;

  const flushQueue = () => {
    if (queue.length > 0) {
      const itemsToDispatch = queue.splice(0, queue.length);
      itemsToDispatch.forEach((item) => {
        dispatch(action(item));
      });
      lastDispatchTime = Date.now();
    }
    dispatchTimer = null;
  };

  const throttledHandler = (payload) => {
    queue.push(payload);
    const timeSinceLastDispatch = Date.now() - lastDispatchTime;

    if (timeSinceLastDispatch >= throttleInterval) {
      // Enough time has passed, dispatch immediately
      if (dispatchTimer) {
        clearTimeout(dispatchTimer);
        dispatchTimer = null;
      }
      flushQueue();
    } else if (!dispatchTimer) {
      // Schedule a flush for later
      const delay = throttleInterval - timeSinceLastDispatch;
      dispatchTimer = setTimeout(flushQueue, delay);
    }
  };

  return throttledHandler;
};

const createWebSocket = (url, onMessage, onOpen, onClose, onError) => {
  const socket = new WebSocket(url);

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      onMessage(payload);
    } catch (error) {
      console.warn('WebSocket message parse failed', error);
    }
  };

  socket.onopen = () => {
    onOpen();
  };

  socket.onclose = (event) => {
    onClose(event);
  };

  socket.onerror = (error) => {
    onError(error);
  };

  return socket;
};

export const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const logsSocketRef = useRef(null);
  const alertsSocketRef = useRef(null);
  const reconnectTimersRef = useRef({ logs: null, alerts: null });
  const shouldReconnectRef = useRef(true);
  const reconnectCountsRef = useRef({ logs: 0, alerts: 0 });

  useEffect(() => {
    shouldReconnectRef.current = true;
    reconnectCountsRef.current = { logs: 0, alerts: 0 };

    const connect = (path, socketRef, messageHandler, key) => {
      const existingSocket = socketRef.current;
      if (existingSocket && existingSocket.readyState !== WebSocket.CLOSED && existingSocket.readyState !== WebSocket.CLOSING) {
        return;
      }

      if (reconnectCountsRef.current[key] >= MAX_RECONNECT_ATTEMPTS) {
        console.warn(`Max reconnection attempts reached for ${path}, stopping reconnection`);
        return;
      }

      const url = `${WS_URL}${path}`;
      console.info(`Opening WebSocket to ${url} (attempt ${reconnectCountsRef.current[key] + 1}/${MAX_RECONNECT_ATTEMPTS})`);

      const socket = createWebSocket(
        url,
        messageHandler,
        () => {
          console.info('WebSocket connected', url);
          reconnectCountsRef.current[key] = 0;
        },
        () => {
          console.info('WebSocket closed', url);
          if (!shouldReconnectRef.current) return;
          if (reconnectCountsRef.current[key] < MAX_RECONNECT_ATTEMPTS) {
            reconnectCountsRef.current[key] += 1;
            reconnectTimersRef.current[key] = window.setTimeout(
              () => connect(path, socketRef, messageHandler, key),
              RECONNECT_DELAY_MS
            );
          }
        },
        (error) => {
          console.error('WebSocket error', url, error);
        }
      );

      socketRef.current = socket;
    };

    // Create throttled dispatchers to prevent render storms
    const throttledLogDispatcher = createThrottledDispatcher(dispatch, addLog, THROTTLE_INTERVAL_MS);
    const throttledAlertDispatcher = createThrottledDispatcher(dispatch, addAlert, THROTTLE_INTERVAL_MS);

    connect('/ws/logs/', logsSocketRef, throttledLogDispatcher, 'logs');
    connect('/ws/alerts/', alertsSocketRef, throttledAlertDispatcher, 'alerts');

    return () => {
      shouldReconnectRef.current = false;
      Object.values(reconnectTimersRef.current).forEach((timerId) => {
        if (timerId) {
          window.clearTimeout(timerId);
        }
      });
      logsSocketRef.current?.close();
      alertsSocketRef.current?.close();
    };
  }, [dispatch]);

  return (
    <WebSocketContext.Provider value={{}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};