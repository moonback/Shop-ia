import { useCallback, useEffect, useRef } from 'react';

export const CUSTOMER_DISPLAY_CHANNEL = 'green-mood-customer-display';
export const CUSTOMER_DISPLAY_STORAGE_KEY = 'green-mood-customer-display:last-cart';

/**
 * Shared hook used by both POS and customer display windows.
 * - POS window calls `broadcastCartUpdate(cart, metadata)` whenever the cart changes.
 * - Customer display subscribes through `onMessage` to render updates in real-time.
 */
export function useCustomerDisplayChannel({ onMessage } = {}) {
  const channelRef = useRef(null);
  const isSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;

  useEffect(() => {
    if (!isSupported) {
      return undefined;
    }

    const channel = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
    channelRef.current = channel;

    if (onMessage) {
      channel.onmessage = (event) => {
        onMessage(event.data);
      };
    }

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [isSupported, onMessage]);

  const broadcastMessage = useCallback((payload) => {
    if (!channelRef.current || !payload) {
      return;
    }

    channelRef.current.postMessage(payload);
  }, []);

  const broadcastCartUpdate = useCallback((cart, metadata = {}) => {
    const payload = {
      type: 'CART_UPDATE',
      cart,
      ...metadata,
      sentAt: Date.now(),
    };

    try {
      window.localStorage.setItem(CUSTOMER_DISPLAY_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore localStorage failures (private browsing / quota / SSR).
    }

    broadcastMessage(payload);
  }, [broadcastMessage]);

  return {
    isSupported,
    broadcastMessage,
    broadcastCartUpdate,
  };
}
