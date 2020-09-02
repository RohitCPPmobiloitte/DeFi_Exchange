const web3 = require('web3');

const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

//const web3 = new Web3();

require('chai').use(require('chai-as-promised')).should();

function toWei(number) {
    return web3.utils.toWei(number, 'ether');
}

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
        await daiToken.transfer(investor, toWei('100', {from: owner}));
    });

    describe('Mock Dai deployment', async() => {
        it('has a name', async() => {
            name = await daiToken.name();
            assert.equal(name, "Mock DAI Token");
        });
    });

    describe('DApp Token deployment', async() => {
        it('has a name', async() => {
            name = await dappToken.name();
            assert.equal(name, "DApp Token"); 
        });
        it('has 1 million DAPP tokens in account', async() => {
            let balance = await dappToken.totalSupply();
            assert.equal(balance.toString(), toWei('1000000'));
        });
        
    });

    describe('TokenFarm deployment', async() => {
        it('has a name', async() => {
            name = await tokenFarm.name();
            assert.equal(name, "DApp Token Farm");
        });
        it('tokenFarm contract has 1 million dapp tokens', async() => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), toWei('1000000'));
        });
        it('rewards investors for staking mDai token', async() => {
            let results = await daiToken.balanceOf(investor);
            assert.equal(results, toWei('100'), "investor balance correct before staking");
            
        });
    });

});

