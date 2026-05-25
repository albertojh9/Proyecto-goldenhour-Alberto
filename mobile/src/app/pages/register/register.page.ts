import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
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

    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({
      fullName: this.fullName,
      email: emailTrimmed,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada con éxito. Redirigiendo al inicio de sesión...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar el usuario. Inténtalo de nuevo.';
      }
    });
  }
}
