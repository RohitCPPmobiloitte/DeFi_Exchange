const Vault = artifacts.require("Vault");
const DaiToken = artifacts.require("DaiToken");
const WBTCToken = artifacts.require("WBTCToken");

module.exports = async function(deployer, network, accounts) {
    
  await deployer.deploy(DaiToken); //deploy DaiToken
  const daiToken = await DaiToken.deployed();
  
  await deployer.deploy(WBTCToken);  //deploy wbtcToken
  const wbtcToken = await WBTCToken.deployed();
  
  await deployer.deploy(Vault, daiToken.address, wbtcToken.address); //deploy vault
  const vault = await Vault.deployed();

  await daiToken.transfer(vault.address, '1000000000000000000000000'); //transfer all 1mn DaiToken to vault address

  await wbtcToken.transfer(accounts[1], '100000000000000000000')  //transfer all 100 wbtcTokens to account[1] == investor

};
