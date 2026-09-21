import * as url from 'url';
import { Construct } from 'constructs';
import { StaticWebsite, StaticWebsiteProps } from '../../core/index.js';

export type WebProps = Omit<
  StaticWebsiteProps,
  'websiteName' | 'websiteFilePath'
>;

export class Web extends StaticWebsite {
  constructor(scope: Construct, id: string, props?: WebProps) {
    super(scope, id, {
      ...props,
      websiteName: 'Web',
      websiteFilePath: url.fileURLToPath(
        new URL('../../../../../../dist/packages/web/bundle', import.meta.url),
      ),
    });
  }
}
