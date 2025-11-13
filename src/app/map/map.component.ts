import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

interface GeoJSONFeature {
  type: string;
  properties: any;
  geometry: any;
}

interface GeoJSON {
  type: string;
  features: GeoJSONFeature[];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<SVGSVGElement>;

  private svg: any = null;
  private projection: any = null;
  private path: any = null;
  private countriesSub: Subscription | null = null;
  private worldData: GeoJSON | null = null;
  private countriesData: any[] = [];
  private mapInitialized: boolean = false;
  private width: number = 0;
  private height: number = 0;
  nightMode: boolean = false;
  showMarkers: boolean = false; // Hide markers by default
  private clickedCountryFeature: GeoJSONFeature | null = null;

  constructor(
    private appService: AppService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngAfterViewInit(): void {
    // Subscribe to theme changes
    this.appService.getMode().subscribe((mode) => {
      const previousMode = this.nightMode;
      this.nightMode = mode;
      if (this.mapInitialized && previousMode !== mode) {
        this.updateMapTheme();
      }
    });

    // Hide click tooltip when clicking outside
    document.addEventListener('click', this.clickOutsideHandler);

    this.cdr.detectChanges();
    this.ensureContainerReady(() => {
      this.initMap();
      this.loadWorldGeoJSON();
      this.loadCountries();
    });
  }

  private ensureContainerReady(callback: () => void): void {
    const element = this.mapContainer?.nativeElement;
    if (!element) {
      setTimeout(() => this.ensureContainerReady(callback), 100);
      return;
    }

    const checkDimensions = () => {
      const rect = element.getBoundingClientRect();
      const hasDimensions = rect.width > 0 && rect.height > 0;

      if (hasDimensions) {
        this.width = rect.width;
        this.height = rect.height;
        callback();
      } else {
        setTimeout(checkDimensions, 100);
      }
    };

    checkDimensions();
  }

  private initMap(): void {
    if (this.mapInitialized) {
      return;
    }

    const element = this.mapContainer.nativeElement;
    
    // Clear any existing content
    d3.select(element).selectAll('*').remove();

    // Set dimensions
    this.width = element.clientWidth || window.innerWidth - 200;
    this.height = element.clientHeight || Math.max(window.innerHeight * 0.7, 450);

    // Create SVG
    this.svg = d3.select(element)
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mouseleave', () => {
        // Hide all tooltips when mouse leaves the map area
        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip.transition()
            .duration(150)
            .style('opacity', 0);
        }
        const clickTooltip = d3.select('body').select('.map-click-tooltip');
        if (clickTooltip.node()) {
          clickTooltip.transition()
            .duration(150)
            .style('opacity', 0);
        }
      });

    // Create projection (equirectangular for world map)
    this.projection = d3.geoEquirectangular()
      .scale(this.width / (2 * Math.PI))
      .translate([this.width / 2, this.height / 2]);

    // Create path generator
    this.path = d3.geoPath().projection(this.projection);

    // Handle window resize
    window.addEventListener('resize', this.onResize);

    this.mapInitialized = true;
  }

  private loadWorldGeoJSON(): void {
    // Load world GeoJSON from a public CDN
    // Using a simplified world map from Natural Earth data
    const geoJsonUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
    
    this.http.get<GeoJSON>(geoJsonUrl).subscribe({
      next: (data) => {
        this.worldData = data;
        this.drawMap();
      },
      error: (error) => {
        console.error('Error loading GeoJSON:', error);
        // Fallback: try alternative source
        this.loadAlternativeGeoJSON();
      }
    });
  }

  private loadAlternativeGeoJSON(): void {
    // Alternative GeoJSON source
    const altUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    this.http.get<any>(altUrl).subscribe({
      next: (data) => {
        // Convert topojson to geojson if needed
        if (data.type === 'Topology') {
          // For now, we'll use a simple fallback
          this.createSimpleMap();
        } else {
          this.worldData = data;
          this.drawMap();
        }
      },
      error: () => {
        this.createSimpleMap();
      }
    });
  }

  private createSimpleMap(): void {
    // Markers are disabled - if GeoJSON fails, we'll just show an empty map
    console.warn('Unable to load GeoJSON data. Map will not display country shapes.');
    return;
  }

  private drawMap(): void {
    if (!this.worldData || !this.svg || !this.path || !this.projection) {
      return;
    }

    // Remove any existing markers before drawing
    this.svg.selectAll('.country-markers').remove();
    this.svg.selectAll('.markers').remove();

    // Fit projection to the GeoJSON bounds
    this.projection.fitSize([this.width, this.height], this.worldData as any);

    // Get or create hover tooltip container
    let tooltip = d3.select('body').select('.map-tooltip').node() 
      ? d3.select('body').select('.map-tooltip')
      : d3.select('body').append('div')
          .attr('class', 'map-tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background-color', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');

    // Get or create clickable tooltip container
    let clickTooltip = d3.select('body').select('.map-click-tooltip');
    if (!clickTooltip.node()) {
      clickTooltip = d3.select('body').append('div')
        .attr('class', 'map-click-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '10px 14px')
        .style('border-radius', '6px')
        .style('font-size', '13px')
        .style('pointer-events', 'auto')
        .style('z-index', '1001')
        .style('box-shadow', '0 4px 12px rgba(0,0,0,0.4)')
        .style('cursor', 'pointer')
        .style('min-width', '120px')
        .on('click', () => {
          if (this.clickedCountryFeature) {
            this.handleCountryClick(this.clickedCountryFeature);
            this.hideClickTooltip();
          }
        });
    }

    // Draw countries
    const countries = this.svg.append('g').attr('class', 'countries');

    const fillColor = this.nightMode ? '#3a3f4a' : '#e8e8e8';
    const strokeColor = this.nightMode ? '#4a4f5a' : '#fff';
    const hoverFill = this.nightMode ? '#ffeb3b' : '#7db3e0';
    const hoverStroke = this.nightMode ? '#ffd700' : '#4a90e2';
    const component = this; // Store component reference

    countries.selectAll('path')
      .data(this.worldData.features)
      .enter()
      .append('path')
      .attr('d', this.path as any)
      .attr('fill', fillColor)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event: any, d: any) {
        const path = d3.select(this);
        // Get current nightMode state from component
        const isDarkMode = component.nightMode;
        const currentHoverFill = isDarkMode ? '#ffeb3b' : '#7db3e0';
        const currentHoverStroke = isDarkMode ? '#ffd700' : '#4a90e2';
        
        path
          .attr('fill', currentHoverFill)
          .attr('stroke', currentHoverStroke)
          .attr('stroke-width', 2.5)
          .style('filter', isDarkMode ? 'brightness(1.8) saturate(1.5)' : 'brightness(1.1)')
          .raise(); // Bring to front

        // Show tooltip on hover with country name
        const countryName = d.properties?.NAME || 
                           d.properties?.name || 
                           d.properties?.NAME_LONG || 
                           d.properties?.ADMIN ||
                           d.properties?.NAME_EN ||
                           'Unknown Country';
        
        const mouseEvent = event || d3.event;
        tooltip.transition()
          .duration(150)
          .style('opacity', 0.95);
        tooltip.html(`<strong>${countryName}</strong>`)
          .style('left', ((mouseEvent.pageX || 0) + 15) + 'px')
          .style('top', ((mouseEvent.pageY || 0) - 35) + 'px');
      })
      .on('mousemove', function(event: any) {
        // Update tooltip position as mouse moves
        const mouseEvent = event || d3.event;
        tooltip
          .style('left', ((mouseEvent.pageX || 0) + 15) + 'px')
          .style('top', ((mouseEvent.pageY || 0) - 35) + 'px');
      })
      .on('mouseout', function(event: any, d: any) {
        const path = d3.select(this);
        path
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', 0.5)
          .style('filter', null);

        // Hide hover tooltip
        tooltip.transition()
          .duration(150)
          .style('opacity', 0);
        
        // Also hide click tooltip if visible
        const clickTooltip = d3.select('body').select('.map-click-tooltip');
        if (clickTooltip.node()) {
          clickTooltip.transition()
            .duration(150)
            .style('opacity', 0);
        }
      })
      .on('click', function(d: any) {
        const event = d3.event as MouseEvent;
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        
        // Store clicked country
        this.clickedCountryFeature = d;
        
        // Show clickable tooltip with country name
        const countryName = d.properties?.NAME || 
                           d.properties?.name || 
                           d.properties?.NAME_LONG || 
                           d.properties?.ADMIN ||
                           d.properties?.NAME_EN ||
                           'Unknown Country';
        
        const mouseX = event ? event.pageX : 0;
        const mouseY = event ? event.pageY : 0;
        
        const clickTooltipEl = d3.select('body').select('.map-click-tooltip');
        clickTooltipEl.transition()
          .duration(200)
          .style('opacity', 1);
        clickTooltipEl.html(`<strong style="cursor: pointer; text-decoration: underline;">${countryName}</strong><br/><small style="opacity: 0.8;">Click to view details</small>`)
          .style('left', (mouseX + 15) + 'px')
          .style('top', (mouseY - 50) + 'px');

        // Hide hover tooltip if visible
        const tooltipEl = d3.select('body').select('.map-tooltip');
        tooltipEl.transition()
          .duration(150)
          .style('opacity', 0);
      }.bind(this));

    // Markers are hidden by default - only show if explicitly enabled
    // if (this.showMarkers) {
    //   this.addCountryMarkers();
    // }
  }

  private drawCountriesFromAPI(): void {
    // Markers are disabled - this method is kept for fallback but doesn't draw anything
    // If GeoJSON fails to load, we'll just show an empty map rather than dots
    console.warn('GeoJSON failed to load. Map will not display country shapes.');
    return;
  }

  private addCountryMarkers(): void {
    // Markers are disabled - this method does nothing
    return;
  }

  private handleCountryClick(feature: GeoJSONFeature): void {
    // Try to match country by name
    const countryName = feature.properties?.NAME || 
                       feature.properties?.name || 
                       feature.properties?.NAME_LONG ||
                       feature.properties?.ADMIN ||
                       feature.properties?.NAME_EN;
    
    if (countryName && this.countriesData.length > 0) {
      // Normalize country names for better matching
      const normalizeName = (name: string) => {
        return name.toLowerCase()
          .replace(/^the\s+/, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const normalizedGeoName = normalizeName(countryName);

      // Special cases for common mismatches
      const nameMappings: { [key: string]: string[] } = {
        'united states': ['united states of america', 'usa', 'united states'],
        'united states of america': ['united states of america', 'usa', 'united states'],
        'usa': ['united states of america', 'usa', 'united states'],
        'russia': ['russian federation', 'russia'],
        'russian federation': ['russian federation', 'russia'],
        'uk': ['united kingdom', 'uk'],
        'united kingdom': ['united kingdom', 'uk'],
        'czech republic': ['czechia', 'czech republic'],
        'czechia': ['czechia', 'czech republic'],
        'myanmar': ['myanmar', 'burma'],
        'burma': ['myanmar', 'burma']
      };

      // Try exact match first
      let country = this.countriesData.find((c: any) => {
        const commonName = c.name?.common || c.name;
        const officialName = c.name?.official || '';
        if (!commonName) return false;
        
        const normalizedCommon = normalizeName(commonName);
        const normalizedOfficial = officialName ? normalizeName(officialName) : '';
        
        // Check exact match
        if (normalizedCommon === normalizedGeoName || normalizedOfficial === normalizedGeoName) {
          return true;
        }
        
        // Check name mappings
        const possibleNames = nameMappings[normalizedGeoName] || [];
        if (possibleNames.some(n => normalizedCommon === normalizeName(n) || normalizedOfficial === normalizeName(n))) {
          return true;
        }
        
        return false;
      });

      // Try partial match if exact match fails
      if (!country) {
        country = this.countriesData.find((c: any) => {
          const commonName = c.name?.common || c.name;
          const officialName = c.name?.official || '';
          const altNames = c.name?.nativeName || {};
          const allNames = [
            commonName, 
            officialName,
            ...Object.values(altNames).map((n: any) => typeof n === 'object' ? n.common || n.official : n)
          ].filter(Boolean);
          
          return allNames.some((name: any) => {
            if (typeof name !== 'string') return false;
            const normalized = normalizeName(name);
            return normalized.includes(normalizedGeoName) || 
                   normalizedGeoName.includes(normalized) ||
                   normalized === normalizedGeoName;
          });
        });
      }

      if (country) {
        const code = (country.cca2 || country.cca3 || '').toLowerCase();
        if (code) {
          this.router.navigate(['/alpha', code]);
        }
      } else {
        console.log('Country not found:', countryName);
      }
    }
  }

  private loadCountries(): void {
    this.countriesSub = this.appService.getCountriesData().subscribe((countries: any[]) => {
      this.countriesData = Array.isArray(countries) ? countries : [];
      // Markers are disabled - only show country shapes from GeoJSON
      // No need to call drawCountriesFromAPI() as markers are not wanted
    });
  }

  private hideClickTooltip(): void {
    const clickTooltip = d3.select('body').select('.map-click-tooltip');
    if (clickTooltip.node()) {
      clickTooltip.transition()
        .duration(200)
        .style('opacity', 0);
    }
    this.clickedCountryFeature = null;
  }

  private clickOutsideHandler = (event: MouseEvent) => {
    const clickTooltip = d3.select('body').select('.map-click-tooltip');
    if (clickTooltip.node() && clickTooltip.style('opacity') !== '0') {
      // Check if click is not on the tooltip itself
      const tooltipNode = clickTooltip.node() as HTMLElement;
      if (tooltipNode && !tooltipNode.contains(event.target as Node)) {
        // Also check if click is not on a country path
        const target = event.target as HTMLElement;
        if (!target.closest('.countries path')) {
          this.hideClickTooltip();
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.countriesSub) {
      this.countriesSub.unsubscribe();
      this.countriesSub = null;
    }
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('click', this.clickOutsideHandler);
    // Remove tooltips
    d3.selectAll('.map-tooltip').remove();
    d3.selectAll('.map-click-tooltip').remove();
    this.mapInitialized = false;
  }

  private updateMapTheme(): void {
    if (!this.svg || !this.worldData) {
      return;
    }

    const fillColor = this.nightMode ? '#3a3f4a' : '#e8e8e8';
    const strokeColor = this.nightMode ? '#4a4f5a' : '#fff';
    const markerFill = this.nightMode ? '#ff6b6b' : '#e74c3c';
    const component = this; // Store component reference

    // Update country paths - need to update both fill and re-apply hover handlers
    this.svg.selectAll('.countries path')
      .attr('fill', fillColor)
      .attr('stroke', strokeColor)
      .on('mouseover', function(event: any, d: any) {
        const isDarkMode = component.nightMode;
        const hoverFill = isDarkMode ? '#ffeb3b' : '#7db3e0';
        const hoverStroke = isDarkMode ? '#ffd700' : '#4a90e2';
        const path = d3.select(this);
        path
          .attr('fill', hoverFill)
          .attr('stroke', hoverStroke)
          .attr('stroke-width', 2.5)
          .style('filter', isDarkMode ? 'brightness(1.8) saturate(1.5)' : 'brightness(1.1)')
          .raise(); // Bring to front

        // Show tooltip on hover
        const countryName = d.properties?.NAME || 
                           d.properties?.name || 
                           d.properties?.NAME_LONG || 
                           d.properties?.ADMIN ||
                           d.properties?.NAME_EN ||
                           'Unknown Country';
        
        const mouseEvent = event || d3.event;
        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 1);
          tooltip.html(`<strong>${countryName}</strong>`)
            .style('left', ((mouseEvent.pageX || 0) + 10) + 'px')
            .style('top', ((mouseEvent.pageY || 0) - 30) + 'px');
        }
      })
      .on('mousemove', function(event: any) {
        // Update tooltip position as mouse moves
        const mouseEvent = event || d3.event;
        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip
            .style('left', ((mouseEvent.pageX || 0) + 10) + 'px')
            .style('top', ((mouseEvent.pageY || 0) - 30) + 'px');
        }
      })
      .on('mouseout', function(event: any) {
        const path = d3.select(this);
        path
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', 0.5)
          .style('filter', null);

        // Hide hover tooltip
        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        }
        
        // Also hide click tooltip if visible
        const clickTooltip = d3.select('body').select('.map-click-tooltip');
        if (clickTooltip.node()) {
          clickTooltip.transition()
            .duration(200)
            .style('opacity', 0);
        }
      });

    // Remove any existing markers (markers are disabled)
    this.svg.selectAll('.country-markers').remove();
    this.svg.selectAll('.markers').remove();
  }

  private onResize = (): void => {
    if (this.mapInitialized && this.mapContainer?.nativeElement) {
      const element = this.mapContainer.nativeElement;
      this.width = element.clientWidth || window.innerWidth - 200;
      this.height = element.clientHeight || Math.max(window.innerHeight * 0.7, 450);

      if (this.svg && this.projection) {
        this.svg.attr('width', this.width).attr('height', this.height);
        this.projection.scale(this.width / (2 * Math.PI))
          .translate([this.width / 2, this.height / 2]);

        if (this.worldData) {
          this.projection.fitSize([this.width, this.height], this.worldData as any);
        }

        // Redraw map
        if (this.worldData) {
          d3.select(element).selectAll('*').remove();
          this.initMap();
          this.drawMap();
        }
      }
    }
  }
}
