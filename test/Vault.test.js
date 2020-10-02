const web3 = require('web3');

const Vault = artifacts.require("Vault");
const DaiToken = artifacts.require("DaiToken");
const WBTCToken = artifacts.require("WBTCToken");

require('chai').use(require('chai-as-promised')).should();

//function to convert eather to wei
function toWei(number) {
    return web3.utils.toWei(number, 'ether');
}

//
contract('Vault', ([owner, investor]) => {

    let wbtcToken, daiToken, vault;
    let name;

    before(async() => {
        //loading contracts
        wbtcToken = await WBTCToken.new();
        daiToken = await DaiToken.new();
        vault = await Vault.new(daiToken.address, wbtcToken.address);

        //transfer all Dapp token to token farm
        await daiToken.transfer(vault.address, toWei('1000000'));

        //send tokens to investor
        await wbtcToken.transfer(investor, toWei('100'), {from: owner});
    });

    describe('Mock WBTC deployment', async() => {
        it('has a name', async() => {
            name = await wbtcToken.name();
            assert.equal(name, "Mock WBTC Token");
        });
        it('has 100 WBTC in investor account', async() => {
            let balance = await wbtcToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('100'));
        });
    });

    describe('DAI Token deployment', async() => {
        it('has a name', async() => {
            name = await daiToken.name();
            assert.equal(name, "Mock Dai Token"); 
        });
        
        it('has 1 million DAI tokens as total supply', async() => {
            let balance = await daiToken.totalSupply();
            assert.equal(balance.toString(), toWei('1000000'), "DAI token total supply is not 1 million");
        });
        
    });

    describe('Vault deployment', async() => {
        let balance;

        it('has a name', async() => {
            name = await vault.name();
            assert.equal(name, "Vault");
        });

        it('vault contract has 1 million dai tokens in its daiToken account', async() => {
            balance = await daiToken.balanceOf(vault.address);
            assert.equal(balance.toString(), toWei('1000000'), "vault daitoken balance not 1million initially");
        });

        it('investor has zero daiToken initially', async() => {
            balance = await daiToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('0'), "Investor daiToken balance not zero initially");
        });
    });

    describe('Staking Tokens', async() => {
        let balance;

        it('before staking has 0 WBTC token with vault and 100 WBTC token with investor', async() => {
            //checking investor WBTC balance before staking
            balance = await wbtcToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('100'), "Investor's initial WBTC token holdings is not 100");

            //checking vault WBTC balance before staking
            balance = await wbtcToken.balanceOf(vault.address);
            assert.equal(balance.toString(), toWei('0'), "vault's initial WBTC token holdings is not 0");
        });

        it('after staking has 100 WBTC token with vault and 0 WBTC token with investor', async() => {
            //adding tokenfarm in approve list and staking investor's WBTC
            await wbtcToken.approve(vault.address, toWei('100'), {from: investor});
            //staking investor's WBTC with vault
            await vault.stakeTokens(toWei('100'), {from: investor});

            //checking investor WBTC balance after staking
            balance = await wbtcToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('0'), "Investor's WBTC token holding after staking is not 0");

            //checking vault WBTC balance after staking
            balance = await wbtcToken.balanceOf(vault.address);
            assert.equal(balance.toString(), toWei('100'), "Vault's WBTC token holding after staking is not 100");
        });
            
        it('after staking has 100 DAI token with investor', async() => {
            //checking DAI balance of investor in vault 
            balance = await vault.stakingBalance(investor);
            assert.equal(balance.toString(), toWei('100')), "Investor's DAI staking balance is not 100 after staking";

            //checking current staking is true
            let isStaking = await vault.isStaking(investor);
            assert.equal(isStaking.toString(), 'true', "after staking, Investor's isStaking is not set to true");

            //check balance after issuance
            balance = await daiToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('100'), "after staking, Investor's DAI balance is not 100"); 
        });
    });

});

