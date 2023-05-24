import React, { useContext } from 'react';
import { AppState } from '../../embedded-page-container';
import { usePostMessage } from '../../hooks/use-post-message';

interface MobileNavBar {
  isNestedLevel?: boolean;
  iframeRef: React.MutableRefObject<HTMLIFrameElement>;
}

export function MobileNavBar({ isNestedLevel, iframeRef }: MobileNavBar) {
  const backButtonStyle: React.CSSProperties = {
    height: '100%',
    paddingRight: 16,
    fontSize: '1.5rem',
    fontWeight: 'lighter',
    fontFamily: 'monospace',
    lineHeight: '0.75rem',
    border: 0,
    background: 'transparent',
  };

  const { mobileNavBarMenu, mobileViewConfig } = useContext(AppState);
  const iconContainerStyles: React.CSSProperties = { flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end' };
  const iconStyles: React.CSSProperties = { width: 20, height: 20 };

  const [handleClick] = usePostMessage(iframeRef, 'navBarMenuItemPress');
  const [backButtonPress] = usePostMessage(iframeRef, 'backButtonPress');

  const title = mobileViewConfig?.title;
  const menu =
    mobileNavBarMenu &&
    (mobileNavBarMenu.icon ? (
      <img style={iconStyles} src={`data:image/svg+xml;base64, ${mobileNavBarMenu.icon}`} />
    ) : (
      mobileNavBarMenu.title
    ));

  if (!title && !menu && !isNestedLevel) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#ffffff' }}>
      {isNestedLevel && (
        <button style={backButtonStyle} onClick={() => backButtonPress([])}>
          {'<'}
        </button>
      )}
      <div>
        <b>{title}</b>
      </div>
      <div onClick={() => handleClick([mobileNavBarMenu.id])} style={iconContainerStyles} data-e2e={`nav-bar-${mobileNavBarMenu?.id}`}>
        {menu}
      </div>
    </div>
  );
}
