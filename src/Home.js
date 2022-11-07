// App.js
import { useEffect, useState } from "react";
import "./App.css";
import "./App_responsive.css";

import headerLogoImage from "./logo_l.png";
import footerLogoImage from "./logo_footer_m.png";

import { networks } from './utils/networks';

// 各ページをインポートします。
import PatientsPages from "./Components/PatientsPages";
import HealthcareWorkersPages from "./Components/HealthcareWorkersPages";

function App() {
  
  const [currentAccount, setCurrentAccount] = useState(null);
  // network を状態変数として設定します。
  const [network, setNetwork] = useState("");
  // 医療従事者様か患者様かを設定する変数とセッター関数
  const [currentRole, setCurrentRole] = useState("");

  // network を扱えるよう checkIfWalletIsConnected 関数をupdateします。
  const connectWallet = async ( isHealthcareWorker ) => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      //let isHealthcareWorker;

      if( isHealthcareWorker ){
        console.log("医療従事者様", accounts[0]);
      }
      else if( !isHealthcareWorker ){
        console.log("患者様", accounts[0]);
      }
      setCurrentRole( isHealthcareWorker );

    } catch (error) {
      console.log(error);
    }

  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Mumbai testnet に切り替えます。
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // utilsフォルダ内のnetworks.js を確認しましょう。0xは16進数です。
        });
      } catch (error) {
        // このエラーコードは当該チェーンがメタマスクに追加されていない場合です。
        // その場合、ユーザーに追加するよう促します。
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                      name: "Mumbai Matic",
                      symbol: "MATIC",
                      decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // window.ethereum が見つからない場合メタマスクのインストールを促します。
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

  // network を扱えるよう checkIfWalletIsConnected 関数をupdateします。
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);

    } else {
      console.log('No authorized account found');
    }

    // ユーザーのネットワークのチェーンIDをチェックします。
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);

    // ネットワークが変わったらリロードします。
    function handleChainChanged(_chainId) {
      console.log('No authorized account found');
      window.location.reload();
    }

    /*ethereum.on('accountsChanged', handleAccountsChanged);

    // アカウントの接続が変わったらリロードします。
    function handleAccountsChanged(_accounts) {
      console.log('This page is reloaded because recent account was disconnected.');
      window.location.reload();
    }*/

  };

  //Reactにおいて、onClickでconnectWallet関数を呼び出したいのだけれど、
  //connectWallet関数に引数を渡す場合、onClick={connectWallet(true)}のように普通にやっても渡せない。
  //onClick={ () => connectWallet(true) }とすると期待通りに動いているように見えるけど、
  //(再)描画のたびに関数を作成することになるため、ベストプラクティスじゃない。
  //苦肉の策として、橋渡しをする以下の2つの関数をonClickに登録し、関数内でconnectWallet関数を呼び出す。
  const pacientsconnectWallet = () => {
    //患者様（false）としてウォレットを接続
    connectWallet(false);
  };
  const healthcareworkersconnectWallet = async () => {
    //医療従事者様（true）としてウォレットを接続
    connectWallet(true);
  };

  // レンダリング関数です。
  const renderNotConnectedContainer = () => (
    <div className="top-wrapper">
      <div className="container">
        <h1 className="top-text">Distributed Medical Database</h1>
        <h1 className="top-text">分散型医療データベース</h1>
        <div className="btn-wrapper">
          <button
            onClick={pacientsconnectWallet}
            className="cta-button connect-wallet-button mar"
          >
            患者様はこちらからウォレットを接続してください
          </button>
          <p>or</p>
          <button
            onClick={healthcareworkersconnectWallet}
            className="cta-button connect-wallet-button"
          >
            医療従事者様はこちらからウォレットを接続してください
          </button>
        </div>
      </div>
    </div>
  );

  // 最初のページ。医療従事者と患者で振り分けて、ページの表示を決める
  const renderFirstPage = () => {
    // Polygon Mumbai Testnet上にいない場合、switchボタンをレンダリングします。
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <h2>Please switch to Polygon Mumbai Testnet</h2>
          {/* 今ボタンで switchNetwork 関数を呼び出します。 */}
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }
    //医療従事者様なら
    if( currentRole ){
      return < HealthcareWorkersPages currentAccount={currentAccount} network={network}/>;
    }
    //患者様なら
    else{
      return < PatientsPages />;
    }
  };

  // currentAccount, network が変わるたびに実行されます。
  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
    }
  }, [currentAccount, network]);

  //ページがロードされた時に走る処理
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      
      <header>
        <div className="container">
          <div className="header-left">
            <img alt="Twitter Logo" className="logo" src={headerLogoImage} />
          </div>
          <span className="fa fa-bars menu-icon"></span>
    
          <div className="header-right">
          </div>
        </div>
      </header>

      {!currentAccount && renderNotConnectedContainer()}
      {/* アカウントが接続されるとインプットフォームをレンダリングします。 */}
      {currentAccount && renderFirstPage()}

      <footer>
        <div className="container">
          <img alt="Twitter Logo" src={footerLogoImage} />
          <p>Human Health Care on web3</p>
        </div>
      </footer>

    </div>
  );

}

export default App;