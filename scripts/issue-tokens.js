const Vault = artifacts.require("Vault");

module.exports = async function(callback) {

    let vault = await Vault.deployed();
    await vault.issueTokens();  
    console.log("tokens issued");
    callback();
};
