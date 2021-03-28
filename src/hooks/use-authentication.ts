export interface AuthProvider {
  initialize(): void;
  getAccessToken(resource: string[]): Promise<string>;
  getUser(): Promise<any>;
}

class AuthShim implements AuthProvider {
  authShimPromise: Promise<AuthProvider>;

  constructor() {
    this.authShimPromise = new Promise((res) => {
      this.loadAuthenticationProvider().then(({ default: AuthProvider }) => {
        res(new AuthProvider());
      });
    });
  }

  async initialize() {
    const authShim = await this.authShimPromise;
    return authShim.initialize();
  }

  async getAccessToken(resource: string[]) {
    const authShim = await this.authShimPromise;
    return authShim.getAccessToken(resource);
  }

  async getUser() {
    const authShim = await this.authShimPromise;
    return authShim.getUser();
  }

  private async loadAuthenticationProvider() {
    if (process.env.NODE_ENV === 'development') {
      return import('../authentication');
    } else {
      return import(/* webpackIgnore: true */ process.env.AUTHENTICATION_PATH || '/authentication.js');
    }
  }
}

const authShim = new AuthShim();
authShim.initialize();
export const useAuthentication = () => [authShim];
