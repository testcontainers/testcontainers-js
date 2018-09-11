import redis from "redis-promisify";
import GenericContainerBuilder from "../src/Builders/genericContainerBuilder";
import Container from "../src/Containers/container";

describe("Redis Container Tests", () => {
  const container = new GenericContainerBuilder<Container>(Container)
    .Begin()
    .WithImage("redis:4.0.8")
    .WithExposedPorts(6379)
    .WithPortBindings([6379, 6379])
    .Build();

  beforeAll(async () => {
    return container.Start();
  });

  it("test", async () => {
    const client = redis.createClient();
    await client.setAsync("name", "gurpreet");
    const name = await client.getAsync("name");
    expect(name).toBe("gurpreet");
    await client.quitAsync();
  });

  afterAll(async () => {
    return container.Stop();
  });
});
