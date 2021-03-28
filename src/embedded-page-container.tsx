import React, { useEffect, useRef } from 'react';
import { IAppState, useFrameListeners } from './hooks/use-frame-listeners';
import { MobileNavBar } from './components/mobile-nav-bar/mobile-nav-bar';
import { NotificationBanner } from './components/notification-banner/notification-banner';
import { MobileActionMenu } from './components/mobile-action-menu/mobile-action-menu';
import { LoadingSpinner } from './components/loading-spinner/loading-spinner';

interface EmbeddedPageContainer {
  emulateMobileDevice?: boolean;
  iframeSrc: string;
  iframeProps: React.IframeHTMLAttributes<HTMLIFrameElement>;
  isNestedLevel?: boolean;
  completionResult?: string;
  pushLevel(taskInfo: microsoftTeams.TaskInfo): void;
  popLevel(result: string): void;
}

export const AppState = React.createContext<IAppState>({});

export function EmbeddedPageContainer(props: EmbeddedPageContainer) {
  const { emulateMobileDevice, iframeSrc, iframeProps, isNestedLevel, ...rest } = props;
  const ref = useRef<HTMLIFrameElement>();
  const [appState] = useFrameListeners(ref);

  useEffect(() => {
    if (!appState.taskInfo) return;
    rest.pushLevel(appState.taskInfo);
  }, [appState.taskInfo]);

  useEffect(() => {
    if (!appState.completeTask?.result) return;
    rest.popLevel(appState.completeTask.result);
  }, [appState.completeTask]);

  useEffect(() => {
    if (!rest.completionResult || !appState.completeTask.id) return;
    ref.current.contentWindow.postMessage({ id: appState.completeTask.id, args: [null, rest.completionResult] }, '*');
  }, [rest.completionResult]);

  const handleBackClick = () => {
    // ToDo
  };

  return (
    <AppState.Provider value={appState}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NotificationBanner emulateMobileDevice={emulateMobileDevice} />
        <MobileNavBar isNestedLevel={isNestedLevel} backClick={handleBackClick} />
        <LoadingSpinner isLoading={!iframeSrc} />
        <iframe {...iframeProps} src={iframeSrc} ref={ref} />
        <MobileActionMenu />
      </div>
    </AppState.Provider>
  );
}
