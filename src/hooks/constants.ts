import { ChannelType, FrameContexts, HostClientType } from '@microsoft/teams-js';

function generateGuid(_ = '') {
  if (_) {
    return ((Number(_) ^ (Math.random() * 16)) >> (Number(_) / 4)).toString(16);
  } else {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateGuid);
  }
}

export const DefaultContext: Partial<microsoftTeams.Context> = {
  appIconPosition: 0,
  appSessionId: generateGuid(),
  chatId: '',
  entityId: 'mock.entity.id',
  frameContext: FrameContexts.content,
  hostClientType: HostClientType.web,
  isFullScreen: false,
  isMultiWindow: false,
  locale: 'en-us',
  meetingId: '',
  ringId: 'ring4',
  sessionId: generateGuid(),
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
  meOwnedGroups: `https://graph.microsoft.com/beta/me/ownedObjects/microsoft.graph.group`,
};
