import { useCallback, useEffect, useState } from 'react';
import { useAuthentication } from './use-authentication';
import microsoftTeams from '@microsoft/teams-js';

export interface IAppState {
  mobileViewConfig?: microsoftTeams.menus.ViewConfiguration;
  mobileNavBarMenu?: microsoftTeams.menus.MenuItem;
  mobileActionMenu?: microsoftTeams.menus.ActionMenuParameters;
  setMobileActionMenu?: Function;
  taskInfo?: microsoftTeams.TaskInfo;
  completeTask?: TaskCompletion;
  iframe?: React.RefObject<HTMLIFrameElement>;
}

export function useFrameListeners(iframe: React.RefObject<HTMLIFrameElement>): [IAppState] {
  const [authShim] = useAuthentication();
  const handlers: { [fn: string]: Function } = {};

  const [mobileViewConfig, setMobileViewConfig] = useState<microsoftTeams.menus.ViewConfiguration>();
  const [mobileNavBarMenu, setMobileNavBarMenu] = useState<microsoftTeams.menus.MenuItem>();
  const [mobileActionMenu, setMobileActionMenu] = useState<microsoftTeams.menus.ActionMenuParameters>();
  const [taskInfo, setTaskInfo] = useState<microsoftTeams.TaskInfo>();
  const [completeTask, setCompleteTask] = useState<TaskCompletion>();

  handlers.initialize = (version: string) => ['content', 'web', version];

  handlers.getContext = async () => [JSON.parse(sessionStorage.getItem('appContext'))];

  handlers.authentication_getAuthToken = async (resource: string[]) => {
    const token = await authShim.getAccessToken(resource);
    return [true, token];
  };

  handlers.getUserJoinedTeams = (): any => [];

  handlers.setUpViews = function (config: microsoftTeams.menus.ViewConfiguration[]) {
    setMobileViewConfig(config[0]);
  };

  handlers.setNavBarMenu = function (menus: microsoftTeams.menus.MenuItem[]) {
    setMobileNavBarMenu(menus[0]);
  };

  handlers.showActionMenu = function (menus: microsoftTeams.menus.ActionMenuParameters) {
    setMobileActionMenu(menus);
  };

  handlers.tasks_startTask = function (taskInfo: microsoftTeams.TaskInfo, messageId: string) {
    setCompleteTask({ id: messageId });
    setTaskInfo(taskInfo);
  };

  handlers.tasks_completeTask = function (result: string) {
    setCompleteTask({ result });
  };

  const handleMessage = useCallback(async ({ data, origin, source }: MessageEvent<any>) => {
    if (data.id != null && data.func && source === iframe.current.contentWindow) {
      const fn = data.func.replace('.', '_');

      //console.log('Teams got', fn, data.args);
      if (handlers[fn]) {
        const args = await handlers[fn](data.args?.[0], data.id);
        iframe.current.contentWindow.postMessage({ id: data.id, args, origin }, '*');
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return [
    {
      mobileViewConfig,
      mobileNavBarMenu,
      mobileActionMenu,
      setMobileActionMenu,
      taskInfo,
      completeTask,
      iframe,
    },
  ];
}

export interface TaskCompletion {
  id?: string;
  error?: string;
  result?: string;
}
