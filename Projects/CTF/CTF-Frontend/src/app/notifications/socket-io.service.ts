import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketIOService {
  private socket: Socket;

  constructor() {
    this.socket = io("/api/socket.io", {
      path: '/api/socket.io',
      transports: ['websocket'], // or ['polling', 'websocket'] if you want fallback
      autoConnect: false,
    });
  }

  connect(): void {
    if (!this.socket.connected) {
      console.log("Attempting to connect...");
      this.socket.connect();

      this.socket.on("connect", () => console.log("Connected to Socket.IO!"));
      this.socket.on("connect_error", (err) => console.error("Socket.IO Connection Error:", err));
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
      console.log("Disconnected from Socket.IO.");
    }
  }

  listen<T = any>(eventName: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const handler = (data: T) => subscriber.next(data);
      this.socket.on(eventName, handler);

      return () => this.socket.off(eventName, handler); // cleanup
    });
  }

  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }
}