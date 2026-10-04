import { network } from "hardhat";

const { ethers } = await network.connect();

const VirtualWorld = await ethers.getContractFactory("VirtualWorld");

const virtualWorld = await VirtualWorld.deploy();

await virtualWorld.waitForDeployment();

console.log(
  "VirtualWorld deployed to:",
  await virtualWorld.getAddress()
);