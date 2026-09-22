import { Fn, Lazy, Names, Stack } from 'aws-cdk-lib';
import {
  AgentCoreRuntime,
  AgentRuntimeArtifact,
  ProtocolType,
  Runtime,
  RuntimeProps,
} from 'aws-cdk-lib/aws-bedrockagentcore';
import { Connections, IConnectable } from 'aws-cdk-lib/aws-ec2';
import {
  Grant,
  IGrantable,
  IPrincipal,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';
import * as url from 'url';
import { RuntimeConfig } from '../../../core/runtime-config.js';
import { findWorkspaceRoot } from '../../../core/workspace.js';

export type ExtractorProps = Omit<
  RuntimeProps,
  | 'runtimeName'
  | 'protocolConfiguration'
  | 'agentRuntimeArtifact'
  | 'authorizerConfiguration'
>;

export class Extractor extends Construct implements IGrantable, IConnectable {
  public readonly code: AgentRuntimeArtifact;
  public readonly agentCoreRuntime: Runtime;
  /** Default Gateway target name for this agent. */
  public readonly agentName = 'extractor';
  /** Inbound auth — a fronting Gateway uses this to pick its outbound credential. */
  public readonly auth = 'iam';

  constructor(scope: Construct, id: string, props?: ExtractorProps) {
    super(scope, id);

    const rc = RuntimeConfig.ensure(this);

    // Resolve the packaged code directory, uploaded as a zip asset
    const bundleDir = path.join(
      findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
      'dist/packages/agent/package/extractor',
    );

    // The `opentelemetry-instrument` prefix auto-instruments with the AWS Distro
    // for OpenTelemetry packaged alongside the code.
    // https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html
    this.code = AgentRuntimeArtifact.fromCodeAsset({
      path: bundleDir,
      runtime: AgentCoreRuntime.PYTHON_3_14,
      entrypoint: ['opentelemetry-instrument', 'main.py'],
    });

    this.agentCoreRuntime = new Runtime(this, 'Extractor', {
      runtimeName: Lazy.string({
        produce: () =>
          Names.uniqueResourceName(this.agentCoreRuntime, { maxLength: 40 }),
      }),
      protocolConfiguration: ProtocolType.HTTP,
      agentRuntimeArtifact: this.code,
      ...props,
      environmentVariables: {
        RUNTIME_CONFIG_APP_ID: rc.appConfigApplicationId,
        ...props?.environmentVariables,
      },
    });

    // Grant access for the agent to invoke bedrock models
    this.agentCoreRuntime.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
        ],
        resources: [
          'arn:aws:bedrock:*:*:foundation-model/*',
          'arn:aws:bedrock:*:*:inference-profile/*',
        ],
      }),
    );

    rc.grantReadAppConfig(this.agentCoreRuntime);

    rc.set('agentcore', 'agentRuntimes', {
      ...rc.get('agentcore').agentRuntimes,
      Extractor: {
        arn: this.agentCoreRuntime.agentRuntimeArn,
      },
    });

    rc.set('connection', 'agentRuntimes', {
      ...rc.get('connection').agentRuntimes,
      Extractor: this.agentCoreRuntime.agentRuntimeArn,
    });
  }

  /**
   * The principal to grant permissions to.
   */
  public get grantPrincipal(): IPrincipal {
    return this.agentCoreRuntime.grantPrincipal;
  }

  /**
   * Network connections for this agent runtime.
   */
  public get connections(): Connections {
    return this.agentCoreRuntime.connections;
  }

  /**
   * The HTTPS invocation URL of the runtime.
   */
  public get invocationUrl(): string {
    // The URL must URL-encode the runtime ARN (':' -> '%3A', '/' -> '%2F').
    // The ARN is a CDK token, so encode at deploy time via Fn.join/Fn.split.
    const encodedArn = Fn.join(
      '%2F',
      Fn.split(
        '/',
        Fn.join('%3A', Fn.split(':', this.agentCoreRuntime.agentRuntimeArn)),
      ),
    );
    return `https://bedrock-agentcore.${Stack.of(this).region}.amazonaws.com/runtimes/${encodedArn}/invocations?qualifier=DEFAULT`;
  }

  /**
   * Grants IAM permissions to invoke this agent runtime.
   *
   * @param grantee - The IAM principal to grant permissions to
   */
  public grantInvokeAccess(grantee: IGrantable) {
    this.agentCoreRuntime.grantInvoke(grantee);

    Grant.addToPrincipal({
      grantee,
      actions: ['bedrock-agentcore:InvokeAgentRuntimeWithWebSocketStream'],
      resourceArns: [
        this.agentCoreRuntime.agentRuntimeArn,
        `${this.agentCoreRuntime.agentRuntimeArn}/*`,
      ],
    });
  }
}
