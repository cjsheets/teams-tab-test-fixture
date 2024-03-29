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
    // Give testing framework time to inject auth provider
    await new Promise((r) => setTimeout(r, 1000));

    if (process.env.NODE_ENV === 'development') {
      return import('../authentication' as any);
    } else if (window.AuthenticationProvider) {
      return Promise.resolve({ default: window.AuthenticationProvider });
    } else {
      // @ts-ignore
      return import(/* webpackIgnore: true */ '/authentication.js').then(() => window.TeamsTabTestFixture);
    }
  }
}

const authShim = new AuthShim();
authShim.initialize();
export const useAuthentication = () => [authShim];
