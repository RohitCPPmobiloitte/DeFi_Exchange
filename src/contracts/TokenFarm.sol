pragma solidity >=0.5.0;

import './DappToken.sol';
import './DaiToken.sol';

contract TokenFarm {

    string public name = "DApp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    //array of all the user addresses that have staked their token
    address[] public stakers;

    mapping (address => uint256) private stakingBalance;
    mapping (address => bool) private hasStaked;
    mapping (address => bool) private isStaking;

    constructor (DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
    }

    //stake tokens (deposit)
    function stakeTokens(uint _amount) public { 
        //transfer DAI token to this tokenFarm contract to stake
        daiToken.transferFrom(msg.sender, address(this), _amount);
        //update stakingBalance
        stakingBalance[msg.sender] += _amount;
        //adding user to add in the staking array
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        //update hasStaked status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;

    }

    //unstake tokens (withdraw)

    //issue tokens

}
