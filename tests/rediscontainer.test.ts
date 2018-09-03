import redis from "redis";
import GenericContainerBuilder from "../src/Builders/genericContainerBuilder";
import Container from "../src/Containers/container";

const container = new GenericContainerBuilder<Container>(Container)
        .Begin()
        .WithImage("redis:4.0.8")
        .WithExposedPorts(6379)
        .WithPortBindings([6379, 6380])
        .Build();
beforeAll(async () => {
        await container.Start();
});

test("test", async () => {
    await container.Start();

    const client = redis.createClient();
    client
        .on("connect", () => console.log("Redis client connected"))
        .on("error", (err) => console.error(`Something went wrong ${err}`));
});