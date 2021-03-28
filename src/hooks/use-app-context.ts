import { useState, useEffect } from 'react';
import { useAuthentication } from './use-authentication';
import { makeRequest } from './use-fetch';
import { ENDPOINT } from './use-frame-listeners';
import { FrameContexts, HostClientType } from '@microsoft/teams-js';

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
    const _cachedContext = sessionStorage.getItem('initialContext');
    const cachedContext = (_cachedContext && JSON.parse(_cachedContext)) || {};

    let searchParamsContext: any = {};
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
      const getTeam = groupId ? makeRequest({ url: ENDPOINT.teams + groupId, init, useCache: true }) : Promise.resolve();
      const getOwnedGroups = makeRequest({ url: ENDPOINT.meOwnedGroups, init, useCache: true });
      const [user, team, ownedGroups] = await Promise.all([getUser, getTeam, getOwnedGroups]);
      // Need to call teams/teamID/channels/channelId if it's worth channelName
      const isOwner = groupId ? ownedGroups.value.some((group: any) => group.id === groupId) : ownedGroups.value.length > 0;

      const _appContext = {
        ...defaultContext,
        ...initialContext,
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
      sessionStorage.setItem('appContext', JSON.stringify(_appContext));
      setAppContext(_appContext);
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

const DEFAULT_CONTEXT = {
  appIconPosition: 0,
  appSessionId: generateGuid(),
  chatId: '',
  entityId: 'mock.entity.id',
  frameContext: FrameContexts,
  hostClientType: HostClientType.web,
  isFullScreen: false,
  isMultiWindow: false,
  jsonTabUrl: 'microsoft-teams-json-tab.azurewebsites.net',
  locale: 'en-us',
  meetingId: '',
  ringId: 'ring4',
  sessionId: generateGuid(),
  sourceOrigin: null as any,
  subEntityId: '',
  teamSiteDomain: '',
  tenantSKU: 'Unknown',
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
  teamSitePath: '',
  teamSiteUrl: '',
  teamType: 0,
};

export function generateGuid(_ = '') {
  if (_) {
    return ((Number(_) ^ (Math.random() * 16)) >> (Number(_) / 4)).toString(16);
  } else {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateGuid);
  }
}
