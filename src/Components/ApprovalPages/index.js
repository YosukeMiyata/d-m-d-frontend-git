// index.js
import React, { useEffect, useState } from "react";
import "./ApprovalPages.css";

import { CONTRACT_ADDRESS, ABI, ETHERS } from "./../../constants";
import { useForm } from 'react-hook-form';

//import HealthcareWorkersPages from "./../../Components/HealthcareWorkersPages";

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

const ApprovalPages = ({currentAccount, network, searchAddress, isRegistered}) => {

  const { register, handleSubmit, formState: { errors } } = useForm();

  //　登録フラグを保存する変数とメソッド
  const [isRegisteredValue, setIsRegisteredValue] = useState("");

  //　コントラクトから返ってきた基本情報を保存する変数とメソッド
  const [basicinformationValue, setBasicInformationValue] = useState([]);

  //　コントラクトから返ってきた医療データを保存する変数とメソッド
  //const [medicaldataValue, setMedicalDataValue] = useState([]);

  //　コントラクトから返ってきた時刻を日本表記にして保存する変数とメソッド
  const [lasttimeValue, setLastTimeValue] = useState("");

  //　編集フラグを保存する変数とメソッド
  const [editmodeValue, setEditModeValue] = useState("");

  //　閲覧権限の有無を保存する変数とメソッド
  const [isGotAuthorityToAccessValue, setIsGotAuthorityToAccessValue] = useState("");

  //　編集権限の有無を保存する変数とメソッド
  const [isGotAuthorityToEditValue, setIsGotAuthorityToEditValue] = useState("");

  //　閲覧フラグを保存する変数とメソッド
  const [accessmodeValue, setAccessModeValue] = useState("");

  //ローディングフラグを保存する変数とメソッド
  const [isLoadingValue, setIsLoadingValue] = useState("");

  //登録済みの基本情報をコントラクトから取得する
  const getRegisterdBasicInformation = async () => {
    
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

        console.log("get patient's data");
        //患者様の基本情報取得
        const datas = await dmdContract.get_basic_information_by_others( searchAddress );
        console.log( datas );

        let date = new Date( datas.lasttimestamp * 1000 ).toLocaleString();
        console.log( "date is ", date );
        setLastTimeValue( date );

        setBasicInformationValue( datas );

        //　表示を切り替える
        setAccessModeValue( true );

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
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

      //　表示を決める
      setIsRegisteredValue( isRegistered );

      //検索した患者様のデータがすでに登録されていたら
      if(isRegistered){
      
        //  患者様のアドレスに紐づいたデータの通し番号を取得する
        let num = await dmdContract.get_data_index_by_others( searchAddress );

        //  患者様のアドレスに紐づいたデータの閲覧権限の有無を確認
        let boolToAccess = await dmdContract.check_if_healthcare_worker_has_ones_authority_to_access( num );

        //  患者様のアドレスに紐づいたデータの編集権限の有無を確認
        let boolToEdit = await dmdContract.check_if_healthcare_worker_has_ones_authority_to_edit( num );

        if( boolToAccess ){ 
          console.log("閲覧権限あり"); 
          setIsGotAuthorityToAccessValue( "閲覧権限あり" );
        }
        else{  
          //  患者様のアドレスに紐づいたデータの閲覧許可を申請中かどうか確認
          let boolToApplyToAccess = await dmdContract.check_if_healthcare_worker_is_applying_for_ones_authority_to_access( num );
          if( boolToApplyToAccess ){
            console.log("閲覧申請中");
            setIsGotAuthorityToAccessValue( "閲覧申請中" );
          }
          else{
            console.log("閲覧権限なし");
            setIsGotAuthorityToAccessValue( "閲覧権限なし" );
          }
        }

        if( boolToEdit ){ 
          console.log("編集権限あり"); 
          setIsGotAuthorityToEditValue( "編集権限あり" );
        }
        else{ 
          //  患者様のアドレスに紐づいたデータの編集許可を申請中かどうか確認
          let boolToApplyToEdit = await dmdContract.check_if_healthcare_worker_is_applying_for_ones_authority_to_edit( num );
          if( boolToApplyToEdit ){
            console.log("編集申請中");
            setIsGotAuthorityToEditValue( "編集申請中" );
          }
          else{
            console.log("編集権限なし");
            setIsGotAuthorityToEditValue( "編集権限なし" );
          }
        }

      }

      
    } catch (error) {
      console.log(error);
    }

  };

  // 閲覧許可を申請する関数
  const getAuthorityToAccess = async () => {

    setIsLoadingValue( true );
    
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

      //  患者様のアドレスに紐づいたデータの通し番号を取得する
      let num = await dmdContract.get_data_index_by_others( searchAddress );

      //  患者様に閲覧許可の申請をする
      let applyTxn = await dmdContract.apply_for_ones_authority_to_access( num );
      console.log("Applying...", applyTxn);
      await applyTxn.wait();
      console.log("Applied -- ", applyTxn);

      setIsLoadingValue( false );

      setIsGotAuthorityToAccessValue( "閲覧申請中" );
      
    } catch (error) {
      setIsLoadingValue( false );
      console.log(error);
    }

  };

  // 編集許可を申請する関数
  const getAuthorityToEdit = async () => {

    setIsLoadingValue( true );
    
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

      //  患者様のアドレスに紐づいたデータの通し番号を取得する
      let num = await dmdContract.get_data_index_by_others( searchAddress );

      //  患者様に編集許可の申請をする
      let applyTxn = await dmdContract.apply_for_ones_authority_to_edit( num );
      console.log("Applying...", applyTxn);
      await applyTxn.wait();
      console.log("Applied -- ", applyTxn);

      setIsLoadingValue( false );

      setIsGotAuthorityToEditValue( "編集申請中" );
      
    } catch (error) {
      setIsLoadingValue( false );
      console.log(error);
    }

  };

  //コントラクトのNewMedicalDataAboutPatientイベントから送られてきたデータを受け取り、処理する
  useEffect(() => {
    
    let dmdContract;

    //コントラクトからの通知を受け取る
    const onNewBasicInformationAboutPatient = (id, patient, familyname, firstname, furiganafamilyname, furiganafirstname, bloodtype, lasttimestamp) => {
      
      console.log("NewData", id, patient, familyname, firstname, furiganafamilyname, furiganafirstname, bloodtype, lasttimestamp);
      
      //患者様の基本情報を取得する。
      getRegisterdBasicInformation();

      console.log("Mission Completed");
      
      //これをしないとベージの表示が更新されない
      setIsRegisteredValue( true );

    };

    /* NewBasicInformationAboutPatientイベントがコントラクトから発信されたときに、情報を受け取ります */
    if (window.ethereum) {
      const provider = new ETHERS.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      dmdContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      dmdContract.on("NewBasicInformationAboutPatient", onNewBasicInformationAboutPatient);
    }
    /*メモリリークを防ぐために、NewBasicInformationAboutPatientのイベントを解除します*/
    return () => {
      if (dmdContract) {
        dmdContract.off("NewBasicInformationAboutPatient", onNewBasicInformationAboutPatient);
      }
    };
  }, []);

  //閲覧許可を申請するボタンの表示をレンダリングする関数
  const renderNotGotAuthorityToAccessContainer = () => (
    <button onClick={getAuthorityToAccess} className="cta-button2 connect-wallet-button" >
      閲覧許可を申請する
    </button>
  );

  //編集許可を申請するボタンの表示をレンダリングする関数
  const renderNotGotAuthorityToEditContainer = () => (
    <button onClick={getAuthorityToEdit} className="cta-button2 connect-wallet-button" >
      編集許可を申請する
    </button>
  );

  //患者様のデータにアクセスするボタンの表示をレンダリングする関数
  const renderGotAuthorityToAccessContainer = () => (
    <button onClick={getRegisterdBasicInformation} className="cta-button connect-wallet-button" >
      患者様のデータを閲覧する
    </button>
  );

  // 前のページに戻る関数
  const refresh = async () => {
    window.location.reload();
  }
  
  //既に基本情報が登録されている場合の表示をレンダリングする関数
  const renderApprovalContainer = () => (
    <div>
      <button onClick={() => refresh()} className="cta-button3 connect-wallet-button" >
        前のページに戻る
      </button>
      <div className="textcenter textsize20px">
        検索した患者様のアドレス:
      </div>
      <div className="textcenter textsize20px">
        { isGotAuthorityToAccessValue === "閲覧権限あり" ? renderGotAuthorityToAccessContainer() : searchAddress }
      </div>
      { isLoadingValue ? <div className="textcenter"><p>申請しています。少々お待ちください。</p><ColorRing/></div> :
        <div className="display-between">
          {isGotAuthorityToAccessValue === "閲覧権限あり" && <p>閲覧権限あり</p> }
          {isGotAuthorityToAccessValue === "閲覧申請中" && <p>閲覧申請中</p> }
          {isGotAuthorityToAccessValue === "閲覧権限なし" && renderNotGotAuthorityToAccessContainer() }
          {isGotAuthorityToEditValue === "編集権限あり" && <p>編集権限あり</p> }
          {isGotAuthorityToEditValue === "編集申請中" && <p>編集申請中</p> }
          {isGotAuthorityToEditValue === "編集権限なし" && renderNotGotAuthorityToEditContainer() }
        </div>
      }
    </div>
  );

  const renderEditBloodType = () => {
    return (
      <div className="radio-button-field">
        <label className="radio-label" htmlFor="field-type-O">
          <input
              {...register("bloodtypes", { required: true })}
              type="radio"
              value="O"
              id="field-type-O"
          />
          O型
        </label>
        <label className="radio-label" htmlFor="field-type-A">
          <input
              {...register("bloodtypes", { required: true })}
              type="radio"
              value="A"
              id="field-type-A"
          />
          A型
        </label>
        <label className="radio-label" htmlFor="field-type-B">
          <input
              {...register("bloodtypes", { required: true })}
              type="radio"
              value="B"
              id="field-type-B"
          />
          B型
        </label>
        <label className="radio-label" htmlFor="field-type-AB">
          <input
              {...register("bloodtypes", { required: true })}
              type="radio"
              value="AB"
              id="field-type-AB"
          />
          AB型
        </label>
      </div>
    )
  };

  const renderBloodType = () => {
    return(
      <div>{basicinformationValue.bloodtype}型</div>
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

  //登録ボタンが押されたときに呼ばれる関数
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

  //登録ボタンが押されたときに呼ばれる関数
  const onReSubmit = async (data) => {

    setIsLoadingValue( true );

    console.log( data.familyname );
    console.log( data.firstname );
    console.log( data.furiganafamilyname );
    console.log( data.furiganafirstname );
    console.log( data.bloodtypes );

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
      let editTxn = await dmdContract.edit_basic_information_for_patient_by_others(
        searchAddress,
        data.familyname,
        data.firstname,
        data.furiganafamilyname,
        data.furiganafirstname,
        data.bloodtypes
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

  // 前のページに戻る関数
  const goBack = async () => {
    setAccessModeValue( false );
  }

  //既に基本情報が登録されている場合の表示をレンダリングする関数
  const renderRegisteredContainer = () => (
    <div>
      <button onClick={() => goBack()} className="cta-button3 connect-wallet-button" >
        前のページに戻る
      </button>
      <h1>患者様　基本情報</h1>
      <div className="textcenter">
      { isGotAuthorityToEditValue === "編集権限あり" &&  
      ( !editmodeValue ? <button className="cta-button connect-wallet-button" onClick={()=>onEdit()} >データを編集する</button> : <button className="cta-button connect-wallet-button" onClick={()=>onEdit()} >編集をやめる</button> )
      }
      </div>
      <table className="form-table">
          <tbody>
            <tr>
              <th><label htmlFor="familyname">データ番号</label></th>
              <td className="form-table-not-marge" colSpan="2">{String(Number(basicinformationValue.id))}</td>
            </tr>
            <tr>
              <th><label htmlFor="familyname">アドレス</label></th>
              <td className="form-table-not-marge" colSpan="2">{basicinformationValue.patient}</td>
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
              <th>血液型</th>
              <td  colSpan="2" className="form-table-not-marge">
                { !editmodeValue ? renderBloodType() : renderEditBloodType() }
                {errors.bloodtypes && <div id="color-red">血液型は必須の項目です</div>}
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

  // 検索した患者様の基本情報が未登録の場合の登録フォームをレンダリングする関数
  const renderNotRegisteredContainer = () => (
    <div>未登録</div>
  );

  //ページがロードされた時に走る処理
  useEffect(() => {
    checkIfWalletIsRegisterd();
  }, []);

  return (
    <div  className="pages-for-second-pages">

      { isRegisteredValue && !accessmodeValue && renderApprovalContainer()}
      { isRegisteredValue && accessmodeValue && renderRegisteredContainer()}
      { !isRegisteredValue && renderNotRegisteredContainer()}
    
    </div>
  );
};
export default ApprovalPages;
