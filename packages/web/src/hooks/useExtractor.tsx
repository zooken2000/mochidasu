import { useContext } from 'react';
import { ExtractorContext } from '../components/ExtractorProvider';
import { ExtractorOptionsProxy } from '../generated/extractor/options-proxy.gen';

export const useExtractor = (): ExtractorOptionsProxy => {
  const optionsProxy = useContext(ExtractorContext);

  if (!optionsProxy) {
    throw new Error('useExtractor must be used within a ExtractorProvider');
  }

  return optionsProxy;
};
