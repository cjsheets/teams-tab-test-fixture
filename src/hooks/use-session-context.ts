import { useState, useEffect } from 'react';
import { useAuthentication } from './use-authentication';
import { makeRequest } from './use-fetch';
import { Endpoints } from './constants';
import { FrameContexts, HostClientType } from '@microsoft/teams-js';
import { v4 as uuid } from 'uuid';

declare global {
  interface Window {
    TestFixtureAppContext: {
      urlTemplate: string;
      emulateMobileDevice: boolean;
      mockAuthentication: boolean;
    };
    TestFixtureTeamsContext: Partial<microsoftTeams.Context>;
  }
}

type SessionContext = {
  teamsContext: Window['TestFixtureTeamsContext'];
} & Window['TestFixtureAppContext'];

type PartialTeamsContext = Partial<microsoftTeams.Context>;

export function useSessionContext(contextOverrides: PartialTeamsContext, urlTemplate: string): [SessionContext, string] {
  const [sessionContext, setSessionContext] = useState<SessionContext>();
  const [authShim] = useAuthentication();

  useEffect(() => {
    const _cachedContext = sessionStorage.getItem('initialContext');
    const cachedContext = (_cachedContext && JSON.parse(_cachedContext)) || {};

    const searchParamsContext: any = {};
    const { searchParams } = new URL(window.location.href);
    Object.keys(DEFAULT_TEAM_CONTEXT).forEach((key) => {
      if (searchParams.get(key)) searchParamsContext[key] = searchParams.get(key);
    });

    const initialContext = {
      ...cachedContext,
      ...contextOverrides,
      ...searchParamsContext,
    };
    sessionStorage.setItem('initialContext', JSON.stringify(initialContext));

    (async () => {
      const { groupId } = initialContext;
      const token = await authShim.getAccessToken(['https://graph.microsoft.com/']);
      const init = { headers: { authorization: `Bearer ${token}` } };

      const defaultContext = groupId ? DEFAULT_TEAM_CONTEXT : DEFAULT_CONTEXT;
      const getUser = authShim.getUser();
      const getTeam = groupId ? makeRequest({ url: Endpoints.teams + groupId, init, useCache: true }) : Promise.resolve();
      const getGroups = makeRequest({ url: Endpoints.unifiedGroups, init, useCache: true });
      const getOwnedGroups = makeRequest({ url: Endpoints.meOwnedGroups, init, useCache: true });
      const [user, team, groups, ownedGroups] = await Promise.all([getUser, getTeam, getGroups, getOwnedGroups]);
      // Need to call teams/teamID/channels/channelId if it's worth channelName
      const isOwner = groupId ? ownedGroups.value.some((group: any) => group.id === groupId) : ownedGroups.value.length > 0;

      const _appContext = {
        ...defaultContext,
        ...initialContext,
        tid: user.tenantId,
        loginHint: user.username,
        upn: user.username,
        userPrincipalName: user.username,
        userObjectId: user.oid,
        isTeamArchived: team.isArchived,
        channelId: team.internalId,
        teamId: team.internalId,
        teamName: team.displayName,
        userTeamRole: isOwner ? 0 : 1,
      };

      sessionStorage.setItem('sessionContext', JSON.stringify(_appContext));
      setSessionContext(_appContext);
    })();
  }, []);

  let iframeSrc = '';
  if (sessionContext) {
    iframeSrc = urlTemplate;
    Object.keys(sessionContext).forEach((key) => {
      iframeSrc = iframeSrc.replace(`{${key}}`, (sessionContext as any)[key]);
    });
  }

  return [sessionContext, iframeSrc];
}

const DEFAULT_CONTEXT = {
  appIconPosition: 0,
  appSessionId: uuid(),
  frameContext: FrameContexts,
  hostClientType: HostClientType.web,
  isFullScreen: false,
  isMultiWindow: false,
  jsonTabUrl: 'microsoft-teams-json-tab.azurewebsites.net',
  locale: 'en-us',
  ringId: 'ring4',
  sessionId: uuid(),
  sourceOrigin: null as any,
  subEntityId: '',
  theme: 'default',
  userClickTime: new Date().getTime(),
  userFileOpenPreference: 'web',
};

const DEFAULT_TEAM_CONTEXT = {
  ...DEFAULT_CONTEXT,
  channelName: '',
  channelRelativeUrl: '',
  channelType: '',
  defaultOneNoteSectionId: '',
  isTeamArchived: false,
  teamSitePath: '',
  teamSiteUrl: '',
  teamType: 0,
};
