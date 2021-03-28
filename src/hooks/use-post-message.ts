import { useCallback } from 'react';

export function usePostMessage(iframe: React.RefObject<HTMLIFrameElement>, func: string) {
  return [
    useCallback(
      (args) => {
        const message = { func, args };
        iframe.current.contentWindow.postMessage(message, '*');
      },
      [iframe, func]
    ),
  ];
}
