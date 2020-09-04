const web3 = require('web3');

const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

require('chai').use(require('chai-as-promised')).should();

//function to convert eather to wei
function toWei(number) {
    return web3.utils.toWei(number, 'ether');
}

//
contract('TokenFarm', ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm;
    let name;

    before(async() => {
        //loading contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        //transfer all Dapp token to token farm
        await dappToken.transfer(tokenFarm.address, toWei('1000000'));

        //send tokens to investor
        await daiToken.transfer(investor, toWei('100'), {from: owner});
    });

    describe('Mock Dai deployment', async() => {
        it('has a name', async() => {
            name = await daiToken.name();
            assert.equal(name, "Mock DAI Token");
        });
        it('has 100 mDAI in investor account', async() => {
            let balance = await daiToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('100'));
        });
    });

    describe('DApp Token deployment', async() => {
        it('has a name', async() => {
            name = await dappToken.name();
            assert.equal(name, "DApp Token"); 
        });
        
        it('has 1 million DAPP tokens as total supply', async() => {
            let balance = await dappToken.totalSupply();
            assert.equal(balance.toString(), toWei('1000000'), "dapp token total supply is not 1 million");
        });
        
    });

    describe('TokenFarm deployment', async() => {
        let balance;

        it('has a name', async() => {
            name = await tokenFarm.name();
            assert.equal(name, "DApp Token Farm");
        });

        it('tokenFarm contract has 1 million dapp tokens in its dappToken account', async() => {
            balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), toWei('1000000'), "tokenFarm dapptoken balance not 1million initially");
        });

        it('investor has zero dappToken initially', async() => {
            balance = await dappToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('0'), "Investor dappToken balance not zero initially");
        });
    });

    describe('Farming Tokens', async() => {
        let balance;

        it('before staking has 0 DAI token with tokenFarm and 100 DAI token with investor', async() => {
            //checking investor mDAI balance before staking
            balance = await daiToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('100'), "Investor's initial mDAI token holdings is not 100");

            //checking tokenFarm mDAI balance before staking
            balance = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), toWei('0'), "tokenFarm's initial mDAI token holdings is not 0");
        });

        it('after staking has 100 DAI token with tokenFarm and 0 DAI token with investor', async() => {
            //adding tokenfarm in approve list and staking investor's mDAI
            await daiToken.approve(tokenFarm.address, toWei('100'), {from: investor});
            //staking investor's mDAI with tokenFarm
            await tokenFarm.stakeTokens(toWei('100'), {from: investor});

            //checking investor mDAI balance after staking
            balance = await daiToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('0'), "Investor's mDAI token holding after staking is not 0");

            //checking tokenFarm mDAI balance after staking
            balance = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), toWei('100'), "Investor's mDAI token holding after staking is not 100");
        });
            
        it('after staking has 100 DAPP token with investor', async() => {
            //checking DAPP balance of investor in tokenFarm 
            balance = await tokenFarm.stakingBalance(investor);
            assert.equal(balance.toString(), toWei('100')), "Investor's DAPP staking balance is not 100 after staking";

            //checking current staking is true
            let isStaking = await tokenFarm.isStaking(investor);
            assert.equal(isStaking.toString(), 'true', "after staking, Investor's isStaking is not set to true");

            //check balance after issuance
            balance = await dappToken.balanceOf(investor);
            assert.equal(balance.toString(), toWei('100'), "after staking, Investor's DAPP balance is not 100"); 
        });
    });

});

