import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addLog } from '../features/logs/logsSlice';
import { addAlert } from '../features/alerts/alertsSlice';

const WebSocketContext = createContext();

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8002';
const RECONNECT_DELAY_MS = 5000; // Increased from 2000 to 5000
const MAX_RECONNECT_ATTEMPTS = 5;

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

  socket.onclose = () => {
    onClose();
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
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const logsReconnectCountRef = useRef(0);
  const alertsReconnectCountRef = useRef(0);

  useEffect(() => {
    shouldReconnectRef.current = true;
    logsReconnectCountRef.current = 0;
    alertsReconnectCountRef.current = 0;

const connect = (path, socketRef, messageHandler, reconnectCountRef) => {
      if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.warn(`Max reconnection attempts reached for ${path}, stopping reconnection`);
        return;
      }

      const url = `${WS_URL}${path}`;
      console.log(`Attempting WebSocket connection to ${url} (attempt ${reconnectCountRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
      
      if (socketRef.current) {
        socketRef.current.close();
      }

      const socket = createWebSocket(
        url,
        messageHandler,
        () => {
          console.info('WebSocket connected', url);
          reconnectCountRef.current = 0; // Reset on successful connection
        },
        () => {
          console.info('WebSocket closed', url);
          if (shouldReconnectRef.current && reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectCountRef.current++;
            reconnectTimerRef.current = window.setTimeout(
              () => connect(path, socketRef, messageHandler, reconnectCountRef),
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

    connect('/ws/logs/', logsSocketRef, (payload) => dispatch(addLog(payload)), logsReconnectCountRef);
    connect('/ws/alerts/', alertsSocketRef, (payload) => dispatch(addAlert(payload)), alertsReconnectCountRef);

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
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