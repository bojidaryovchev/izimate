import * as aws from "@pulumi/aws";
import { privateSubnet, redisSg } from "./vpc";

// Subnet group for ElastiCache (private subnet only)
const redisSubnetGroup = new aws.elasticache.SubnetGroup("izimate-redis-subnet", {
  subnetIds: [privateSubnet.id],
  description: "Private subnet for Redis",
  tags: { Name: "izimate-redis-subnet" },
});

// ElastiCache Redis — single-node t4g.micro (Socket.io adapter pub/sub)
export const redis = new aws.elasticache.Cluster("izimate-redis", {
  engine: "redis",
  engineVersion: "7.1",
  nodeType: "cache.t4g.micro",
  numCacheNodes: 1,
  subnetGroupName: redisSubnetGroup.name,
  securityGroupIds: [redisSg.id],
  port: 6379,
  tags: { Name: "izimate-redis" },
});

export const redisHost = redis.cacheNodes.apply((nodes) => nodes[0]?.address ?? "");
export const redisPort = redis.port;
