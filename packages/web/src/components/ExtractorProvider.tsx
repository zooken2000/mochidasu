import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { Extractor } from '../generated/extractor/client.gen';
import { ExtractorOptionsProxy } from '../generated/extractor/options-proxy.gen';
import { useRuntimeConfig } from '../hooks/useRuntimeConfig';
import { useSigV4 } from '../hooks/useSigV4';

/**
 * Build an HTTP URL from a Bedrock AgentCore Runtime ARN
 */
function buildAgentCoreHttpUrl(agentRuntimeArn: string): string {
  const region = agentRuntimeArn.split(':')[3];
  return `https://bedrock-agentcore.${region}.amazonaws.com/runtimes/${encodeURIComponent(agentRuntimeArn)}`;
}

export const ExtractorContext = createContext<
  ExtractorOptionsProxy | undefined
>(undefined);

export const ExtractorClientContext = createContext<Extractor | undefined>(
  undefined,
);

const useCreateExtractorClient = (): Extractor => {
  const runtimeConfig = useRuntimeConfig();
  const agentRuntimeValue = runtimeConfig.agentRuntimes.Extractor;
  // A local-dev override is a plain URL; otherwise it's the agent's runtime
  // ARN, so build the invocation URL from it.
  const apiUrl = agentRuntimeValue.startsWith('arn:')
    ? buildAgentCoreHttpUrl(agentRuntimeValue)
    : agentRuntimeValue;
  const sigv4Fetch = useSigV4();
  return useMemo(
    () =>
      new Extractor({
        url: apiUrl,
        fetch: sigv4Fetch,
      }),
    [apiUrl, sigv4Fetch],
  );
};

export const ExtractorProvider: FC<PropsWithChildren> = ({ children }) => {
  const client = useCreateExtractorClient();
  const optionsProxy = useMemo(
    () => new ExtractorOptionsProxy({ client }),
    [client],
  );

  return (
    <ExtractorClientContext.Provider value={client}>
      <ExtractorContext.Provider value={optionsProxy}>
        {children}
      </ExtractorContext.Provider>
    </ExtractorClientContext.Provider>
  );
};

export default ExtractorProvider;
