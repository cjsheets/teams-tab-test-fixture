import React, { useEffect, useRef } from 'react';
import { ActiveTask, IAppState, useFrameListeners } from './hooks/use-frame-listeners';
import { MobileNavBar } from './components/mobile-nav-bar/mobile-nav-bar';
import { NotificationBanner } from './components/notification-banner/notification-banner';
import { MobileActionMenu } from './components/mobile-action-menu/mobile-action-menu';
import { LoadingSpinner } from './components/loading-spinner/loading-spinner';

interface EmbeddedPageContainer {
  emulateMobileDevice?: boolean;
  iframeProps: React.IframeHTMLAttributes<HTMLIFrameElement>;
  task: ActiveTask;
  pushTask(task: ActiveTask): void;
  popTask(result: string): void;
}

export const AppState = React.createContext<IAppState>({});

export function EmbeddedPageContainer(props: EmbeddedPageContainer) {
  const { emulateMobileDevice, iframeProps, task, ...rest } = props;
  const ref = useRef<HTMLIFrameElement>();
  const [appState] = useFrameListeners(ref, task, rest.pushTask, rest.popTask);

  return (
    <AppState.Provider value={appState}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NotificationBanner emulateMobileDevice={emulateMobileDevice} />
        <MobileNavBar isNestedLevel={!!task.messageId} />
        <LoadingSpinner isLoading={!iframeProps?.src} />
        <iframe {...iframeProps} ref={ref} data-e2e={`frame-${task.messageId}`} />
        <MobileActionMenu />
      </div>
    </AppState.Provider>
  );
}
