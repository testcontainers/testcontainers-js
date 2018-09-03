import { ImageApi, ContainerApi, ContainerCreateBody, HostConfigPortBindings } from "docker-client";

export default class Container {
    public EnvironmentVariables !: { [key: string]: number; };
    public Labels!: { [key: string]: string; };
    public Mounts!: { [key: string]: number; };
    public Commands!: string[];
    public DockerImageName !: string;
    public ExposedPorts !: number[];
    public PortBindings !: { [key: number]: number };
    private ImageApi: ImageApi;
    private ContainerApi: ContainerApi;
    public ContainerId!: string;

    constructor() {
        this.ImageApi = new ImageApi();
        this.ContainerApi = new ContainerApi();
    }

    public async Start(): Promise<void> {
        this.ContainerId = await this.create();

        await this.tryStart();
    }

    private async create(): Promise<string> {
        const createImageResponse = await this.ImageApi.imageCreate(this.DockerImageName);
        const createContainerParams = this.applyConfiguration();
        await this.ContainerApi.containerCreate(createContainerParams);

        return createImageResponse.text();
    }

    private applyConfiguration(): ContainerCreateBody {
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

    private mapPortBindings(): { [key: string]: HostConfigPortBindings } {
        const portBindings: {
            [key: string]: HostConfigPortBindings;
        } = {};
        Object.keys(this.PortBindings).forEach((k) => {
            const key = `${k}/tcp`;
            portBindings[key] = {
                HostPort: this.PortBindings[parseInt(k)].toString()
            };
        });

        return portBindings;
    }

    private mapExposedPorts(): { [key: string]: any } {
        const exposedPorts: { [key: string]: any } = {};
        this.ExposedPorts.forEach((p) => {
            const key = `${p}/tcp`;
            exposedPorts[key] = {};
        });
        return exposedPorts;
    }

    private mapEnvironmentVariables(): string[] {
        const env: string[] = [];
        Object.keys(this.EnvironmentVariables).forEach((key) => {
            env.push(`${key}=${this.EnvironmentVariables[key]}`);
        });
        return env;
    }

    private async tryStart(): Promise<void> {
        await this.ContainerApi.containerStart(this.ContainerId);
    }

    public async Stop() {

    }
}