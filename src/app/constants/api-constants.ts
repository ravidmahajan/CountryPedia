export class ApiConstants {
  public static readonly API_KEY = 'rc_live_d80a3f2292cd46dcba060e5467fa776e';

  private static getBaseHost(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return '';
    }
    return 'https://api.restcountries.com';
  }

  public static get BASE_URL(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5`;
  }

  public static get GET_ALL_COUNTRIES(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5`;
  }

  public static get COUNTRIES_BY_REGION(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5/region/`;
  }

  public static get COUNTRY_DATA(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5/codes.alpha_2/`;
  }

  public static get COUNTRY_BY_ALPHA2(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5/codes.alpha_2/`;
  }

  public static get COUNTRY_BY_ALPHA3(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5/codes.alpha_3/`;
  }

  public static get COUNTRY_BY_CODE(): string {
    return `${ApiConstants.getBaseHost()}/countries/v5/code`;
  }
}