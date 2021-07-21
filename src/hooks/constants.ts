import { ChannelType, FrameContexts, HostClientType } from '@microsoft/teams-js';
import { v4 as uuid } from 'uuid';

export const DefaultContext: Partial<microsoftTeams.Context> = {
  appIconPosition: 0,
  appSessionId: uuid(),
  chatId: '',
  entityId: 'mock.entity.id',
  frameContext: FrameContexts.content,
  hostClientType: HostClientType.web,
  isFullScreen: false,
  isMultiWindow: false,
  locale: 'en-us',
  meetingId: '',
  ringId: 'ring4',
  sessionId: uuid(),
  sourceOrigin: null,
  subEntityId: '',
  teamSiteDomain: '',
  tenantSKU: 'Unknown',
  theme: 'default',
  userClickTime: new Date().getTime(),

  channelName: '',
  channelRelativeUrl: '',
  channelType: ChannelType.Regular,
  defaultOneNoteSectionId: '',
  teamSitePath: '',
  teamSiteUrl: '',
  teamType: 0,
};

export const Endpoints = {
  teams: 'https://graph.microsoft.com/beta/teams/',
  joinedTeams: 'https://graph.microsoft.com/beta/me/joinedTeams',
  unifiedGroups: `https://graph.microsoft.com/beta/me/memberOf/microsoft.graph.group?$filter=groupTypes/any(a:a eq 'unified')`,
  meOwnedGroups: `https://graph.microsoft.com/beta/me/ownedObjects/microsoft.graph.group`,
};
