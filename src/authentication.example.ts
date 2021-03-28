import { TeamsAuthenticator } from 'teams-authenticator';

export interface AuthProvider {
  initialize(): void;
  getAccessToken(resource: string[]): Promise<string>;
  getUser(): Promise<any>;
}

export class Authentication implements AuthProvider {
  authenticator: TeamsAuthenticator;
  loginPromise: Promise<unknown>;

  initialize() {
    if (!process.env.CLIENT_ID) return;
    this.authenticator = new TeamsAuthenticator({
      auth: {
        clientId: process.env.CLIENT_ID,
      },
    });

    const url = new URL(window.location.href);
    this.loginPromise = url.hash ? this.authenticator.handleLoginRedirect() : this.authenticator.login();
  }

  async getAccessToken(resource: string[]) {
    await this.loginPromise;
    const res = await this.authenticator.getToken([resource[0]]);
    return res;
  }

  async getUser() {
    return this.authenticator.getUser();
  }
}
