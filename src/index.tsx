import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import microsoftTeams from '@microsoft/teams-js';
import { useSessionContext } from './hooks/use-session-context';
import { EmbeddedPageContainer } from './embedded-page-container';
import { LoadingSpinner } from './components/loading-spinner/loading-spinner';
import { ActiveTask } from './hooks/use-frame-listeners';

interface TeamsTestFixture {
  contextOverrides?: Partial<microsoftTeams.Context>;
  emulateMobileDevice?: boolean;
  urlTemplate?: string;
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
}

export function TeamsTestFixture(props: TeamsTestFixture) {
  const [sessionContext, iframeSrc] = useSessionContext(props.contextOverrides, props.urlTemplate);
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);

  useEffect(() => {
    if (!iframeSrc) return;
    setActiveTasks([{ taskInfo: { url: iframeSrc }, messageId: null }]);
  }, [iframeSrc]);

  const pushTask = (task: ActiveTask) => {
    setActiveTasks([...activeTasks, task]);
  };

  const popTask = (result: string) => {
    activeTasks.pop();
    setActiveTasks([...activeTasks]);
  };

  const pageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
  };

  return (
    <>
      <LoadingSpinner isLoading={activeTasks.length === 0} />
      {activeTasks.map((task, i) => (
        <div style={{ ...pageStyle }}>
          <EmbeddedPageContainer
            key={task.taskInfo.url}
            emulateMobileDevice={props.emulateMobileDevice}
            iframeProps={{ ...props.iframeProps, src: task.taskInfo.url }}
            task={task}
            isVisible={activeTasks.length === i + 1}
            pushTask={pushTask}
            popTask={popTask}
          />
        </div>
      ))}
    </>
  );
}

const props = {
  iframeProps: {
    style: { width: '100%', height: '100%', border: '0' },
  },
  contextOverrides: { ...window.TestFixtureTeamsContext },
  ...window.TestFixtureAppContext,
};

if (process.env.URL_TEMPLATE) {
  props.urlTemplate = process.env.URL_TEMPLATE;
}
if (process.env.GROUP_ID) {
  props.contextOverrides.groupId = process.env.GROUP_ID;
}

ReactDOM.render(<TeamsTestFixture {...props} />, document.getElementById('root'));
