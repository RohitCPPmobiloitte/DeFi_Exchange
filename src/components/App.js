import React, { Component } from 'react'
import Web3 from 'web3'
import WBTCToken from '../abis/WBTCToken.json'
import DaiToken from '../abis/DaiToken.json'
import Vault from '../abis/Vault.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load WBTCToken
    const wbtcTokenData = WBTCToken.networks[networkId]
    if(wbtcTokenData) {
      const wbtcToken = new web3.eth.Contract(WBTCToken.abi, wbtcTokenData.address)
      this.setState({ wbtcToken })
      let wbtcTokenBalance = await wbtcToken.methods.balanceOf(this.state.account).call()
      this.setState({ wbtcTokenBalance: wbtcTokenBalance.toString() })
    } else {
      window.alert('WBTCToken contract not deployed to detected network.')
    }

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load Vault
    const vaultData = Vault.networks[networkId]
    if(vaultData) {
      const vault = new web3.eth.Contract(Vault.abi, vaultData.address)
      this.setState({ vault })
      let stakingBalance = await vault.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('Vault contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.wbtcToken.methods.approve(this.state.vault._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.vault.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.vault.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      wbtcToken: {},
      daiToken: {},
      vault: {},
      wbtcTokenBalance: '0',
      daiTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        wbtcTokenBalance={this.state.wbtcTokenBalance}
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;