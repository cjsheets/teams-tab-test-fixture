function generateGuid(_ = '') {
  if (_) {
    return ((Number(_) ^ (Math.random() * 16)) >> (Number(_) / 4)).toString(16);
  } else {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateGuid);
  }
}

module.exports = {
  appContext: {},
  TeamsContext: {
    appIconPosition: 0,
    appSessionId: generateGuid(),
    chatId: '',
    entityId: 'mock.entity.id',
    frameContext: 'content',
    hostClientType: 'web',
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

    // Team specific context
    channelName: '',
    channelRelativeUrl: '',
    channelType: 'Regular',
    defaultOneNoteSectionId: '',
    teamSitePath: '',
    teamSiteUrl: '',
    teamType: 0,
  },
};
