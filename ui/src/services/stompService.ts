import { Client, IMessage, StompSubscription, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// STOMP over SockJS to Spring endpoint configured at /ws/notifications
// Build an absolute URL using the API base origin to avoid the CRA dev server serving index.html
const API_BASE: string = (process.env.REACT_APP_API_BASE_URL as string) || '/api/v1';
const explicitBackendOrigin = (process.env.REACT_APP_BACKEND_ORIGIN as string) || '';
const apiOrigin = (() => {
  if (explicitBackendOrigin) return explicitBackendOrigin;
  try {
    const isRelative = API_BASE.startsWith('/');
    if (isRelative) {
      // Heuristic: when running on CRA (3000), backend is usually 8080
      const { protocol, hostname, port } = window.location;
      const backendPort = port === '3000' ? '8080' : (port || '8080');
      return `${protocol}//${hostname}${backendPort ? `:${backendPort}` : ''}`;
    }
    const u = new URL(API_BASE);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'http://localhost:8080';
  }
})();
const WS_PATH = process.env.REACT_APP_WS_PATH || '/ws/notifications';
const baseWsUrl = WS_PATH.startsWith('http') ? WS_PATH : `${apiOrigin}${WS_PATH}`;
const token = (() => {
  try { return localStorage.getItem('authToken') || undefined; } catch { return undefined; }
})();
const WS_URL = token ? `${baseWsUrl}?token=${encodeURIComponent(token)}` : baseWsUrl;

export type CommentEvent =
  | { type: 'new'; comment: any }
  | { type: 'update'; comment: any }
  | { type: 'delete'; id: string };

class StompService {
  private client: Client | null = null;
  private connected = false;

  connect() {
    if (this.connected) return;
    if (!this.client) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 3000,
        debug: (str: string) => console.debug('[STOMP]', str),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
        onConnect: () => {
          this.connected = true;
          console.log('STOMP connected');
        },
        onStompError: (frame: IFrame) => {
          console.error('STOMP error', frame.headers['message'], frame.body);
        },
        onWebSocketClose: () => {
          this.connected = false;
          console.log('STOMP disconnected');
        },
      });
    }
    if (this.client && !this.client.active) this.client.activate();
  }

  disconnect() {
    if (this.client && this.client.active) {
      this.client.deactivate();
    }
    this.connected = false;
  }

  subscribeComments(taskId: string, handler: (evt: CommentEvent) => void): () => void {
    this.connect();
    let sub: StompSubscription | null = null;
    const doSubscribe = () => {
      if (this.client && this.client.connected) {
        sub = this.client.subscribe(`/topic/comments/${taskId}`, (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            handler(payload as CommentEvent);
          } catch (e) {
            console.warn('Invalid comment event payload', e);
          }
        });
      }
    };

    if (this.client) {
      if (this.client.connected) doSubscribe();
      else this.client.onConnect = () => {
        this.connected = true;
        doSubscribe();
      };
    }

    return () => {
      try { sub?.unsubscribe(); } catch {}
    };
  }
}

export const stompService = new StompService();
