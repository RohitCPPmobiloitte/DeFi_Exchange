const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

module.exports = async function(deployer, network, accounts) {
    
  await deployer.deploy(DappToken); //deploy dappToken
  const dappToken = await DappToken.deployed();
  
  await deployer.deploy(DaiToken);  //deploy daiToken
  const daiToken = await DaiToken.deployed();
  
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address); //deploy tokenFarm
  const tokenFarm = await TokenFarm.deployed();

  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000'); //transfer all 1mn dapptokens to account[0] == tokenFarm address

  await daiToken.transfer(accounts[1], '100000000000000000000')  //transfer all 100 daiTokens to account[1] == investor

};
