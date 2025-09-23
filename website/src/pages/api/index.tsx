import React, { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function ApiIndexRedirect(): JSX.Element | null {
  const to = useBaseUrl('/api');
  const history = useHistory();
  useEffect(() => {
    history.replace(to);
  }, [history, to]);
  return null;
}

