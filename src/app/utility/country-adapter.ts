export interface NormalizedCountry {
  name: {
    common: string;
    official: string;
    nativeName: { [key: string]: { common: string; official: string } };
  };
  names?: any;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  flag?: any;
  cca2: string;
  cca3: string;
  codes?: any;
  population: number;
  region: string;
  subregion: string;
  capital: string[];
  capitals?: any[];
  tld: string[];
  tlds?: string[];
  currencies: { [key: string]: { name: string; symbol?: string } };
  languages: { [key: string]: string };
  borders: string[];
  latlng: number[];
  coordinates?: { lat: number; lng: number };
  [key: string]: any;
}

// Fallback flags for territories missing flags in the v5 dataset
const TERRITORY_FALLBACKS: { [key: string]: { flag_png: string; flag_svg: string; cca2: string; cca3: string } } = {
  'abkhazia': {
    flag_png: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_the_Republic_of_Abkhazia.svg/640px-Flag_of_the_Republic_of_Abkhazia.svg.png',
    flag_svg: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flag_of_the_Republic_of_Abkhazia.svg',
    cca2: 'AB',
    cca3: 'ABH'
  },
  'northern cyprus': {
    flag_png: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg/640px-Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg.png',
    flag_svg: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg',
    cca2: 'NC',
    cca3: 'NCY'
  },
  'somaliland': {
    flag_png: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Flag_of_Somaliland.svg/640px-Flag_of_Somaliland.svg.png',
    flag_svg: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Flag_of_Somaliland.svg',
    cca2: 'SL',
    cca3: 'SML'
  },
  'south ossetia': {
    flag_png: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_South_Ossetia.svg/640px-Flag_of_South_Ossetia.svg.png',
    flag_svg: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Flag_of_South_Ossetia.svg',
    cca2: 'OS',
    cca3: 'OST'
  }
};

export class CountryAdapter {
  /**
   * Normalizes a REST Countries v5 object to maintain backwards compatibility
   * with legacy v3.1 structure while preserving all v5 properties.
   */
  public static normalize(country: any): NormalizedCountry {
    if (!country) {
      return country;
    }

    // Handle names
    const rawNames = country.names || country.name || {};
    const commonName = typeof rawNames === 'string' ? rawNames : (rawNames.common || '');
    const officialName = rawNames.official || commonName;
    const nativeMap: { [key: string]: { common: string; official: string } } = {};

    const rawNative = rawNames.native || rawNames.nativeName || {};
    if (typeof rawNative === 'object' && rawNative !== null) {
      Object.keys(rawNative).forEach((langKey) => {
        const item = rawNative[langKey];
        if (typeof item === 'object' && item !== null) {
          nativeMap[langKey] = {
            common: item.common || item.name || '',
            official: item.official || item.common || ''
          };
        } else if (typeof item === 'string') {
          nativeMap[langKey] = { common: item, official: item };
        }
      });
    }

    const normKey = commonName.trim().toLowerCase();
    const fallback = TERRITORY_FALLBACKS[normKey];

    // Handle flags
    const rawFlag = country.flag || country.flags || {};
    let pngFlag = rawFlag.url_png || rawFlag.png || '';
    let svgFlag = rawFlag.url_svg || rawFlag.svg || '';
    const altFlag = rawFlag.description || rawFlag.alt || commonName;

    if (!pngFlag && fallback) {
      pngFlag = fallback.flag_png;
      svgFlag = fallback.flag_svg;
    }

    // Handle codes
    const rawCodes = country.codes || {};
    let cca2 = (rawCodes.alpha_2 || country.cca2 || '').toUpperCase();
    let cca3 = (rawCodes.alpha_3 || country.cca3 || '').toUpperCase();

    if (!cca2 && fallback) {
      cca2 = fallback.cca2;
      cca3 = fallback.cca3;
    }

    // Handle capitals
    let capitalList: string[] = [];
    if (Array.isArray(country.capitals)) {
      capitalList = country.capitals.map((cap: any) => {
        if (typeof cap === 'string') {
          return cap;
        }
        return cap?.name || '';
      }).filter((c: string) => !!c);
    } else if (Array.isArray(country.capital)) {
      capitalList = country.capital.map((c: any) => typeof c === 'string' ? c : (c?.name || ''));
    } else if (typeof country.capital === 'string') {
      capitalList = [country.capital];
    }

    // Handle currencies
    const currencyMap: { [key: string]: { name: string; symbol?: string } } = {};
    if (Array.isArray(country.currencies)) {
      country.currencies.forEach((cur: any) => {
        if (cur && cur.code) {
          currencyMap[cur.code] = {
            name: cur.name || cur.code,
            symbol: cur.symbol || ''
          };
        }
      });
    } else if (typeof country.currencies === 'object' && country.currencies !== null) {
      Object.assign(currencyMap, country.currencies);
    }

    // Handle languages
    const languageMap: { [key: string]: string } = {};
    if (Array.isArray(country.languages)) {
      country.languages.forEach((lang: any) => {
        if (lang) {
          const key = lang.bcp47 || lang.iso639_1 || lang.iso639_2b || lang.name || 'lang';
          languageMap[key] = lang.name || lang.native_name || '';
        }
      });
    } else if (typeof country.languages === 'object' && country.languages !== null) {
      Object.assign(languageMap, country.languages);
    }

    // Handle Top Level Domains (tld / tlds)
    let tldList: string[] = [];
    if (Array.isArray(country.tlds)) {
      tldList = country.tlds;
    } else if (Array.isArray(country.tld)) {
      tldList = country.tld;
    }

    // Handle coordinates (latlng / coordinates)
    let latlngList: number[] = [];
    if (country.coordinates && typeof country.coordinates.lat === 'number') {
      latlngList = [country.coordinates.lat, country.coordinates.lng];
    } else if (Array.isArray(country.latlng)) {
      latlngList = country.latlng;
    }

    const normalized: NormalizedCountry = {
      ...country,
      name: {
        common: commonName,
        official: officialName,
        nativeName: nativeMap
      },
      names: rawNames,
      flags: {
        png: pngFlag,
        svg: svgFlag,
        alt: altFlag
      },
      flag: {
        ...rawFlag,
        url_png: pngFlag,
        url_svg: svgFlag
      },
      cca2: cca2,
      cca3: cca3,
      codes: {
        ...rawCodes,
        alpha_2: cca2,
        alpha_3: cca3
      },
      population: country.population ?? 0,
      region: country.region || '',
      subregion: country.subregion || '',
      capital: capitalList,
      capitals: country.capitals,
      tld: tldList,
      tlds: tldList,
      currencies: currencyMap,
      languages: languageMap,
      borders: Array.isArray(country.borders) ? country.borders : [],
      latlng: latlngList,
      coordinates: country.coordinates
    };

    return normalized;
  }

  /**
   * Normalizes an array of country objects (handles raw arrays or API wrapped data.objects)
   */
  public static normalizeList(response: any): NormalizedCountry[] {
    if (!response) {
      return [];
    }

    let items: any[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response.data && Array.isArray(response.data.objects)) {
      items = response.data.objects;
    } else if (response.data && Array.isArray(response.data)) {
      items = response.data;
    } else if (Array.isArray(response.objects)) {
      items = response.objects;
    }

    return items.map((item) => CountryAdapter.normalize(item));
  }
}
