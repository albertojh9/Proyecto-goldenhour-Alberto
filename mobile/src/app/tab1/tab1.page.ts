import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HospitalService } from '../services/hospital.service';
import { RouteService } from '../services/route.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit, OnDestroy {

  map!: L.Map;
  origin = '';
  destination = '';
  routeName = '';
  calculating = false;
  saving = false;
  routeCalculated = false;
  isGuest = false;

  // Tipo de ruta seleccionado por el usuario: FAST o SAFE
  selectedRouteType: 'FAST' | 'SAFE' = 'SAFE';

  // Destino pendiente cuando el usuario pulsa «Iniciar Ruta» en un hospital sin tener origen fijado
  pendingHospitalDest: { lat: number; lon: number; name: string } | null = null;
  
  // Datos devueltos por el backend para la ruta activa
  routeData: any = null;

  // Sugerencias de autocompletado
  originSuggestions: any[] = [];
  destinationSuggestions: any[] = [];
  showOriginMenu = false;
  showDestinationMenu = false;

  // Streams de búsqueda
  private originQuery$ = new Subject<string>();
  private destinationQuery$ = new Subject<string>();

  // Colección de elementos del mapa para poder limpiarlos
  private hospitalMarkers: L.CircleMarker[] = [];
  private routePolylines: L.Polyline[] = [];
  private tempMarkers: L.Marker[] = [];
  private userLocationMarker: L.CircleMarker | null = null;

  // Variables de guiado / navegación interactiva en tiempo real (GPS Real)
  isNavigating = false;
  navigationRoutePoints: L.LatLng[] = [];
  navigationMarker: L.Marker | null = null;
  geolocationWatchId: any = null;
  navRemainingDistance = 'Calculando...';
  navRemainingDuration = 'Calculando...';
  navClosestHospitalName = 'Ninguno';
  navClosestHospitalTime = 0;
  navCurrentRisk = 'LOW';

  constructor(
    private authService: AuthService,
    private hospitalService: HospitalService,
    private routeService: RouteService,
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initAutocomplete();
  }

  ionViewDidEnter() {
    // Exponer la función al scope global para que los popups de Leaflet puedan llamarla
    (window as any).initiateRouteToHospital = (lat: number, lon: number, name: string) => {
      this.ngZone.run(() => this.initiateRouteToHospital(lat, lon, name));
    };

    try {
      this.isGuest = this.authService.isGuest();
      this.initMap();
      this.loadHospitals();
      this.checkAndLoadSavedRoute();
    } catch (e: any) {
      console.error('Error al inicializar la vista de mapa:', e);
      this.showToast('Error de inicialización: ' + (e.message || e));
    }
  }

  ngOnDestroy() {
    if (this.geolocationWatchId) {
      Geolocation.clearWatch({ id: this.geolocationWatchId });
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('Contenedor de mapa no encontrado en el DOM. Reintentando en 100ms...');
      setTimeout(() => {
        try {
          this.initMap();
          this.loadHospitals();
        } catch (e: any) {
          console.error('Error en reintento de initMap', e);
        }
      }, 100);
      return;
    }

    try {
      // Centrar mapa en la Península Ibérica con renderizado Canvas para soporte masivo de marcadores a 60 FPS
      this.map = L.map('map', {
        center: [40.416775, -3.703790],
        zoom: 6,
        zoomControl: false,
        preferCanvas: true
      });
      L.control.zoom({ position: 'topright' }).addTo(this.map);

      // Añadir capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);

      // Escuchar click en el mapa para establecer Origen / Destino
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.showOriginMenu = false;
        this.showDestinationMenu = false;
        
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        const coordsStr = `${lat},${lng}`;

        if (!this.origin) {
          this.origin = coordsStr;
          this.addTempMarker(lat, lng, 'Origen', '#48bb78');

          // Si había un hospital pendiente esperando el origen, calcular la ruta automáticamente
          if (this.pendingHospitalDest) {
            const pd = this.pendingHospitalDest;
            this.pendingHospitalDest = null;
            this.destination = `${pd.lat},${pd.lon}`;
            this.addTempMarker(pd.lat, pd.lon, `Destino: ${pd.name}`, '#ff4040');
            this.showToast(`✅ Origen fijado. Calculando ruta hacia ${pd.name}...`);
            setTimeout(() => this.calculateRoute(), 300);
          } else {
            this.showToast('Origen seleccionado en el mapa');
          }
        } else if (!this.destination) {
          this.destination = coordsStr;
          this.addTempMarker(lat, lng, 'Destino', '#ff4040');
          this.showToast('Destino seleccionado en el mapa');
        } else {
          // Si ambos ya están definidos, reiniciamos e indicamos un nuevo origen
          this.clearMap();
          this.origin = coordsStr;
          this.addTempMarker(lat, lng, 'Origen', '#48bb78');
          this.showToast('Ruta limpiada. Nuevo origen establecido.');
        }
    });
    } catch (err: any) {
      console.error('Error durante la inicialización de Leaflet:', err);
      this.showToast('Fallo en mapa: ' + (err.message || err));
    }
  }

  private loadHospitals() {
    this.hospitalService.getSpainHealthcarePoints(10000).subscribe({
      next: (hospitals) => {
        // Eliminar marcadores previos de hospitales si existen
        this.hospitalMarkers.forEach(m => m.remove());
        this.hospitalMarkers = [];

        hospitals.forEach(h => {
          const color = h.category === 'hospital' ? '#ff4040' : '#805ad5';
          const title = h.category === 'hospital' ? '🏥 Hospital' : '🩺 Centro de Salud';
          
          const marker = L.circleMarker([h.latitude, h.longitude], {
            radius: 7,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.9
          });

          marker.bindPopup(`
            <div style="font-family: 'Inter', sans-serif;">
              <strong style="color: ${color};">${title}</strong><br/>
              <strong>${h.name}</strong><br/>
              <span style="font-size: 11px; color: #718096;">📍 ${h.city} (${h.serviceType})</span><br/>
              <span style="font-size: 11px; color: #ff5252;">📞 Urgencias: ${h.emergencyPhone}</span><br/>
              <button
                onclick="window.initiateRouteToHospital(${h.latitude}, ${h.longitude}, '${h.name.replace(/'/g, "&#39;")}')"
                style="margin-top:8px;width:100%;background:linear-gradient(135deg,#48bb78,#38a169);color:#fff;border:none;padding:7px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:.3px;">
                🚗 Iniciar Ruta
              </button>
            </div>
          `);
          
          marker.addTo(this.map);
          this.hospitalMarkers.push(marker);
        });
      },
      error: (err) => {
        console.error('Error al cargar la semilla de hospitales españoles', err);
      }
    });
  }

  private addTempMarker(lat: number, lng: number, title: string, color: string) {
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })
    });
    
    marker.bindPopup(`<strong>${title}</strong><br/>${lat}, ${lng}`).addTo(this.map);
    this.tempMarkers.push(marker);
  }

  async getCurrentLocation(target: 'origin' | 'destination' = 'origin') {
    try {
      this.showToast('Obteniendo ubicación GPS en tiempo real...');
      const coordinates = await Geolocation.getCurrentPosition();
      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;

      if (this.userLocationMarker) {
        this.userLocationMarker.remove();
      }

      this.userLocationMarker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: '#0080ff',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(this.map);

      this.userLocationMarker.bindPopup('<strong>Tu ubicación en tiempo real</strong>').openPopup();
      this.map.setView([lat, lng], 13);

      const coordsStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      
      if (target === 'origin') {
        this.origin = coordsStr;
        this.addTempMarker(lat, lng, 'Origen (Mi ubicación)', '#48bb78');

        // Si había un hospital pendiente esperando el origen, calcular la ruta automáticamente
        if (this.pendingHospitalDest) {
          const pd = this.pendingHospitalDest;
          this.pendingHospitalDest = null;
          this.destination = `${pd.lat},${pd.lon}`;
          this.addTempMarker(pd.lat, pd.lon, `Destino: ${pd.name}`, '#ff4040');
          this.showToast(`✅ GPS fijado como origen. Calculando ruta hacia ${pd.name}...`);
          setTimeout(() => this.calculateRoute(), 300);
        } else {
          this.showToast('Origen establecido en tu ubicación GPS');
        }
      } else {
        this.destination = coordsStr;
        this.addTempMarker(lat, lng, 'Destino (Mi ubicación)', '#ff4040');
        this.showToast('Destino establecido en tu ubicación GPS');
      }
    } catch (e) {
      console.error('Error al obtener la geolocalización', e);
      this.showToast('No se pudo acceder al GPS. Asegúrate de dar los permisos correspondientes.');
    }
  }

  async routeToClosestHospital(target: 'origin' | 'destination', type: string = 'hospital') {
    let coordsStr = target === 'origin' ? this.origin : this.destination;
    
    // Si no hay coordenadas establecidas, intentamos usar la ubicación GPS en tiempo real
    if (!coordsStr) {
      this.showToast('Obteniendo tu ubicación actual por GPS para calcular la cercanía...');
      try {
        const coordinates = await Geolocation.getCurrentPosition();
        const lat = coordinates.coords.latitude;
        const lon = coordinates.coords.longitude;
        
        // Establecer la ubicación obtenida como origen
        this.origin = `${lat.toFixed(6)},${lon.toFixed(6)}`;
        if (this.userLocationMarker) {
          this.userLocationMarker.remove();
        }
        this.userLocationMarker = L.circleMarker([lat, lon], {
          radius: 9,
          fillColor: '#0080ff',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 1
        }).addTo(this.map);
        this.userLocationMarker.bindPopup('<strong>Tu ubicación en tiempo real</strong>').openPopup();
        this.map.setView([lat, lon], 13);
        
        this.addTempMarker(lat, lon, 'Origen (Mi ubicación)', '#48bb78');
        coordsStr = this.origin;
      } catch (e) {
        console.error('Error obteniendo ubicación para hospital más cercano', e);
        this.showToast('No se pudo obtener la ubicación GPS actual. Por favor, selecciona un origen primero.');
        return;
      }
    }

    const parts = coordsStr.split(',');
    if (parts.length !== 2) {
      this.showToast('Coordenadas inválidas. Deben ser lat,lon');
      return;
    }

    const lat = parseFloat(parts[0].trim());
    const lon = parseFloat(parts[1].trim());

    const label = type === 'hospital' ? 'hospital' : 'centro de salud';
    this.showToast(`Buscando ${label} más cercano...`);
    this.hospitalService.getClosestHospital(lat, lon, type).subscribe({
      next: (closest) => {
        if (!closest) {
          this.showToast('No se encontró ningún centro de salud u hospital cercano.');
          return;
        }

        const closestCoords = `${closest.latitude},${closest.longitude}`;
        const labelFound = closest.category === 'hospital' ? 'Hospital' : 'Centro de Salud';
        
        if (target === 'origin') {
          this.destination = closestCoords;
          this.showToast(`${labelFound} encontrado: ${closest.name}. Trazando ruta desde tu origen...`);
        } else {
          this.origin = closestCoords;
          this.showToast(`${labelFound} encontrado: ${closest.name}. Trazando ruta desde allí al destino...`);
        }

        this.calculateRoute();
      },
      error: (err) => {
        console.error('Error al obtener el hospital más cercano', err);
        this.showToast('Error al conectar con el backend de salud.');
      }
    });
  }

  private checkAndLoadSavedRoute() {
    const routeToLoadStr = localStorage.getItem('active_route_to_load');
    if (routeToLoadStr) {
      localStorage.removeItem('active_route_to_load');
      try {
        const route = JSON.parse(routeToLoadStr);
        this.origin = route.origin;
        this.destination = route.destination;
        this.routeData = JSON.parse(route.coordinatesJson);
        this.routeCalculated = true;
        
        // Esperamos un instante corto para asegurar que el mapa se cargó e inicializó
        setTimeout(() => {
          this.renderRouteSegments(this.routeData);
          this.showToast(`Cargada ruta: ${route.routeName}`);
        }, 300);
      } catch (e) {
        console.error('Error al restaurar la ruta guardada', e);
      }
    }
  }

  private renderRouteSegments(data: any) {
    // Limpiar polilíneas y marcadores temporales
    this.routePolylines.forEach(p => p.remove());
    this.routePolylines = [];
    this.tempMarkers.forEach(m => m.remove());
    this.tempMarkers = [];

    // Pintar marcador origen
    const originParts = this.origin.split(',');
    this.addTempMarker(parseFloat(originParts[0]), parseFloat(originParts[1]), 'Origen', '#48bb78');
    
    // Pintar marcador destino
    const destParts = this.destination.split(',');
    this.addTempMarker(parseFloat(destParts[0]), parseFloat(destParts[1]), 'Destino', '#ff4040');

    // Pintar polilíneas por tramos con su semáforo de riesgo
    const bounds: L.LatLng[] = [];

    data.segments.forEach((seg: any) => {
      const points = seg.points.map((p: any) => new L.LatLng(p[0], p[1]));
      points.forEach((p: L.LatLng) => bounds.push(p));

      const color = this.getRiskColor(seg.risk);
      
      const polyline = L.polyline(points, {
        color: color,
        weight: 6,
        opacity: 0.85
      });

      polyline.bindPopup(`
        <div style="font-family: 'Inter', sans-serif;">
          <strong>Tramo ${seg.order}</strong><br/>
          <span>Semáforo: <strong style="color: ${color};">${this.translateRisk(seg.risk)}</strong></span><br/>
          <span>🏥 Más cercano: <strong>${seg.closestHospitalName}</strong></span><br/>
          <span>⏱ Tiempo estimado: <strong>${seg.minutesToClosestHospital} min</strong></span>
        </div>
      `);

      polyline.addTo(this.map);
      this.routePolylines.push(polyline);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
  }

  calculateRoute() {
    if (!this.origin || !this.destination) {
      this.showToast('Por favor, selecciona origen y destino en el mapa o introduce sus coordenadas');
      return;
    }

    this.calculating = true;
    const label = this.selectedRouteType === 'SAFE' ? '🛡️ Ruta Segura' : '🚀 Ruta Rápida';
    this.routeService.calculateRoute(this.origin, this.destination, this.selectedRouteType).subscribe({
      next: (data) => {
        this.calculating = false;
        this.routeCalculated = true;
        this.routeData = data;

        this.renderRouteSegments(data);
        this.showToast(`${label} calculada · Riesgo: ${this.translateRisk(data.riskLevel)}`);
      },
      error: (err) => {
        this.calculating = false;
        this.showToast(err.error?.message || 'Error al calcular la ruta con OSRM');
      }
    });
  }

  setRouteType(type: 'FAST' | 'SAFE') {
    this.selectedRouteType = type;
  }

  /**
   * Llamado desde el botón «Iniciar Ruta» dentro de los popups de Leaflet.
   * Si hay origen → pone el hospital como destino y calcula la ruta.
   * Si no hay origen → guarda el hospital como destino pendiente y pide al usuario que elija origen.
   */
  initiateRouteToHospital(lat: number, lon: number, name: string) {
    this.map.closePopup();

    if (this.origin) {
      // Origen ya establecido → fijar hospital como destino y calcular
      this.destination = `${lat},${lon}`;
      // Limpiar marcadores temporales y redibujar
      this.tempMarkers.forEach(m => m.remove());
      this.tempMarkers = [];
      const originParts = this.origin.split(',');
      this.addTempMarker(parseFloat(originParts[0]), parseFloat(originParts[1]), 'Origen', '#48bb78');
      this.addTempMarker(lat, lon, `Destino: ${name}`, '#ff4040');
      this.showToast(`🏥 Destino: ${name}. Calculando ruta...`);
      setTimeout(() => this.calculateRoute(), 200);
    } else {
      // Sin origen → guardar destino pendiente y pedir origen
      this.pendingHospitalDest = { lat, lon, name };
      // Marcar visualmente el hospital como destino ya fijado
      this.addTempMarker(lat, lon, `Destino: ${name}`, '#ff4040');
      this.showToast(`📍 Selecciona ahora tu punto de origen en el mapa o usa el GPS`);
    }
  }

  saveRoute() {
    if (this.isGuest) {
      this.showToast('Inicia sesión para guardar rutas');
      return;
    }

    if (!this.routeName || !this.routeData) {
      this.showToast('Por favor, indica un nombre para la ruta');
      return;
    }

    this.saving = true;
    const coordinatesJson = JSON.stringify(this.routeData);

    this.routeService.saveRoute(this.routeName, this.origin, this.destination, coordinatesJson).subscribe({
      next: () => {
        this.saving = false;
        this.showToast('Ruta guardada con éxito en tu historial');
        this.routeName = '';
      },
      error: (err) => {
        this.saving = false;
        if (this.isGuest) {
          this.showToast('Inicia sesión para guardar rutas');
        } else {
          this.showToast(err.error?.message || 'Error al guardar la ruta');
        }
      }
    });
  }

  clearMap() {
    this.stopNavigation();
    this.routePolylines.forEach(p => p.remove());
    this.routePolylines = [];
    this.tempMarkers.forEach(m => m.remove());
    this.tempMarkers = [];
    this.origin = '';
    this.destination = '';
    this.routeData = null;
    this.routeCalculated = false;
    this.routeName = '';
    
    // Centrar mapa de nuevo en España general
    this.map.setView([40.416775, -3.703790], 6);
  }

  logout() {
    this.authService.logout();
  }

  // Utilidades auxiliares
  getRiskColor(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return '#ff4040'; // Rojo
      case 'MEDIUM': return '#ffd166';   // Amarillo
      case 'LOW': return '#48bb78';      // Verde
      default: return '#3182ce';
    }
  }

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

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: 'dark',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  initAutocomplete() {
    this.originQuery$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return of([]);
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=5`);
      }),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    ).subscribe(suggestions => {
      this.originSuggestions = suggestions;
    });

    this.destinationQuery$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return of([]);
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=5`);
      }),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    ).subscribe(suggestions => {
      this.destinationSuggestions = suggestions;
    });
  }

  onOriginInput(event: any) {
    const val = event.target.value;
    this.showOriginMenu = true;
    this.originQuery$.next(val);
  }

  onDestinationInput(event: any) {
    const val = event.target.value;
    this.showDestinationMenu = true;
    this.destinationQuery$.next(val);
  }

  onOriginFocus() {
    this.showOriginMenu = true;
    this.showDestinationMenu = false;
  }

  onDestinationFocus() {
    this.showDestinationMenu = true;
    this.showOriginMenu = false;
  }

  selectSuggestion(item: any, type: 'origin' | 'destination') {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const coordsStr = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    const label = item.display_name;

    if (type === 'origin') {
      this.origin = coordsStr;
      this.originSuggestions = [];
      this.showOriginMenu = false;
      this.addTempMarker(lat, lon, 'Origen: ' + label, '#48bb78');

      // Si había un hospital pendiente esperando el origen, calcular la ruta automáticamente
      if (this.pendingHospitalDest) {
        const pd = this.pendingHospitalDest;
        this.pendingHospitalDest = null;
        this.destination = `${pd.lat},${pd.lon}`;
        this.addTempMarker(pd.lat, pd.lon, `Destino: ${pd.name}`, '#ff4040');
        this.showToast(`✅ Origen fijado. Calculando ruta hacia ${pd.name}...`);
        this.map.setView([lat, lon], 14);
        setTimeout(() => this.calculateRoute(), 300);
        return;
      }
    } else {
      this.destination = coordsStr;
      this.destinationSuggestions = [];
      this.showDestinationMenu = false;
      this.addTempMarker(lat, lon, 'Destino: ' + label, '#ff4040');
    }

    this.map.setView([lat, lon], 14);
  }

  private loadHospitalsFromOverpass() {
    if (!this.map) return;
    const zoom = this.map.getZoom();
    if (zoom < 8) return;

    const bounds = this.map.getBounds();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="hospital"](${south},${west},${north},${east});
        way["amenity"="hospital"](${south},${west},${north},${east});
        node["amenity"="clinic"](${south},${west},${north},${east});
        way["amenity"="clinic"](${south},${west},${north},${east});
        node["amenity"="doctors"](${south},${west},${north},${east});
        way["amenity"="doctors"](${south},${west},${north},${east});
      );
      out center;
    `;

    const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (!res || !res.elements) return;

        const existingIds = new Set(this.hospitalMarkers.map(m => (m as any).osmId));

        res.elements.forEach((el: any) => {
          const id = `osm-${el.id}`;
          if (existingIds.has(id)) return;

          const lat = el.lat || (el.center && el.center.lat);
          const lon = el.lon || (el.center && el.center.lon);
          if (!lat || !lon) return;

          const tags = el.tags || {};
          const name = tags.name || 'Centro Médico sin Nombre';
          const type = tags.amenity === 'hospital' ? 'hospital' : 'centro_salud';
          const color = type === 'hospital' ? '#3182ce' : '#805ad5';
          const title = type === 'hospital' ? '🏥 Hospital' : '🩺 Centro de Salud';
          const city = tags['addr:city'] || '';
          const street = tags['addr:street'] || '';
          const phone = tags.phone || tags['contact:phone'] || 'No disponible';

          const marker = L.circleMarker([lat, lon], {
            radius: 7,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.9
          });
          (marker as any).osmId = id;

          marker.bindPopup(`
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; color: #1e293b;">
              <strong style="color: ${color};">${title}</strong><br/>
              <strong style="font-size: 13px;">${name}</strong><br/>
              <span style="color: #64748b;">📍 ${street} ${city}</span><br/>
              <span style="color: #ef4444;">📞 Teléfono: ${phone}</span><br/>
              <button
                onclick="window.initiateRouteToHospital(${lat}, ${lon}, '${name.replace(/'/g, "&#39;")}')"
                style="margin-top:8px;width:100%;background:linear-gradient(135deg,#48bb78,#38a169);color:#fff;border:none;padding:7px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:.3px;">
                🚗 Iniciar Ruta
              </button>
            </div>
          `);

          marker.addTo(this.map);
          this.hospitalMarkers.push(marker);
        });
      },
      error: (err) => {
        console.warn('Overpass API error:', err);
      }
    });
  }

  formatCoordinateText(val: string, type: 'origin' | 'destination'): string {
    if (!val) return '';
    
    // Si el valor contiene solo números lat,lon (coordenadas crudas)
    const coordPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (coordPattern.test(val.trim())) {
      return type === 'origin' ? '📍 Mi ubicación / Mapa' : '📍 Punto seleccionado';
    }

    if (val.includes(',')) {
      const parts = val.split(',');
      const first = parts[0].trim();
      if (first.length > 25) {
        return first.substring(0, 22) + '...';
      }
      return first;
    }
    return val;
  }


  // --- MÉTODOS DE GUIADO Y NAVEGACIÓN EN TIEMPO REAL (GPS REAL) ---
  async startNavigation() {
    if (!this.routeData || !this.routeData.segments) {
      this.showToast('No hay una ruta calculada para iniciar el trayecto.');
      return;
    }

    // Extraer todos los puntos de la ruta para el cálculo del trazado
    const allPoints: L.LatLng[] = [];
    this.routeData.segments.forEach((seg: any) => {
      seg.points.forEach((p: any) => {
        allPoints.push(new L.LatLng(p[0], p[1]));
      });
    });

    if (allPoints.length === 0) {
      this.showToast('La ruta no contiene puntos geométricos para navegar.');
      return;
    }

    this.navigationRoutePoints = allPoints;
    this.isNavigating = true;
    this.navRemainingDistance = this.routeData.distance + ' km';
    this.navRemainingDuration = this.formatDuration(this.routeData.duration);

    if (this.geolocationWatchId) {
      Geolocation.clearWatch({ id: this.geolocationWatchId });
      this.geolocationWatchId = null;
    }

    if (this.navigationMarker) {
      this.navigationMarker.remove();
      this.navigationMarker = null;
    }

    // Icono de coche de Google Maps (Flecha de navegación en 3D azul)
    const carIcon = L.divIcon({
      className: 'nav-car-icon',
      html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(59, 130, 246, 0.8); display: flex; align-items: center; justify-content: center; transform: rotate(0deg); transition: transform 0.2s ease;">
               <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid white; margin-top: -3px;"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Situar la posición inicial en base al GPS del móvil si está disponible
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      this.navigationMarker = L.marker([lat, lon], { icon: carIcon }).addTo(this.map);
      this.updateNavigationPosition(lat, lon);
    } catch (e) {
      const startPt = this.navigationRoutePoints[0];
      this.navigationMarker = L.marker(startPt, { icon: carIcon }).addTo(this.map);
      this.updateNavigationPosition(startPt.lat, startPt.lng);
      console.warn('Iniciando en origen de ruta, GPS inicial no disponible:', e);
    }

    this.showToast('🚗 Iniciando navegación en tiempo real. ¡Buen viaje!');

    // Comenzar el seguimiento del GPS real (Google Maps behavior)
    try {
      this.geolocationWatchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }, (position, err) => {
        if (err) {
          console.error('Error de watchPosition:', err);
          return;
        }
        if (position && position.coords) {
          this.ngZone.run(() => {
            this.updateNavigationPosition(position.coords.latitude, position.coords.longitude);
          });
        }
      });
    } catch (err) {
      console.error('Error al registrar watchPosition:', err);
      this.showToast('Error de conexión con el GPS del dispositivo.');
    }
  }

  updateNavigationPosition(lat: number, lon: number) {
    if (!this.isNavigating) return;

    if (this.navigationMarker) {
      this.navigationMarker.setLatLng([lat, lon]);
    }

    // Centrar mapa al estilo GPS
    this.map.setView([lat, lon], 16);

    // 1. Llegada a Destino
    const lastSeg = this.routeData.segments[this.routeData.segments.length - 1];
    const destPt = lastSeg.points[lastSeg.points.length - 1];
    const distToDest = this.calculateDistance(lat, lon, destPt[0], destPt[1]);

    if (distToDest < 0.05) { // Si está a menos de 50 metros del destino final
      this.showToast('🏁 ¡Has llegado a tu destino con éxito y seguridad!');
      this.stopNavigation();
      return;
    }

    // 2. Re-routing automático al estilo Google Maps si nos desviamos (Ej. > 250m)
    const deviation = this.getMinDistanceToRoute(lat, lon);
    if (deviation > 0.25) { 
      const typeLabel = this.selectedRouteType === 'SAFE' ? 'segura' : 'rápida';
      this.showToast(`🔄 Te has desviado. Recalculando ruta ${typeLabel}...`);
      this.origin = `${lat.toFixed(6)},${lon.toFixed(6)}`;
      this.calculateRoute();
      return;
    }

    // 3. Telemetría y tramo de riesgo actual
    this.updateNavigationTelemetry(lat, lon);
  }

  updateNavigationTelemetry(lat: number, lon: number) {
    if (!this.routeData || !this.routeData.segments) return;

    let closestSegment: any = null;
    let minDist = Number.MAX_VALUE;
    let segmentIndex = 0;

    this.routeData.segments.forEach((seg: any, idx: number) => {
      seg.points.forEach((pt: any) => {
        const d = this.calculateDistance(lat, lon, pt[0], pt[1]);
        if (d < minDist) {
          minDist = d;
          closestSegment = seg;
          segmentIndex = idx;
        }
      });
    });

    if (closestSegment) {
      this.navCurrentRisk = closestSegment.risk;
      this.navClosestHospitalName = closestSegment.closestHospitalName;
      this.navClosestHospitalTime = closestSegment.minutesToClosestHospital;

      let remainingDistance = 0;
      const currentSegPoints = closestSegment.points;
      const lastPointOfCurrentSeg = currentSegPoints[currentSegPoints.length - 1];
      remainingDistance += this.calculateDistance(lat, lon, lastPointOfCurrentSeg[0], lastPointOfCurrentSeg[1]);

      for (let i = segmentIndex + 1; i < this.routeData.segments.length; i++) {
        const seg = this.routeData.segments[i];
        for (let j = 0; j < seg.points.length - 1; j++) {
          remainingDistance += this.calculateDistance(
            seg.points[j][0], seg.points[j][1],
            seg.points[j+1][0], seg.points[j+1][1]
          );
        }
      }

      this.navRemainingDistance = Math.max(0, Math.round(remainingDistance * 10) / 10) + ' km';
      
      const origDist = parseFloat(this.routeData.distance) || 1;
      const origDur = parseFloat(this.routeData.duration) || 0;
      const ratio = origDur / origDist;
      
      const remainingMinutes = remainingDistance * ratio * 60;
      this.navRemainingDuration = this.formatDuration(remainingMinutes / 60);
    }
  }

  getMinDistanceToRoute(lat: number, lon: number): number {
    let minDist = Number.MAX_VALUE;
    if (!this.routeData || !this.routeData.segments) return 0;

    this.routeData.segments.forEach((seg: any) => {
      seg.points.forEach((pt: any) => {
        const d = this.calculateDistance(lat, lon, pt[0], pt[1]);
        if (d < minDist) {
          minDist = d;
        }
      });
    });
    return minDist;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  stopNavigation() {
    if (this.geolocationWatchId) {
      Geolocation.clearWatch({ id: this.geolocationWatchId });
      this.geolocationWatchId = null;
    }

    if (this.navigationMarker) {
      this.navigationMarker.remove();
      this.navigationMarker = null;
    }

    this.isNavigating = false;

    // Centrar la vista a la ruta original completa (zoom general)
    if (this.routePolylines.length > 0 && this.routeData && this.routeData.segments) {
      const bounds: L.LatLng[] = [];
      this.routeData.segments.forEach((seg: any) => {
        seg.points.forEach((p: any) => bounds.push(new L.LatLng(p[0], p[1])));
      });
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
  }
}
