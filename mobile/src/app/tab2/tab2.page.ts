import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteService } from '../services/route.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {

  routes: any[] = [];
  loading = false;
  expandedRouteId: number | null = null;
  isGuest = false;

  constructor(
    private routeService: RouteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.isGuest = this.authService.isGuest();
    if (!this.isGuest) {
      this.loadRoutes();
    } else {
      this.routes = [];
    }
  }

  loadRoutes() {
    this.loading = true;
    this.routeService.listRoutes().subscribe({
      next: (data) => {
        this.routes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el historial de rutas', err);
        this.loading = false;
      }
    });
  }

  parseRouteData(route: any): any {
    try {
      return JSON.parse(route.coordinatesJson);
    } catch (e) {
      console.error('Error al parsear los datos geométricos de la ruta', e);
      return null;
    }
  }

  getGlobalRisk(route: any): string {
    const data = this.parseRouteData(route);
    return data ? data.riskLevel : 'LOW';
  }

  toggleDetails(routeId: number) {
    if (this.expandedRouteId === routeId) {
      this.expandedRouteId = null;
    } else {
      this.expandedRouteId = routeId;
    }
  }

  loadRouteOnMap(route: any) {
    // Guardamos la ruta temporalmente en localStorage para que Tab1 la cargue
    localStorage.setItem('active_route_to_load', JSON.stringify(route));
    this.router.navigate(['/tabs/tab1']);
  }

  goToMap() {
    this.router.navigate(['/tabs/tab1']);
  }

  // Utilidades auxiliares
  translateRisk(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return 'Crítico (🔴)';
      case 'MEDIUM': return 'Medio (🟡)';
      case 'LOW': return 'Bajo (🟢)';
      default: return risk;
    }
  }

  formatDuration(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} min`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  registerOrLogin() {
    this.authService.logout();
  }
}
