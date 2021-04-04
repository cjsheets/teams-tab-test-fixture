import { useState, useEffect } from 'react';
import { useAuthentication } from './use-authentication';
import { makeRequest } from './use-fetch';
import { DefaultContext, Endpoints } from './constants';

declare global {
  interface Window {
    TestFixtureAppContext: {
      urlTemplate: string;
      emulateMobileDevice: boolean;
    };
    TestFixtureTeamsContext: Partial<microsoftTeams.Context>;
  }
}

type SessionContext = {
  teamsContext: Window['TestFixtureTeamsContext'];
} & Window['TestFixtureAppContext'];

export function useSessionContext(): [SessionContext, string] {
  const [sessionContext, setSessionContext] = useState<SessionContext>();
  const [authShim] = useAuthentication();

  useEffect(() => {
    (async () => {
      const cachedContext = sessionStorage.getItem('sessionContext');
      let context: SessionContext = cachedContext && JSON.parse(cachedContext);
      if (!context) {
        context = {
          emulateMobileDevice: process.env.EMULATE_MOBILE_DEVICE || true,
          urlTemplate: process.env.URL_TEMPLATE,
          ...window.TestFixtureAppContext,
          teamsContext: {
            ...DefaultContext,
            groupId: process.env.GROUP_ID,
            ...window.TestFixtureTeamsContext,
          },
        };
      }

      const { groupId } = context.teamsContext;
      const token = await authShim.getAccessToken(['https://graph.microsoft.com/']);
      const init = { headers: { authorization: `Bearer ${token}` } };

      const getUser = authShim.getUser();
      const getTeam = groupId ? makeRequest({ url: Endpoints.teams + groupId, init, useCache: true }) : Promise.resolve();
      const getOwnedGroups = makeRequest({ url: Endpoints.meOwnedGroups, init, useCache: true });
      const [user, team, ownedGroups] = await Promise.all([getUser, getTeam, getOwnedGroups]);
      // Need to call teams/teamID/channels/channelId if it's worth channelName
      const isOwner = groupId ? ownedGroups.value.some((group: any) => group.id === groupId) : ownedGroups.value.length > 0;

      // Combine default context, provided context and context determined from authentication
      context = {
        ...context,
        teamsContext: {
          ...context.teamsContext,
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
        },
      };

      sessionStorage.setItem('sessionContext', JSON.stringify(context));
      setSessionContext(context);
    })();
  }, []);

  let iframeSrc = '';
  if (sessionContext) {
    iframeSrc = sessionContext.urlTemplate;
    Object.keys(sessionContext).forEach((key) => {
      iframeSrc = iframeSrc.replace(`{${key}}`, (sessionContext.teamsContext as any)[key]);
    });
  }

  return [sessionContext, iframeSrc];
}
