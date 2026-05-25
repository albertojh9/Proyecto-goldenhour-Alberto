import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Hospital {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: string; // 'hospital' o 'centro_salud'
  address: string;
  serviceType: string;
  emergencyPhone: string;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalService {

  private readonly apiUrl = `${environment.apiUrl}/healthcare`;

  constructor(private http: HttpClient) {}

  getSpainHealthcarePoints(limit: number = 10000): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spain?limit=${limit}`);
  }

  getClosestHospital(lat: number, lon: number, type: string = 'all'): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/closest?lat=${lat}&lon=${lon}&type=${type}`);
  }
}
