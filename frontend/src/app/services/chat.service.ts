import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/chat';
  private socket: any;
  private messageSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messageSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initSocket();
  }

  private initSocket(): void {
    this.socket = io('http://localhost:5001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('receive_message', (data: any) => {
      const messages = this.messageSubject.value;
      this.messageSubject.next([...messages, data]);
    });
  }

  getConversation(userId: number): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<any>(`${this.apiUrl}/${userId}`, { headers });
  }

  sendMessage(receiverId: number, message: string, fileUrl?: string, fileName?: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const payload = { receiverId, message, fileUrl, fileName };
    return this.http.post<any>(`${this.apiUrl}/send`, payload, { headers });
  }

  emitMessage(conversationId: number, messageData: any): void {
    this.socket.emit('send_message', { conversationId, ...messageData });
  }

  joinRoom(conversationId: number): void {
    this.socket.emit('join_room', { conversationId });
  }

  markAsRead(messageId: number): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put<any>(`${this.apiUrl}/${messageId}/read`, {}, { headers });
  }
}
