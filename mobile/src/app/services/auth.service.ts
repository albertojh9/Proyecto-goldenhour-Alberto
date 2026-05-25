import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  register(userData: { email: string; password_hash?: string; password?: string; fullName: string }): Observable<any> {
    // El DTO de backend espera 'password'
    const payload = {
      email: userData.email,
      password: userData.password || userData.password_hash,
      fullName: userData.fullName
    };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  login(credentials: { email: string; password_hash?: string; password?: string }): Observable<{ token: string }> {
    const payload = {
      email: credentials.email,
      password: credentials.password || credentials.password_hash
    };
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  loginAsGuest(): void {
    localStorage.setItem('token', 'guest_token');
    this.router.navigate(['/tabs/tab1']);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isGuest(): boolean {
    return localStorage.getItem('token') === 'guest_token';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserInfo(): { email: string; fullName: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;

    if (token === 'guest_token') {
      return {
        email: 'invitado@goldenhour.com',
        fullName: 'Usuario Invitado',
        role: 'INVITADO'
      };
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64);
      const payload = JSON.parse(payloadDecoded);
      return {
        email: payload.sub,
        fullName: payload.fullName || 'Usuario',
        role: payload.role || 'USER'
      };
    } catch (e) {
      console.error('Error al decodificar el token JWT', e);
      return null;
    }
  }
}
