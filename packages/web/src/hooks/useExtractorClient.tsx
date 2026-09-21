import { useContext } from 'react';
import { ExtractorClientContext } from '../components/ExtractorProvider';
import { Extractor } from '../generated/extractor/client.gen';

export const useExtractorClient = (): Extractor => {
  const client = useContext(ExtractorClientContext);

  if (!client) {
    throw new Error(
      'useExtractorClient must be used within a ExtractorProvider',
    );
  }

  return client;
};
