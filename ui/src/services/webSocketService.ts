import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

class WebSocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        // autoConnect: false, // can be useful for manual connection management
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTaskRoom(taskId: string): void {
    this.socket?.emit('joinTask', taskId);
  }

  leaveTaskRoom(taskId: string): void {
    this.socket?.emit('leaveTask', taskId);
  }

  onNewComment(callback: (comment: any) => void): void {
    this.socket?.on('newComment', callback);
  }

  onUpdateComment(callback: (comment: any) => void): void {
    this.socket?.on('updateComment', callback);
  }

  onDeleteComment(callback: (commentId: string) => void): void {
    this.socket?.on('deleteComment', callback);
  }

  off(eventName: string) {
    this.socket?.off(eventName);
  }
}

export const webSocketService = new WebSocketService();
