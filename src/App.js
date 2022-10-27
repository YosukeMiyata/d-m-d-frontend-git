// App.js
import { useEffect, useState } from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

import { CONTRACT_ADDRESS, ABI, ETHERS } from "./constants";

// SelectCharacter に入っているファイルをインポートします。
import PatientsPages from "./Components/PatientsPages";

const TWITTER_HANDLE = "juilliard_inst";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {
  
  const [currentAccount, setCurrentAccount] = useState(null);
  // network を状態変数として設定します。
  const [network, setNetwork] = useState("");

  const [currentRole, setCurrentRole] = useState("");

  //コメント欄のコメントを保存する変数とメソッド
  const [passwordValue, setPasswordValue] = useState("");

  //ウォレットアドレスで医療従事者か患者かの判定を行う
  /*const sortWalletAddress = async ( eth ) => {
    
    const provider = new ETHERS.providers.Web3Provider(eth);
    const signer = provider.getSigner();
    const dmdContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);

    console.log("sort Wallet Address");
    let bool = await dmdContract.sort();

    console.log(`Result: ${bool}`);
    setCurrentRole( bool );

  };*/
  
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
  //healthcareworkersconnectWalletについては、パスワードの照合をついでにここでやっちゃう。
  const pacientsconnectWallet = () => {
    //患者様（false）としてウォレットを接続
    connectWallet(false);
  };
  const healthcareworkersconnectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const provider = new ETHERS.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const dmdContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);

      console.log("verify password");
      //パスワードの照合
      let bool = await dmdContract.verify_password( passwordValue )
      
      //パスワードが合っていれば
      if( bool ){
        
        //医療従事者様（true）としてウォレットを接続
        connectWallet(true);

      }
      else{
        alert("パスワードが合っていません。ご確認の上、もう一度ご入力ください。");
      }

      
    } catch (error) {
      console.log(error);
    }

  };

  // レンダリング関数です。
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <h1>分散型医療データベース</h1>
      {/* ボタンクリックでconnectWallet関数を呼び出します。 */}
      <div className="connect-wallet-contents">
        <p>患者様は下のコネクトボタンでMetaMaskのウォレットを接続してください</p>
        <button
          onClick={pacientsconnectWallet}
          className="cta-button connect-wallet-button"
        >
          患者様用 ウォレット接続
        </button>
      </div>
      <div className="connect-wallet-contents">
        <p>医療従事者様は下の空欄にパスワードを入力して、</p>
        <p>コネクトボタンでMetaMaskのウォレットを接続してください</p>
        <textarea
          name="messageArea"
          placeholder="パスワードを入力してください"
          type="text"
          id="message"
          cols="100" 
          rows="1"
          style={{
            height: "20px",      
            marginBottom: "16px",
            padding: "15px",
            fontSize: "20px",
          }}
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
        />
        <button
          onClick={healthcareworkersconnectWallet}
          className="cta-button connect-wallet-button"
        >
          医療従事者様用 ウォレット接続
        </button>
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
      return (
        <div className="form-container">
          <p>You are a health-care worker.</p>
        </div>
      );
    }
    //患者様なら
    else{
      return <PatientsPages />;
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
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              
            </div>
            {/* Display a logo and wallet connection status*/}
            <div className="right">
              <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
              { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
            </div>
          </header>
        </div>

        {!currentAccount && renderNotConnectedContainer()}
        {/* アカウントが接続されるとインプットフォームをレンダリングします。 */}
        {currentAccount && renderFirstPage()}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );

}

export default App;