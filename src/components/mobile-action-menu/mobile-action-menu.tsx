import React, { useContext } from 'react';
import { AppState } from '../../embedded-page-container';
import { usePostMessage } from '../../hooks/use-post-message';

export function MobileActionMenu() {
  const { mobileActionMenu, setMobileActionMenu, iframe } = useContext(AppState);
  const [handleItemPress] = usePostMessage(iframe, 'actionMenuItemPress');

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    bottom: 20,
    backgroundColor: '#fcfcfc',
    borderRadius: 15,
    width: 'calc(100% - 20px)',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    transition: '0.5s',
  };

  const optionStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: 12,
    borderTop: '1px solid #d6d6d6',
  };

  const titleStyle: React.CSSProperties = {
    ...optionStyle,
    padding: 8,
    fontSize: '0.75rem',
    color: '#666666',
    borderTop: 'unset',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9998,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    transition: '1s',
  };

  if (!mobileActionMenu?.items.length) return <div style={{ ...containerStyle, visibility: 'hidden', bottom: -50 }} />;
  const handlePress = (itemId?: string[]) => {
    if (itemId) handleItemPress(itemId);
    setMobileActionMenu();
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={titleStyle}>{mobileActionMenu.title}</div>
        {mobileActionMenu.items.map((item) => (
          <div key={item.id} style={optionStyle} onClick={() => handlePress([item.id])} data-e2e={`menu-${item.id}`}>
            {item.title}
          </div>
        ))}
      </div>
      <div style={overlayStyle} onClick={() => handlePress()} />
    </>
  );
}
