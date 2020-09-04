pragma solidity >=0.5.0;

import './DappToken.sol';
import './DaiToken.sol';

contract TokenFarm {

    string public name = "DApp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    //array of all the user addresses that have staked their token
    address[] public stakers;

    mapping (address => uint256) public stakingBalance;
    mapping (address => bool) public hasStaked;
    mapping (address => bool) public isStaking;

    constructor (DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
    }

    //stake tokens (deposit) and issues the same token to the caller of the function
    function stakeTokens(uint _amount) public { 
        require(_amount > 0, "Amount cannot be zero");

        //transfer DAI token to this tokenFarm contract to stake
        daiToken.transferFrom(msg.sender, address(this), _amount);
        //update stakingBalance
        stakingBalance[msg.sender] += _amount;
        //adding user to add in the staking array
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        //update staking status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;

        //issue tokens to the caller
        issueTokens(msg.sender);
    }

    //unstake tokens (withdraw)

    //issue tokens
    function issueTokens(address recipient) public {
        uint balance = stakingBalance[recipient];
        if (balance > 0){
            dappToken.transfer(recipient, balance);
        }
    }

}
