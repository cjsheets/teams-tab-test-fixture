import { useState, useEffect } from 'react';

interface RequestProps<T> {
  url: RequestInfo;
  init?: RequestInit;
  useCache?: boolean;
}

export function useFetch<T>({ url, ...rest }: RequestProps<T>) {
  const [result, setResult] = useState<T>();
  const urlString = JSON.stringify(url);

  useEffect(() => {
    (async () => {
      const response = await makeRequest({ url, ...rest });
      setResult(response);
    })();
  }, [urlString]);

  return result;
}

export async function makeRequest<T>({ url, init, useCache }: RequestProps<T>) {
  const urlString = JSON.stringify(url);

  try {
    let cachedResponse = useCache ? sessionStorage.getItem(urlString) : null;
    if (cachedResponse) return JSON.parse(cachedResponse);

    const response = await fetch(url, init);
    if (response.status < 400) {
      const parsedResponse = await response.json();

      if (useCache) sessionStorage.setItem(urlString, JSON.stringify(parsedResponse));
      return parsedResponse;
    }
  } catch (error) {
    console.error(`Error ${error}`);
  }
}
