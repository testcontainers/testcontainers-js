import DockerClient, { ContainerCreateOptions } from "dockerode";
export default class Container {
  public EnvironmentVariables: { [key: string]: number } = {};
  public Labels!: { [key: string]: string };
  public Mounts!: { [key: string]: number };
  public Commands!: string[];
  public DockerImageName!: string;
  public ExposedPorts!: number[];
  public PortBindings!: { [key: number]: number };
  public Client: DockerClient;
  public Container!: DockerClient.Container;

  constructor() {
    this.Client = new DockerClient({
      socketPath: "/var/run/docker.sock"
    });
  }

  public async Start(): Promise<void> {
    this.Container = await this.create();
    await this.tryStart();
  }

  private async create(): Promise<DockerClient.Container> {
    const getImage = this.Client.getImage(this.DockerImageName);
    const get = await getImage.get();
    get.on("error", error => {
      console.error(error);
    });

    const stream = await this.Client.createImage({
      fromImage: this.DockerImageName
    });
    stream.on("error", error => {
      console.error(error);
    });
    const createContainerParams = this.applyConfiguration();
    return this.Client.createContainer(createContainerParams);
  }

  private applyConfiguration(): ContainerCreateOptions {
    const env = this.mapEnvironmentVariables();
    const exposedPorts = this.mapExposedPorts();
    const portBindings = this.mapPortBindings();
    return {
      Image: this.DockerImageName,
      Env: env,
      ExposedPorts: exposedPorts,
      Labels: this.Labels,
      Tty: true,
      HostConfig: {
        PortBindings: portBindings
      }
    };
  }

  private mapPortBindings(): {
    [portAndProtocol: string]: Array<{
      HostIp: string;
      HostPort: string;
    }>;
  } {
    const portBindings: {
      [portAndProtocol: string]: Array<{
        HostIp: string;
        HostPort: string;
      }>;
    } = {};
    Object.values(this.PortBindings).forEach(k => {
      const key = `${k}/tcp`;
      portBindings[key] = [
        {
          HostPort: k.toString(),
          HostIp: "0.0.0.0"
        }
      ];
    });

    return portBindings;
  }

  private mapExposedPorts(): { [key: string]: any } {
    const exposedPorts: { [key: string]: any } = {};
    this.ExposedPorts.forEach(p => {
      const key = `${p}/tcp`;
      exposedPorts[key] = {};
    });
    return exposedPorts;
  }

  private mapEnvironmentVariables(): string[] {
    const env: string[] = [];
    Object.keys(this.EnvironmentVariables).forEach(key => {
      env.push(`${key}=${this.EnvironmentVariables[key]}`);
    });
    return env;
  }

  private async tryStart(): Promise<void> {
    return this.Container.start();
  }

  public async Stop() {
    return this.Container.stop();
  }
}
