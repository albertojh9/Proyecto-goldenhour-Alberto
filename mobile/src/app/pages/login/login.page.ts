import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ionViewWillEnter() {
    // Si ya está logueado, ir al mapa
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, rellena todos los campos';
      return;
    }

    // Validación básica de formato de email en el frontend
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailTrimmed = this.email.trim();
    
    if (!emailRegex.test(emailTrimmed)) {
      this.errorMessage = 'El formato del correo electrónico no es válido (ej. usuario@dominio.com)';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: emailTrimmed, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'Correo electrónico o contraseña incorrectos';
        } else if (err.status === 400) {
          this.errorMessage = 'El formato del correo electrónico es inválido para el servidor';
        } else {
          this.errorMessage = err.error?.message || 'Error de conexión con el servidor. Inténtalo más tarde.';
        }
      }
    });
  }

  onGuestLogin() {
    this.authService.loginAsGuest();
  }
}
