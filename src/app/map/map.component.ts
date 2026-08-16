import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

interface GeoJSONFeature {
  type: string;
  id?: string;
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
  showMarkers: boolean = false;
  private clickedCountryFeature: GeoJSONFeature | null = null;

  constructor(
    private appService: AppService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    this.appService.getMode().subscribe((mode) => {
      const previousMode = this.nightMode;
      this.nightMode = mode;
      if (this.mapInitialized && previousMode !== mode) {
        this.updateMapTheme();
      }
    });

    document.addEventListener('click', this.clickOutsideHandler);

    this.cdr.detectChanges();
    this.ensureContainerReady(() => {
      this.initMap();
      this.loadCountries();
      this.loadWorldGeoJSON();
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
    
    d3.select(element).selectAll('*').remove();

    this.width = element.clientWidth || (window.innerWidth - 80);
    this.height = element.clientHeight || (window.innerHeight - 170);

    this.svg = d3.select(element)
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mouseleave', () => {
        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip.transition().duration(150).style('opacity', 0);
        }
      });

    this.projection = d3.geoEquirectangular()
      .scale(this.width / (2 * Math.PI))
      .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath().projection(this.projection);

    window.addEventListener('resize', this.onResize);
    this.mapInitialized = true;
  }

  private loadWorldGeoJSON(): void {
    const geoJsonUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
    
    this.http.get<GeoJSON>(geoJsonUrl).subscribe({
      next: (data) => {
        this.worldData = data;
        this.drawMap();
      },
      error: (error) => {
        console.error('Error loading GeoJSON:', error);
      }
    });
  }

  /**
   * Universal D3 datum & event resolver compatible with D3 v3, v4, v5, and v6+
   */
  public resolveDatum(arg1: any, arg2: any): { d: any; event: MouseEvent } {
    let d: any;
    let event: any;
    if (arg1 && (arg1.properties || arg1.geometry || arg1.id || arg1.type === 'Feature')) {
      d = arg1;
      event = (typeof d3 !== 'undefined' && d3.event) ? d3.event : (arg2 || window.event);
    } else if (arg2 && (arg2.properties || arg2.geometry || arg2.id || arg2.type === 'Feature')) {
      d = arg2;
      event = arg1 || (typeof d3 !== 'undefined' ? d3.event : window.event);
    } else {
      d = arg1 || arg2;
      event = (typeof d3 !== 'undefined' && d3.event) ? d3.event : window.event;
    }
    return { d, event };
  }

  public findCountry(d: any): any {
    if (!d || !this.countriesData || this.countriesData.length === 0) {
      return null;
    }

    const featureId = (d.id || '').toString().trim().toUpperCase();
    const name = (d.properties?.name || d.properties?.NAME || d.properties?.NAME_LONG || d.properties?.ADMIN || d.properties?.NAME_EN || '').toString().trim();

    // 1. Exact match by ISO alpha-3 / alpha-2 ID
    if (featureId) {
      const byId = this.countriesData.find((c: any) =>
        (c.cca3 && c.cca3.toUpperCase() === featureId) ||
        (c.cca2 && c.cca2.toUpperCase() === featureId) ||
        (c.codes?.alpha_3 && c.codes.alpha_3.toUpperCase() === featureId) ||
        (c.codes?.alpha_2 && c.codes.alpha_2.toUpperCase() === featureId)
      );
      if (byId) return byId;
    }

    // 2. Match by exact common or official name
    if (name) {
      const lower = name.toLowerCase();
      const byName = this.countriesData.find((c: any) =>
        (c.name?.common && c.name.common.toLowerCase() === lower) ||
        (c.name?.official && c.name.official.toLowerCase() === lower) ||
        (c.names?.common && c.names.common.toLowerCase() === lower)
      );
      if (byName) return byName;

      // 3. Match by normalized alias
      const norm = lower.replace(/^the\s+/, '').replace(/[^a-z0-9]/g, '');
      const byNorm = this.countriesData.find((c: any) => {
        const cNorm = (c.name?.common || c.names?.common || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]/g, '');
        return cNorm && (cNorm === norm || cNorm.includes(norm) || norm.includes(cNorm));
      });
      if (byNorm) return byNorm;
    }

    return null;
  }

  private drawMap(): void {
    if (!this.worldData || !this.svg || !this.path || !this.projection) {
      return;
    }

    this.svg.selectAll('.countries').remove();

    this.projection.fitSize([this.width, this.height], this.worldData as any);

    // Hover tooltip container
    let tooltip = d3.select('body').select('.map-tooltip');
    if (!tooltip.node()) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'map-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.85)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
    }

    // Clickable tooltip container
    let clickTooltip = d3.select('body').select('.map-click-tooltip');
    if (!clickTooltip.node()) {
      clickTooltip = d3.select('body').append('div')
        .attr('class', 'map-click-tooltip')
        .style('opacity', 0)
        .style('display', 'none')
        .style('position', 'absolute')
        .style('background-color', 'rgba(23, 27, 34, 0.96)')
        .style('color', 'white')
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('font-size', '13px')
        .style('pointer-events', 'auto')
        .style('z-index', '1001')
        .style('box-shadow', '0 8px 24px rgba(0,0,0,0.5)')
        .style('min-width', '180px')
        .style('max-width', '260px')
        .style('border', '1px solid rgba(255, 255, 255, 0.15)');
    }

    const countries = this.svg.append('g').attr('class', 'countries');

    const fillColor = this.nightMode ? '#3a3f4a' : '#e8e8e8';
    const strokeColor = this.nightMode ? '#4a4f5a' : '#fff';
    const component = this;

    countries.selectAll('path')
      .data(this.worldData.features)
      .enter()
      .append('path')
      .attr('d', this.path as any)
      .attr('fill', fillColor)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(arg1: any, arg2: any) {
        const { d, event } = component.resolveDatum(arg1, arg2);
        const path = d3.select(this);
        const isDarkMode = component.nightMode;
        const currentHoverFill = isDarkMode ? '#ffeb3b' : '#7db3e0';
        const currentHoverStroke = isDarkMode ? '#ffd700' : '#4a90e2';
        
        path
          .attr('fill', currentHoverFill)
          .attr('stroke', currentHoverStroke)
          .attr('stroke-width', 2.5)
          .style('filter', isDarkMode ? 'brightness(1.8) saturate(1.5)' : 'brightness(1.1)')
          .raise();

        const matched = component.findCountry(d);
        const countryName = matched?.name?.common || d?.properties?.name || d?.id || 'Unknown Country';
        
        const mouseX = event ? (event.pageX || 0) : 0;
        const mouseY = event ? (event.pageY || 0) : 0;

        tooltip.transition().duration(100).style('opacity', 0.95);
        tooltip.html(`<strong>${countryName}</strong>`)
          .style('left', (mouseX + 15) + 'px')
          .style('top', (mouseY - 35) + 'px');
      })
      .on('mousemove', function(arg1: any, arg2: any) {
        const { event } = component.resolveDatum(arg1, arg2);
        const mouseX = event ? (event.pageX || 0) : 0;
        const mouseY = event ? (event.pageY || 0) : 0;
        tooltip
          .style('left', (mouseX + 15) + 'px')
          .style('top', (mouseY - 35) + 'px');
      })
      .on('mouseout', function() {
        const path = d3.select(this);
        path
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', 0.5)
          .style('filter', null);

        tooltip.transition().duration(150).style('opacity', 0);
      })
      .on('click', function(arg1: any, arg2: any) {
        const { d, event } = component.resolveDatum(arg1, arg2);
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        
        component.clickedCountryFeature = d;
        const matched = component.findCountry(d);
        const countryName = matched?.name?.common || d?.properties?.name || d?.id || 'Unknown Country';
        const flagSrc = matched?.flags?.png || matched?.flags?.svg || '';

        const mouseX = event ? (event.pageX || 0) : 0;
        const mouseY = event ? (event.pageY || 0) : 0;
        
        const clickTooltipEl = d3.select('body').select('.map-click-tooltip');
        clickTooltipEl.interrupt();
        clickTooltipEl.style('display', 'block')
          .style('opacity', 1);

        let content = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${flagSrc ? `<img src="${flagSrc}" alt="" style="width: 26px; height: 17px; object-fit: cover; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);" />` : ''}
              <strong style="font-size: 14px; font-weight: 700; color: #ffffff;">${countryName}</strong>
            </div>
            <span id="close-map-popup" style="cursor: pointer; font-size: 18px; color: #aaa; margin-left: 10px; line-height: 1;">&times;</span>
          </div>
        `;

        if (matched) {
          if (matched.capital && matched.capital.length) {
            content += `<div style="font-size: 12px; color: #ddd; margin-bottom: 3px;"><strong>Capital:</strong> ${matched.capital[0]}</div>`;
          }
          if (matched.population) {
            content += `<div style="font-size: 12px; color: #ddd; margin-bottom: 8px;"><strong>Population:</strong> ${Number(matched.population).toLocaleString()}</div>`;
          }
        }

        content += `
          <button id="view-country-btn" style="background: #3498db; color: #ffffff; border: none; border-radius: 4px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 6px; transition: background 0.2s;">
            View Details &rarr;
          </button>
        `;

        clickTooltipEl.html(content)
          .style('left', (mouseX + 15) + 'px')
          .style('top', Math.max(10, mouseY - 60) + 'px');

        d3.select('#close-map-popup').on('click', (ev: any) => {
          const e = d3.event || ev;
          if (e && e.stopPropagation) e.stopPropagation();
          component.hideClickTooltip();
        });

        d3.select('#view-country-btn').on('click', (ev: any) => {
          const e = d3.event || ev;
          if (e && e.stopPropagation) e.stopPropagation();
          component.handleCountryClick(d);
          component.hideClickTooltip();
        });

        tooltip.style('opacity', 0);
      });
  }

  public handleCountryClick(d: any): void {
    const matched = this.findCountry(d);
    const code = matched?.cca2 || matched?.cca3 || d?.id || d?.properties?.name;
    if (code) {
      this.ngZone.run(() => {
        this.router.navigate(['/alpha', code.toString().toLowerCase()]);
      });
    } else {
      console.warn('Could not navigate to country for datum:', d);
    }
  }

  private loadCountries(): void {
    this.countriesSub = this.appService.getCountriesData().subscribe((countries: any[]) => {
      this.countriesData = Array.isArray(countries) ? countries : [];
    });
  }

  private hideClickTooltip(): void {
    const clickTooltip = d3.select('body').select('.map-click-tooltip');
    if (clickTooltip.node()) {
      clickTooltip.style('display', 'none').style('opacity', 0);
    }
    this.clickedCountryFeature = null;
  }

  private clickOutsideHandler = (event: MouseEvent) => {
    const clickTooltip = d3.select('body').select('.map-click-tooltip');
    if (clickTooltip.node() && clickTooltip.style('opacity') !== '0' && clickTooltip.style('display') !== 'none') {
      const tooltipNode = clickTooltip.node() as HTMLElement;
      if (tooltipNode && !tooltipNode.contains(event.target as Node)) {
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
    const component = this;

    this.svg.selectAll('.countries path')
      .attr('fill', fillColor)
      .attr('stroke', strokeColor)
      .on('mouseover', function(arg1: any, arg2: any) {
        const { d, event } = component.resolveDatum(arg1, arg2);
        const isDarkMode = component.nightMode;
        const hoverFill = isDarkMode ? '#ffeb3b' : '#7db3e0';
        const hoverStroke = isDarkMode ? '#ffd700' : '#4a90e2';
        const path = d3.select(this);
        path
          .attr('fill', hoverFill)
          .attr('stroke', hoverStroke)
          .attr('stroke-width', 2.5)
          .style('filter', isDarkMode ? 'brightness(1.8) saturate(1.5)' : 'brightness(1.1)')
          .raise();

        const matched = component.findCountry(d);
        const countryName = matched?.name?.common || d?.properties?.name || d?.id || 'Unknown Country';
        
        const mouseX = event ? (event.pageX || 0) : 0;
        const mouseY = event ? (event.pageY || 0) : 0;

        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip.transition().duration(100).style('opacity', 0.95);
          tooltip.html(`<strong>${countryName}</strong>`)
            .style('left', (mouseX + 15) + 'px')
            .style('top', (mouseY - 35) + 'px');
        }
      })
      .on('mousemove', function(arg1: any, arg2: any) {
        const { event } = component.resolveDatum(arg1, arg2);
        const mouseX = event ? (event.pageX || 0) : 0;
        const mouseY = event ? (event.pageY || 0) : 0;
        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip
            .style('left', (mouseX + 15) + 'px')
            .style('top', (mouseY - 35) + 'px');
        }
      })
      .on('mouseout', function() {
        const path = d3.select(this);
        path
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', 0.5)
          .style('filter', null);

        const tooltip = d3.select('body').select('.map-tooltip');
        if (tooltip.node()) {
          tooltip.transition().duration(150).style('opacity', 0);
        }
      });
  }

  private onResize = (): void => {
    if (this.mapInitialized && this.mapContainer?.nativeElement) {
      const element = this.mapContainer.nativeElement;
      this.width = element.clientWidth || (window.innerWidth - 80);
      this.height = element.clientHeight || (window.innerHeight - 170);

      if (this.svg && this.projection) {
        this.svg.attr('width', this.width).attr('height', this.height);
        this.projection.scale(this.width / (2 * Math.PI))
          .translate([this.width / 2, this.height / 2]);

        if (this.worldData) {
          this.projection.fitSize([this.width, this.height], this.worldData as any);
          d3.select(element).selectAll('*').remove();
          this.initMap();
          this.drawMap();
        }
      }
    }
  }
}
