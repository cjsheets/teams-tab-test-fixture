import React from 'react';

export function LoadingSpinner({ isLoading }: { isLoading: boolean }) {
  const spinnerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -60,
    marginLeft: -20,
    border: '4px solid #f2f2f2',
    borderTop: '4px solid #6264a7',
    borderRadius: '50%',
    animation: 'loading-spinner 1.25s linear infinite',
    WebkitAnimation: 'loading-spinner 1.25s linear infinite',
  };

  return isLoading ? <div style={spinnerStyle} /> : null;
}
