import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import microsoftTeams from '@microsoft/teams-js';
import { useSessionContext } from './hooks/use-session-context';
import { EmbeddedPageContainer } from './embedded-page-container';
import { LoadingSpinner } from './components/loading-spinner/loading-spinner';

interface TeamsTestFixture {
  contextOverrides?: Partial<microsoftTeams.Context>;
  emulateMobileDevice?: boolean;
  urlTemplate?: string;
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
}

export function TeamsTestFixture(props: TeamsTestFixture) {
  const [sessionContext, iframeSrc] = useSessionContext(props.contextOverrides, props.urlTemplate);
  const [levels, setLevels] = useState<microsoftTeams.TaskInfo[]>([]);
  const [completionResult, setCompletion] = useState<string>(null);

  useEffect(() => {
    if (!iframeSrc) return;
    setLevels([{ url: iframeSrc }]);
  }, [iframeSrc]);

  const pushLevel = (taskInfo: microsoftTeams.TaskInfo) => {
    setLevels([...levels, taskInfo]);
  };

  const popLevel = (result: string) => {
    levels.pop();
    setCompletion(result);
    setLevels([...levels]);
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
      <LoadingSpinner isLoading={levels.length === 0} />
      {levels.map((taskInfo, i) => (
        <div style={{ ...pageStyle }}>
          <EmbeddedPageContainer
            key={taskInfo.url}
            emulateMobileDevice={props.emulateMobileDevice}
            iframeSrc={taskInfo.url}
            iframeProps={props.iframeProps}
            isNestedLevel={i !== 0}
            completionResult={levels.length - 1 === i ? completionResult : null}
            pushLevel={pushLevel}
            popLevel={popLevel}
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
