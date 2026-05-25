import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouteService } from '../services/route.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {

  user: any = null;
  totalRoutes = 0;
  safeRoutes = 0;
  riskRoutes = 0;
  isGuest = false;

  constructor(
    private authService: AuthService,
    private routeService: RouteService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUserInfo();
  }

  ionViewWillEnter() {
    this.isGuest = this.authService.isGuest();
    this.user = this.authService.getUserInfo();
    if (!this.isGuest) {
      this.calculateStats();
    } else {
      this.totalRoutes = 0;
      this.safeRoutes = 0;
      this.riskRoutes = 0;
    }
  }

  calculateStats() {
    this.routeService.listRoutes().subscribe({
      next: (routes) => {
        this.totalRoutes = routes.length;
        this.safeRoutes = routes.filter(r => r.safeRoute).length;
        this.riskRoutes = this.totalRoutes - this.safeRoutes;
      },
      error: (err) => {
        console.error('Error al calcular estadísticas en el perfil', err);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
