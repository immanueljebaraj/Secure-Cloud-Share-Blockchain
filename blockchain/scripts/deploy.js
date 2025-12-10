async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const FileAudit = await ethers.getContractFactory("FileAudit");
  const fileAudit = await FileAudit.deploy();
  await fileAudit.deployed();

  console.log("FileAudit deployed to:", fileAudit.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
