import React from 'react';

export function NotificationBanner({ emulateMobileDevice }: { emulateMobileDevice: boolean }) {
  let message = null;

  if (!process.env.CLIENT_ID) message = 'CLIENT_ID is required for authentication';

  const isIos = /(iPad|iPhone|iPod)(?=.*like Mac OS X)/i.test(window.navigator.userAgent);
  const isAndroid = /android/i.test(window.navigator.userAgent);
  if (emulateMobileDevice && !(isIos || isAndroid)) message = 'emulateMobileDevice is active but browser mobile emulation is not enabled';

  const messageStyle: React.CSSProperties = {
    color: 'white',
    backgroundColor: 'tomato',
    border: '1px solid red',
    padding: 4,
  };

  return message ? <div style={messageStyle}>{message}</div> : null;
}
