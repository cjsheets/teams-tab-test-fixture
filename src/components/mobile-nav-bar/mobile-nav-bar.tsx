import React, { useContext } from 'react';
import { AppState } from '../../embedded-page-container';
import { usePostMessage } from '../../hooks/use-post-message';

interface MobileNavBar {
  backClick: Function;
  isNestedLevel?: boolean;
}

export function MobileNavBar({ isNestedLevel, backClick }: MobileNavBar) {
  const backButtonStyle: React.CSSProperties = {
    height: '100%',
    paddingRight: 16,
    fontSize: '2rem',
    fontWeight: 'lighter',
    lineHeight: '0.75rem',
  };

  const { mobileNavBarMenu, mobileViewConfig, iframe } = useContext(AppState);
  const iconContainerStyles: React.CSSProperties = { flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end' };
  const iconStyles: React.CSSProperties = { width: 20, height: 20 };

  const [handleClick] = usePostMessage(iframe, 'navBarMenuItemPress');
  const [backButtonPress] = usePostMessage(iframe, 'backButtonPress');

  const title = mobileViewConfig?.title;
  const menu =
    mobileNavBarMenu &&
    (mobileNavBarMenu.icon ? <img style={iconStyles} src={`data:image/svg+xml;base64, ${mobileNavBarMenu.icon}`} /> : mobileNavBarMenu.title);

  if (!title && !menu && !isNestedLevel) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#ffffff' }}>
      {isNestedLevel && (
        <div style={backButtonStyle} onClick={() => backButtonPress([])}>
          &#8249;
        </div>
      )}
      <div>
        <b>{title}</b>
      </div>
      <div onClick={() => handleClick([mobileNavBarMenu.id])} style={iconContainerStyles}>
        {menu}
      </div>
    </div>
  );
}
