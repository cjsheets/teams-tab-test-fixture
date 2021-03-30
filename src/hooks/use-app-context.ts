import { useState, useEffect } from 'react';
import { useAuthentication } from './use-authentication';
import { makeRequest } from './use-fetch';
import { ENDPOINT } from './use-frame-listeners';

export interface SessionContext extends microsoftTeams.Context {
  urlTemplate?: string;
  init?: RequestInit;
  useCache?: boolean;
}

type PartialTeamsContext = Partial<microsoftTeams.Context>;

export function useAppContext(contextOverrides: PartialTeamsContext, urlTemplate: string): [PartialTeamsContext, string] {
  const [appContext, setAppContext] = useState<PartialTeamsContext>();
  const [authShim] = useAuthentication();

  useEffect(() => {
    (async () => {
      const cachedContext = sessionStorage.getItem('appContext');
      let appContext: PartialTeamsContext = cachedContext && JSON.parse(cachedContext);

      if (!appContext) {
        const defaultContext: any = await (process.env.NODE_ENV === 'development'
          ? import('../app-context')
          : // @ts-ignore
            import(/* webpackIgnore: true */ '/app-context.js'));

        appContext = { ...defaultContext.TeamsContext };
      }

      appContext = { ...appContext, ...contextOverrides };

      const { groupId } = appContext;
      const token = await authShim.getAccessToken(['https://graph.microsoft.com/']);
      const init = { headers: { authorization: `Bearer ${token}` } };

      const getUser = authShim.getUser();
      const getTeam = groupId ? makeRequest({ url: ENDPOINT.teams + groupId, init, useCache: true }) : Promise.resolve();
      const getOwnedGroups = makeRequest({ url: ENDPOINT.meOwnedGroups, init, useCache: true });
      const [user, team, ownedGroups] = await Promise.all([getUser, getTeam, getOwnedGroups]);
      // Need to call teams/teamID/channels/channelId if it's worth channelName
      const isOwner = groupId ? ownedGroups.value.some((group: any) => group.id === groupId) : ownedGroups.value.length > 0;

      appContext = {
        ...appContext,
        channelId: team.internalId,
        isTeamArchived: team.isArchived,
        loginHint: user.username,
        teamId: team.internalId,
        teamName: team.displayName,
        tid: user.tenantId,
        upn: user.username,
        userLicenseType: 'Unknown',
        userObjectId: (user.idTokenClaims as any).oid,
        userPrincipalName: user.username,
        userTeamRole: isOwner ? 0 : 1,
      };

      sessionStorage.setItem('appContext', JSON.stringify(appContext));
      setAppContext(appContext);
    })();
  }, []);

  let iframeSrc = '';
  if (appContext) {
    iframeSrc = urlTemplate;
    Object.keys(appContext).forEach((key) => {
      iframeSrc = iframeSrc.replace(`{${key}}`, (appContext as any)[key]);
    });
  }

  return [appContext, iframeSrc];
}
