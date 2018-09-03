import Container from "../Containers/container";

class FnUtils {
    public static Compose<A, B, C>(f1: (a: A) => B, f2: (b: B) => C): (a: A) => C {
        return (a) => f2(f1(a));
    }
}

export default abstract class ContainerBuilder<TContainer extends Container, TBuilder extends ContainerBuilder<TContainer, TBuilder>> {

    protected fn !: ((a ?: TContainer) => TContainer);

    constructor(private containerType: (new () => TContainer)) {
    }

    public Begin(): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = () => new this.containerType();
        return this;
    }

    public WithImage(dockerImageName: string): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.DockerImageName = dockerImageName;
            return container;
        });

        return this;
    }


    public WithExposedPorts(...ports: number[]): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.ExposedPorts = ports;
            return container;
        });

        return this;
    }

    public WithPortBindings(portBindings: { [key: number]: number }): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.PortBindings = portBindings;
            return container;
        });

        return this;
    }

    public WithEnv(envVariables: { [key: string]: number }): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.EnvironmentVariables = envVariables;
            return container;
        });

        return this;
    }

    public WithLabel(labels: { [key: string]: string }): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.Labels = labels;
            return container;
        });

        return this;
    }

    public WithMountPoints(mounts: { [key: string]: number }): ContainerBuilder<TContainer, ContainerBuilder<TContainer, TBuilder>> {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.Mounts = mounts;
            return container;
        });

        return this;
    }

    public WithCmd(... commands: string[]) {
        this.fn = FnUtils.Compose(this.fn, (container) => {
            container.Commands = commands;
            return container;
        });

        return this;
    }

    public Build(): TContainer {
        return this.fn();
    }
}