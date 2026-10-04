import { network } from "hardhat";

const { ethers } = await network.create({
  network: "localhost",
  chainType: "l1",
});

const [sender] = await ethers.getSigners();

const recipient = "0xC79c6fA13Cf57cEca4c8C5A2442B035428E2c3a9";

console.log("Sending 1 ETH from:", sender.address);
console.log("Sending 1 ETH to:", recipient);

const tx = await sender.sendTransaction({
  to: recipient,
  value: ethers.parseEther("1"),
});

await tx.wait();

console.log("1 ETH sent successfully.");
