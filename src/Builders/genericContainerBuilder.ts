import ContainerBuilder from "./containerBuilder";
import Container from "../Containers/container";

export default class GenericContainerBuilder<
  TContainer extends Container
> extends ContainerBuilder<TContainer, GenericContainerBuilder<TContainer>> {}
