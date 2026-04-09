import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage, enabled = true) => {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onMessage(payload);
      } catch (error) {
        console.error('WebSocket message parse failed', error);
      }
    };

    socket.onopen = () => {
      console.info('WebSocket connected', url);
    };

    socket.onclose = () => {
      console.info('WebSocket closed', url);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    return () => {
      socket.close();
    };
  }, [url, onMessage, enabled]);

  return wsRef.current;
};

export default useWebSocket;
