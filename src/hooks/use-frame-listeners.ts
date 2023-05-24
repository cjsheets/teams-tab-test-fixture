import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthentication } from './use-authentication';
import microsoftTeams from '@microsoft/teams-js';

export interface IAppState {
  mobileViewConfig?: microsoftTeams.menus.ViewConfiguration;
  mobileNavBarMenu?: microsoftTeams.menus.MenuItem;
  mobileActionMenu?: microsoftTeams.menus.ActionMenuParameters;
  setMobileActionMenu?: Function;
  task?: ActiveTask;
  completeTask?: TaskCompletion;
}

export type ActiveTask = {
  iframe?: React.RefObject<HTMLIFrameElement>;
  // taskInfo provided when task was opened
  taskInfo: microsoftTeams.TaskInfo;
  // Id of the message that opened this task
  messageId: string;
};

export function useFrameListeners(task: ActiveTask, pushTask: Function, popTask: Function): [IAppState] {
  const [authShim] = useAuthentication();
  const handlers: { [fn: string]: Function } = {};

  const [mobileViewConfig, setMobileViewConfig] = useState<microsoftTeams.menus.ViewConfiguration>();
  const [mobileNavBarMenu, setMobileNavBarMenu] = useState<microsoftTeams.menus.MenuItem>();
  const [mobileActionMenu, setMobileActionMenu] = useState<microsoftTeams.menus.ActionMenuParameters>();

  handlers.initialize = (version: string) => ['content', 'web'];

  handlers.getContext = async () => [JSON.parse(sessionStorage.getItem('sessionContext'))];

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
    pushTask({ taskInfo, messageId });
  };

  handlers.tasks_completeTask = function (result: string) {
    popTask(result);
  };

  const handleMessage = useCallback(async ({ data, origin, source }: MessageEvent<any>) => {
    if (data.id != null && data.func && task.iframe.current && source === task.iframe.current.contentWindow) {
      const fn = data.func.replace('.', '_');

      if (handlers[fn]) {
        const args = await handlers[fn](data.args?.[0], data.id);
        if (args) {
          const message = { id: data.id, args, origin };
          task.iframe.current.contentWindow.postMessage(message, origin);
        }
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
      task,
    },
  ];
}

export interface TaskCompletion {
  id?: string;
  error?: string;
  result?: string;
}
