import * as aws from "@pulumi/aws";

// VPC — 10.0.0.0/16
export const vpc = new aws.ec2.Vpc("izimate-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsSupport: true,
  enableDnsHostnames: true,
  tags: { Name: "izimate-vpc" },
});

// Internet Gateway — needed for public subnets outbound
const igw = new aws.ec2.InternetGateway("izimate-igw", {
  vpcId: vpc.id,
  tags: { Name: "izimate-igw" },
});

// Public route table — routes 0.0.0.0/0 to IGW
const publicRt = new aws.ec2.RouteTable("izimate-public-rt", {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
  tags: { Name: "izimate-public-rt" },
});

// Public Subnet A — eu-central-1a (Fargate tasks)
export const publicSubnetA = new aws.ec2.Subnet("izimate-public-a", {
  vpcId: vpc.id,
  cidrBlock: "10.0.1.0/24",
  availabilityZone: "eu-central-1a",
  mapPublicIpOnLaunch: true,
  tags: { Name: "izimate-public-a" },
});

new aws.ec2.RouteTableAssociation("izimate-public-a-rta", {
  subnetId: publicSubnetA.id,
  routeTableId: publicRt.id,
});

// Public Subnet B — eu-central-1b (Fargate tasks, ALB requires 2 AZs)
export const publicSubnetB = new aws.ec2.Subnet("izimate-public-b", {
  vpcId: vpc.id,
  cidrBlock: "10.0.2.0/24",
  availabilityZone: "eu-central-1b",
  mapPublicIpOnLaunch: true,
  tags: { Name: "izimate-public-b" },
});

new aws.ec2.RouteTableAssociation("izimate-public-b-rta", {
  subnetId: publicSubnetB.id,
  routeTableId: publicRt.id,
});

// Private Subnet — eu-central-1a (ElastiCache Redis, no internet access needed)
export const privateSubnet = new aws.ec2.Subnet("izimate-private", {
  vpcId: vpc.id,
  cidrBlock: "10.0.10.0/24",
  availabilityZone: "eu-central-1a",
  tags: { Name: "izimate-private" },
});

// Security group: ALB — allows inbound HTTPS from anywhere
export const albSg = new aws.ec2.SecurityGroup("izimate-alb-sg", {
  vpcId: vpc.id,
  description: "ALB - inbound HTTPS",
  ingress: [{ protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"], description: "HTTPS" }],
  egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "All outbound" }],
  tags: { Name: "izimate-alb-sg" },
});

// Security group: Fargate — allows inbound from ALB only
export const fargateSg = new aws.ec2.SecurityGroup("izimate-fargate-sg", {
  vpcId: vpc.id,
  description: "Fargate - inbound from ALB only",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 3001,
      toPort: 3001,
      securityGroups: [albSg.id],
      description: "From ALB",
    },
  ],
  egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "All outbound" }],
  tags: { Name: "izimate-fargate-sg" },
});

// Security group: Redis — allows inbound from Fargate only
export const redisSg = new aws.ec2.SecurityGroup("izimate-redis-sg", {
  vpcId: vpc.id,
  description: "Redis - inbound from Fargate only",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 6379,
      toPort: 6379,
      securityGroups: [fargateSg.id],
      description: "From Fargate",
    },
  ],
  egress: [],
  tags: { Name: "izimate-redis-sg" },
});
