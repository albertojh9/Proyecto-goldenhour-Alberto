import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private readonly apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) {}

  calculateRoute(origin: string, destination: string, routeType: 'FAST' | 'SAFE' = 'FAST'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate`, { origin, destination, routeType });
  }

  saveRoute(routeName: string, origin: string, destination: string, coordinatesJson: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, { routeName, origin, destination, coordinatesJson });
  }

  listRoutes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`);
  }
}
