// index.js
import React, { useEffect, useState } from "react";
import "./HealthcareWorkersPages.css";

import ethLogo from '../../assets/ethlogo.png';
import polygonLogo from '../../assets/polygonlogo.png';

import { CONTRACT_ADDRESS, ABI, ETHERS } from "./../../constants";
import { useForm } from 'react-hook-form';
import ApprovalPages from "../../Components/ApprovalPages";

import { ColorRing } from 'react-loader-spinner'
;<ColorRing
visible={true}
height="80"
width="80"
ariaLabel="blocks-loading"
wrapperStyle={{}}
wrapperClass="blocks-wrapper"
colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
/>

const HealthcareWorkersPages = ({currentAccount, network}) => {

  const { register, handleSubmit, formState: { errors } } = useForm();

  //登録フラグを保存する変数とメソッド
  const [isRegisteredValue, setIsRegisteredValue] = useState("");

  //パスワードを保存する変数とメソッド
  const [passwordValue, setPasswordValue] = useState("");

  //パスワードの照合をパスしたことを示す変数とメソッド
  const [verifiedValue, setVerifiedValue] = useState("");

  //　コントラクトから返ってきた基本情報を保存する変数とメソッド
  const [basicinformationValue, setBasicInformationValue] = useState([]);

  //コントラクトから返ってきた医療データを保存する変数とメソッド
  //const [medicaldataValue, setMedicalDataValue] = useState([]);

  //コントラクトから返ってきた時刻を日本表記にして保存する変数とメソッド
  const [lasttimeValue, setLastTimeValue] = useState("");

  //編集フラグを保存する変数とメソッド
  const [editmodeValue, setEditModeValue] = useState("");

  //基本情報へのアクセスフラグを保存する変数とメソッド
  const [mypagemodeValue, setMyPageModeValue] = useState("");

  //検索する患者様のアドレスを保存する変数とメソッド
  const [searchaddressValue, setSearchAddressValue] = useState("");

  //患者様の登録フラグを保存する変数とメソッド
  const [isRegisteredPatientValue, setIsRegisteredPatientValue] = useState("");

  //次のページに進むフラグを保存する変数とメソッド
  const [isNextPageValue, setIsNextPageValue] = useState("");

  //ローディングフラグを保存する変数とメソッド
  const [isLoadingValue, setIsLoadingValue] = useState("");

  //登録済みの基本情報をコントラクトから取得する
  const getRegisterdBasicInformation = async ( flag ) => {
    
    //基本情報が登録済みなら
    if(flag){

      try {

        const { ethereum } = window;

        if (!ethereum) {
          alert("Get MetaMask -> https://metamask.io/");
          return;
        }

        if (ethereum) {
          const provider = new ETHERS.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const dmdContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);

          console.log("get my medical data");
          //自分の基本情報取得
          const datas = await dmdContract.get_basic_information_for_healthcare_worker();
          console.log( datas );

          let date = new Date( datas.lasttimestamp * 1000 ).toLocaleString();
          console.log( "date is ", date );
          setLastTimeValue( date );

          setBasicInformationValue( datas );

        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    }

  };

  // ページが読み込まれる毎に呼ばれる関数
  const checkIfWalletIsRegisterd = async () => {
    
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

      console.log("check if wallet is registerd");
      //基本情報が登録済みかどうか確認
      let bool = await dmdContract.check_if_healthcare_worker_registered();

      //登録済みなら
      if( bool ){
        
        console.log("登録済み");
        
      }
      else{

        console.log("未登録");
        
      }

      //自分の基本情報を取得
      getRegisterdBasicInformation( bool );
      
      //console.log(basicinformationValue);
      
      setIsRegisteredValue( bool );
      
    } catch (error) {
      console.log(error);
    }

  };

  //コントラクトのNewMedicalDataAboutPatientイベントから送られてきたデータを受け取り、処理する
  useEffect(() => {
    
    let dmdContract;

    //コントラクトからの通知を受け取る
    const onNewBasicInformationAboutHealthcareWorker = (
      id, healthcareworker, familyname, firstname, furiganafamilyname, furiganafirstname, workplace, occupation, lasttimestamp) => {
      
      console.log("NewData", id, healthcareworker, familyname, firstname, furiganafamilyname, furiganafirstname, workplace, occupation, lasttimestamp);
      
      //自分の基本情報を取得する。tureは基本情報が登録済みであることを示す
      getRegisterdBasicInformation( true );

      console.log("Mission Completed");
      
      //これをしないとベージの表示が更新されない
      setIsRegisteredValue( true );

    };

    /* NewBasicInformationAboutPatientイベントがコントラクトから発信されたときに、情報を受け取ります */
    if (window.ethereum) {
      const provider = new ETHERS.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      dmdContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      dmdContract.on("NewBasicInformationAboutHealthcareWorker", onNewBasicInformationAboutHealthcareWorker);
    }
    /*メモリリークを防ぐために、NewBasicInformationAboutPatientのイベントを解除します*/
    return () => {
      if (dmdContract) {
        dmdContract.off("NewBasicInformationAboutHealthcareWorker", onNewBasicInformationAboutHealthcareWorker);
      }
    };
  }, []);

  const renderNotRegisteredVerifyPasswordContainer = () => {
    return(
      <div className="textcenter">
        <textarea
            name="messageArea"
            placeholder="医療従事者様はパスワードを入力して下のボタンを押してください"
            type="text"
            id="message"
            cols="100" 
            rows="1"
            style={{
              width: "650px",
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
            パスワードを確認する
          </button>
      </div>
    );
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
        
        alert("パスワードが合致し、承認されました！");
        //承認済み
        setVerifiedValue( bool );

      }
      else{
        alert("パスワードが合っていません。ご確認の上、もう一度ご入力ください。");
      }

      
    } catch (error) {
      console.log(error);
    }

  };

  const healthcareworkersSearchAddress = async () => {
    //検索欄に何かしら入力されていて、有効なアドレスなら
    if( searchaddressValue !== "" && ETHERS.utils.isAddress( searchaddressValue ) ){
      
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

        console.log("Search Address");
        //検索した患者様が登録済みかどうか判定
        let bool = await dmdContract.check_if_patient_registered_by_others( searchaddressValue );
        
        //検索した患者様が登録済みなら
        if( bool ){
          
          console.log("Alright!");
          setIsRegisteredPatientValue( bool );
          setIsNextPageValue( true );
          //return < ApprovalPages currentAccount={currentAccount} network={network} searchAddress={searchaddressValue} isRegistered="true"/>;

        }
        //未登録なら
        else{
          
          //alert("未登録の患者様のです。");
          console.log("Nope!");
          setIsRegisteredPatientValue( bool );
          setIsNextPageValue( true );

        }

        
      } catch (error) {
        console.log(error);
      }
    //検索欄に何も入力されていないか、無効なアドレスなら
    }else{
      alert("検索アドレスをご確認の上、もう一度ご入力ください。");
    }

  };

  // 基本情報が未登録の場合の登録フォームをレンダリングする関数
  const renderNotRegisteredContainer = () => (
    <div className="form-container">
      <h1>医療従事者様用　登録フォーム</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
      <table className="form-table">
          <tbody>
            <tr>
              <th><label htmlFor="familyname">お名前</label></th>
              <td className="form-table-marge-left">
                姓  :  <input id="form-container-name" {...register('familyname', { required: true })} autoComplete="family-name"/>
                {errors.familyname && <div id="color-red">姓は必須の項目です</div>}
              </td>
              <td className="form-table-marge-right">
                名  :  <input id="form-container-name" {...register('firstname', { required: true })} autoComplete="given-name"/>
                {errors.firstname && <div id="color-red">名は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th><label htmlFor="furiganafamilyname">フリガナ</label></th>
              <td className="form-table-marge-left">
                セイ  :  <input id="form-container-name" {...register('furiganafamilyname', { required: true })} />
                {errors.furiganafamilyname && <div id="color-red">セイは必須の項目です</div>}
              </td>
              <td className="form-table-marge-right">
                メイ  :  <input id="form-container-name" {...register('furiganafirstname', { required: true })} />
                {errors.furiganafirstname && <div id="color-red">メイは必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th><label htmlFor="workplace">勤務先</label></th>
              <td colSpan="2" className="form-table-not-marge">
                <input id="form-container-name2" {...register('workplace', { required: true })} />
                {errors.workplace && <div id="color-red">勤務先は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>職種</th>
              <td  colSpan="2" className="form-table-not-marge">
                <div className="radio-button-field">
                  <label className="radio-label" htmlFor="occupation-1">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="医師"
                        id="occupation-1"
                    />
                    医師
                  </label>
                  <label className="radio-label" htmlFor="occupation-2">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="歯科医師"
                        id="occupation-2"
                    />
                    歯科医師
                  </label>
                  <label className="radio-label" htmlFor="occupation-3">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="薬剤師"
                        id="occupation-3"
                    />
                    薬剤師
                  </label>
                  <label className="radio-label" htmlFor="occupation-4">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="保健師"
                        id="occupation-4"
                    />
                    保健師
                  </label>
                  <label className="radio-label" htmlFor="occupation-5">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="助産師"
                        id="occupation-5"
                    />
                    助産師
                  </label>
                  <label className="radio-label" htmlFor="occupation-6">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="看護師"
                        id="occupation-6"
                    />
                    看護師
                  </label>
                  <label className="radio-label" htmlFor="occupation-7">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="准看護師"
                        id="occupation-7"
                    />
                    准看護師
                  </label>
                  <label className="radio-label" htmlFor="occupation-8">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="歯科衛生士"
                        id="occupation-8"
                    />
                    歯科衛生士
                  </label>
                  <label className="radio-label" htmlFor="occupation-9">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="診療放射線技師"
                        id="occupation-9"
                    />
                    診療放射線技師
                  </label>
                  <label className="radio-label" htmlFor="occupation-10">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="歯科技工士"
                        id="occupation-10"
                    />
                    歯科技工士
                  </label>
                  <label className="radio-label" htmlFor="occupation-11">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="臨床検査技師"
                        id="occupation-11"
                    />
                    臨床検査技師
                  </label>
                  <label className="radio-label" htmlFor="occupation-12">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="衛生検査技師"
                        id="occupation-12"
                    />
                    衛生検査技師
                  </label>
                  <label className="radio-label" htmlFor="occupation-13">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="理学療法士"
                        id="occupation-13"
                    />
                    理学療法士
                  </label>
                  <label className="radio-label" htmlFor="occupation-14">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="作業療法士"
                        id="occupation-14"
                    />
                    作業療法士
                  </label>
                  <label className="radio-label" htmlFor="occupation-15">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="視能訓練士"
                        id="occupation-15"
                    />
                    視能訓練士
                  </label>
                  <label className="radio-label" htmlFor="occupation-16">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="臨床工学技士"
                        id="occupation-16"
                    />
                    臨床工学技士
                  </label>
                  <label className="radio-label" htmlFor="occupation-17">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="義肢装具士"
                        id="occupation-17"
                    />
                    義肢装具士
                  </label>
                  <label className="radio-label" htmlFor="occupation-18">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="救急救命士"
                        id="occupation-18"
                    />
                    救急救命士
                  </label>
                  <label className="radio-label" htmlFor="occupation-19">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="言語聴覚士"
                        id="occupation-19"
                    />
                    言語聴覚士
                  </label>
                  <label className="radio-label" htmlFor="occupation-20">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="管理栄養士(栄養士)"
                        id="occupation-20"
                    />
                    管理栄養士(栄養士)
                  </label>
                  <label className="radio-label" htmlFor="occupation-21">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="あん摩マッサージ指圧師"
                        id="occupation-21"
                    />
                    あん摩マッサージ指圧師
                  </label>
                  <label className="radio-label" htmlFor="occupation-22">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="鍼灸師"
                        id="occupation-22"
                    />
                    鍼灸師
                  </label>
                  <label className="radio-label" htmlFor="occupation-23">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="柔道整復師"
                        id="occupation-23"
                    />
                    柔道整復師
                  </label>
                  <label className="radio-label" htmlFor="occupation-24">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="医療事務"
                        id="occupation-24"
                    />
                    医療事務
                  </label>
                  <label className="radio-label" htmlFor="occupation-25">
                    <input
                        {...register("occupation", { required: true })}
                        type="radio"
                        value="その他"
                        id="occupation-25"
                    />
                    その他
                  </label>
                
                </div>
                {errors.occupation && <div id="color-red">職種は必須の項目です</div>}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="textcenter">
          { isLoadingValue ? <ColorRing/> : <button type="submit" className="cta-button connect-wallet-button" >登録</button> }
        </div>
      </form>
    </div>
  );

  const renderEditBloodType = () => {
    return (
      <div className="radio-button-field">
        <label className="radio-label" htmlFor="occupation-1">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="医師"
              id="occupation-1"
          />
          医師
        </label>
        <label className="radio-label" htmlFor="occupation-2">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="歯科医師"
              id="occupation-2"
          />
          歯科医師
        </label>
        <label className="radio-label" htmlFor="occupation-3">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="薬剤師"
              id="occupation-3"
          />
          薬剤師
        </label>
        <label className="radio-label" htmlFor="occupation-4">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="保健師"
              id="occupation-4"
          />
          保健師
        </label>
        <label className="radio-label" htmlFor="occupation-5">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="助産師"
              id="occupation-5"
          />
          助産師
        </label>
        <label className="radio-label" htmlFor="occupation-6">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="看護師"
              id="occupation-6"
          />
          看護師
        </label>
        <label className="radio-label" htmlFor="occupation-7">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="准看護師"
              id="occupation-7"
          />
          准看護師
        </label>
        <label className="radio-label" htmlFor="occupation-8">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="歯科衛生士"
              id="occupation-8"
          />
          歯科衛生士
        </label>
        <label className="radio-label" htmlFor="occupation-9">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="診療放射線技師"
              id="occupation-9"
          />
          診療放射線技師
        </label>
        <label className="radio-label" htmlFor="occupation-10">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="歯科技工士"
              id="occupation-10"
          />
          歯科技工士
        </label>
        <label className="radio-label" htmlFor="occupation-11">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="臨床検査技師"
              id="occupation-11"
          />
          臨床検査技師
        </label>
        <label className="radio-label" htmlFor="occupation-12">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="衛生検査技師"
              id="occupation-12"
          />
          衛生検査技師
        </label>
        <label className="radio-label" htmlFor="occupation-13">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="理学療法士"
              id="occupation-13"
          />
          理学療法士
        </label>
        <label className="radio-label" htmlFor="occupation-14">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="作業療法士"
              id="occupation-14"
          />
          作業療法士
        </label>
        <label className="radio-label" htmlFor="occupation-15">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="視能訓練士"
              id="occupation-15"
          />
          視能訓練士
        </label>
        <label className="radio-label" htmlFor="occupation-16">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="臨床工学技士"
              id="occupation-16"
          />
          臨床工学技士
        </label>
        <label className="radio-label" htmlFor="occupation-17">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="義肢装具士"
              id="occupation-17"
          />
          義肢装具士
        </label>
        <label className="radio-label" htmlFor="occupation-18">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="救急救命士"
              id="occupation-18"
          />
          救急救命士
        </label>
        <label className="radio-label" htmlFor="occupation-19">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="言語聴覚士"
              id="occupation-19"
          />
          言語聴覚士
        </label>
        <label className="radio-label" htmlFor="occupation-20">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="管理栄養士(栄養士)"
              id="occupation-20"
          />
          管理栄養士(栄養士)
        </label>
        <label className="radio-label" htmlFor="occupation-21">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="あん摩マッサージ指圧師"
              id="occupation-21"
          />
          あん摩マッサージ指圧師
        </label>
        <label className="radio-label" htmlFor="occupation-22">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="鍼灸師"
              id="occupation-22"
          />
          鍼灸師
        </label>
        <label className="radio-label" htmlFor="occupation-23">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="柔道整復師"
              id="occupation-23"
          />
          柔道整復師
        </label>
        <label className="radio-label" htmlFor="occupation-24">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="医療事務"
              id="occupation-24"
          />
          医療事務
        </label>
        <label className="radio-label" htmlFor="occupation-25">
          <input
              {...register("occupation", { required: true })}
              type="radio"
              value="その他"
              id="occupation-25"
          />
          その他
        </label>
      </div>
    )
  };

  const renderSubmitButton = () => {
    if( isLoadingValue ){
      return(
        <div className="textcenter"><ColorRing/></div>
      );
    }else{
      return(
        <form onSubmit={handleSubmit(onReSubmit)}>
          <button type="submit" className="cta-button connect-wallet-button" >再登録</button>
        </form>
      );
    }
  };

  const renderHeaderContainer = () => {
    
    return(
      <div className="header-container">
        <div className="left">
          <button className="cta-button connect-wallet-button" onClick={()=>onMyPage()} >あなたの基本情報</button>
        </div>
        {/* Display a logo and wallet connection status*/}
        <div className="right">
          <img alt="Network logo" className="logo_polygon" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
          { currentAccount ? <p>wallet : {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
        </div>
      </div>
    )
  
};

  
  //登録ボタンが押されたときに呼ばれる関数
  const onSubmit = async (data) => {

    setIsLoadingValue( true );
    
    console.log( data.familyname );
    console.log( data.firstname );
    console.log( data.furiganafamilyname );
    console.log( data.furiganafirstname );
    console.log( data.workplace );
    console.log( data.occupation );

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

      console.log("register medical data");
      
      //基本情報を登録する
      let registerTxn = await dmdContract.register_basic_information_for_healthcareworker(
        data.familyname,
        data.firstname,
        data.furiganafamilyname,
        data.furiganafirstname,
        data.workplace,
        data.occupation
      );
      console.log("Registering...", registerTxn);
      await registerTxn.wait();
      console.log("Registered -- ", registerTxn);

      setIsLoadingValue( false );
      
    } catch (error) {
      setIsLoadingValue( false );
      console.log(error);
    }
  };

  //編集ボタンが押されたときに呼ばれる関数
  const onEdit = async () => {
    
    if( !editmodeValue ){
      
      console.log("Clicked onEdit!");
      setEditModeValue( true );
    
    }
    else{

      console.log("Clicked onEdit!");
      setEditModeValue( false );

    }

  };

  //基本情報ボタンが押されたときに呼ばれる関数
  const onMyPage = async () => {
    
    if( !mypagemodeValue ){
      
      console.log("Clicked onEdit!");
      setMyPageModeValue( true );
    
    }
    else{

      console.log("Clicked onEdit!");
      setMyPageModeValue( false );

    }

  };

  //登録ボタンが押されたときに呼ばれる関数
  const onReSubmit = async (data) => {

    setIsLoadingValue( true );

    console.log( data.familyname );
    console.log( data.firstname );
    console.log( data.furiganafamilyname );
    console.log( data.furiganafirstname );
    console.log( data.workplace );
    console.log( data.occupation );

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

      console.log("edit medical data");
      
      //基本情報を登録する
      let editTxn = await dmdContract.edit_basic_information_for_healthcareworker(
        data.familyname,
        data.firstname,
        data.furiganafamilyname,
        data.furiganafirstname,
        data.workplace,
        data.occupation
      );
      console.log("Editing...", editTxn);
      await editTxn.wait();
      console.log("Edited -- ", editTxn);

      setIsLoadingValue( false );

      if( editmodeValue ){
      
        console.log("Clicked onEdit!");
        setEditModeValue( false );
  
      }
      
    } catch (error) {
      setIsLoadingValue( false );
      console.log(error);
    }

  }

  //既に基本情報が登録されている場合の表示をレンダリングする関数
  const renderRegisteredContainer = () => (
    <div>
      <h1>登録済み医療従事者様用スペース</h1>
      {renderHeaderContainer()}
      <div>
      </div>
      <div className="textcenter">
        <textarea
            name="messageArea"
            placeholder="検索する患者様のアドレスをご入力ください"
            type="text"
            id="message"
            cols="100" 
            rows="1"
            style={{
              width: "650px",
              marginBottom: "16px",
              padding: "15px",
              fontSize: "20px",
            }}
            value={searchaddressValue}
            onChange={(e) => setSearchAddressValue(e.target.value)}
          />
          <button
            onClick={healthcareworkersSearchAddress}
            className="cta-button connect-wallet-button"
          >
            検索する
          </button>
      </div>
    </div>
  );

  //既に基本情報が登録されている場合の表示をレンダリングする関数
  const renderRegisteredContainer2 = () => (
    <div>
      <h1>医療従事者様　基本情報</h1>
      <div className="textcenter display-between">
        <button className="cta-button connect-wallet-button" onClick={()=>onMyPage()} >戻る</button>
        { !editmodeValue ? <button className="cta-button connect-wallet-button" onClick={()=>onEdit()} >データを編集する</button> : <button className="cta-button connect-wallet-button" onClick={()=>onEdit()} >編集をやめる</button> }
      </div>
      <table className="form-table">
          <tbody>
            <tr>
              <th><label htmlFor="familyname">データ番号</label></th>
              <td className="form-table-not-marge" colSpan="2">{String(Number(basicinformationValue.id))}</td>
            </tr>
            <tr>
              <th><label htmlFor="familyname">アドレス</label></th>
              <td className="form-table-not-marge" colSpan="2">{basicinformationValue.healthcareworker}</td>
            </tr>
            <tr>
              <th><label htmlFor="familyname">お名前</label></th>
              <td className="form-table-marge-left">
                { !editmodeValue ? basicinformationValue.familyname : <div>姓  :  <input id="form-container-name" {...register('familyname', { required: true })} autoComplete="family-name" /></div>}
                {errors.familyname && <div id="color-red">姓は必須の項目です</div>}
              </td>
              <td className="form-table-marge-right">
                { !editmodeValue ? basicinformationValue.firstname : <div>名  :  <input id="form-container-name" {...register('firstname', { required: true })} autoComplete="given-name"/></div>}
                {errors.firstname && <div id="color-red">名は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th><label htmlFor="furiganafamilyname">フリガナ</label></th>
              <td className="form-table-marge-left">
                { !editmodeValue ? basicinformationValue.furiganafamilyname : <div>セイ  :  <input id="form-container-name" {...register('furiganafamilyname', { required: true })} /></div>}
                {errors.furiganafamilyname && <div id="color-red">セイは必須の項目です</div>}
              </td>
              <td className="form-table-marge-right">
                { !editmodeValue ? basicinformationValue.furiganafirstname : <div>メイ  :  <input id="form-container-name" {...register('furiganafirstname', { required: true })} /></div>}
                {errors.furiganafirstname && <div id="color-red">メイは必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>勤務先</th>
              <td  colSpan="2" className="form-table-not-marge">
                { !editmodeValue ? basicinformationValue.workplace : <input id="form-container-name2" {...register('workplace', { required: true })} /> }
                {errors.workplace && <div id="color-red">勤務先は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>職種</th>
              <td  colSpan="2" className="form-table-not-marge">
                { !editmodeValue ? basicinformationValue.occupation : renderEditBloodType() }
                {errors.occupation && <div id="color-red">職種は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>最終更新日</th>
              <td  colSpan="2" className="form-table-not-marge">
                {lasttimeValue}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="textcenter">
          { editmodeValue && renderSubmitButton() }
        </div>
  </div>
  );

  //次のページへの誘導をレンダリングする関数
  const renderNextPageContainer = () => {
    //登録済みの患者様なら
    if( isRegisteredPatientValue ){
      return < ApprovalPages currentAccount={currentAccount} network={network} searchAddress={searchaddressValue} isRegistered={isRegisteredPatientValue}/>;
    }
    //登録されてなければ
    else{
      return < ApprovalPages currentAccount={currentAccount} network={network} searchAddress={searchaddressValue} isRegistered={isRegisteredPatientValue}/>;
    }
  };

  //ページがロードされた時に走る処理
  useEffect(() => {
    checkIfWalletIsRegisterd();
  }, []);

  return (
    <div  className="pages-for-second-pages">
      <p>分散型医療データベース</p>

      {!isRegisteredValue && !verifiedValue && renderNotRegisteredVerifyPasswordContainer()}
      {!isRegisteredValue && verifiedValue && renderNotRegisteredContainer()}
      {isRegisteredValue && !mypagemodeValue && !isNextPageValue && renderRegisteredContainer()}
      {isRegisteredValue && mypagemodeValue && renderRegisteredContainer2()}

      {isRegisteredValue && !mypagemodeValue && isNextPageValue && renderNextPageContainer()}
    
    </div>
  );
};
export default HealthcareWorkersPages;
