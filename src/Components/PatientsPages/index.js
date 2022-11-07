// index.js
import React, { useEffect, useState } from "react";
import "./PatientsPages.css";

import { CONTRACT_ADDRESS, ABI, ETHERS } from "./../../constants";
import { useForm } from 'react-hook-form';

import { ColorRing } from 'react-loader-spinner'
<ColorRing
visible={true}
height="80"
width="80"
ariaLabel="blocks-loading"
wrapperStyle={{}}
wrapperClass="blocks-wrapper"
colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
/>

const PatientsPages = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();
  
  //登録フラグを保存する変数とメソッド
  const [isRegisteredValue, setIsRegisteredValue] = useState("");

  //　コントラクトから返ってきた基本情報を保存する変数とメソッド
  const [basicinformationValue, setBasicInformationValue] = useState([]);

  //コントラクトから返ってきた医療データを保存する変数とメソッド
  //const [medicaldataValue, setMedicalDataValue] = useState([]);

  //コントラクトから返ってきた時刻を日本表記にして保存する変数とメソッド
  const [lasttimeValue, setLastTimeValue] = useState("");

  //編集フラグを保存する変数とメソッド
  const [editmodeValue, setEditModeValue] = useState("");

  // すべての申請者を保存する状態変数を定義 
  const [allApplicantValue, setAllApplicantValue] = useState([]);

  //　閲覧権限の有無などを保存する変数とメソッド
  const [isGotAuthorityToAccessValue, setIsGotAuthorityToAccessValue] = useState([]);

  //　編集権限の有無などを保存する変数とメソッド
  const [isGotAuthorityToEditValue, setIsGotAuthorityToEditValue] = useState([]);

  //ページの読み込み直後のローディングフラグを保存する変数とメソッド
  const [isFirstLoadingValue, setIsFirstLoadingValue] = useState("");
  
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
          const datas = await dmdContract.get_basic_information_by_patient();
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

  let number_of_applicants;

  // ページが読み込まれる毎に呼ばれる関数
  const checkIfWalletIsRegisterd = async () => {
    
    setIsFirstLoadingValue( true );

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
      let bool = await dmdContract.check_if_patient_registered();

      //登録済みなら
      if( bool ){
        
        console.log("登録済み");

        let num = await dmdContract.get_data_index_by_patient();

        let accessList = await dmdContract.get_applying_list_to_access( num );
        console.log( accessList );
        
        let editList = await dmdContract.get_applying_list_to_edit( num );
        console.log( editList );

        if( accessList.length === 0 && editList.length === 0 ){
          
          console.log("申請したことがある人はいません");
        
        }
        else{
        
          let dif = accessList.length - editList.length;
          let baseArray, secondArray;

          if( 0 <= dif ){
            console.log("accessListが基準");
            baseArray = accessList;
            secondArray = editList;
          }
          else{
            console.log("editListが基準");
            baseArray = editList;
            secondArray = accessList;
          }

          for(let i = 0; i < baseArray.length; i++){

            let flag_through = false;
            
            if( 0 < secondArray.length ){
              for( let j = 0; j < secondArray.length; j++){
                if( baseArray[ i ] === secondArray[ j ] ){
                  flag_through = true;
                  break;
                }
              }
            }
            
            /*let authority_to_access = await dmdContract.check_if_healthcare_worker_has_ones_authority_to_access( num );
            let authority_to_edit = await dmdContract.check_if_healthcare_worker_has_ones_authority_to_edit( num );

            let is_applying_for_access = await dmdContract.check_if_healthcare_worker_is_applying_for_ones_authority_to_access( num );
            let is_applying_for_edit = await dmdContract.check_if_healthcare_worker_is_applying_for_ones_authority_to_edit( num );*/

            let state_of_access, state_of_edit; 

            let sahw = await dmdContract.get_basic_information_for_healthcare_worker_by_patients( baseArray[ i ] );
            //accessListが基準
            if( 0 <= dif ){
              
              let authority_to_access = await dmdContract.patient_check_if_healthcare_worker_has_ones_authority_to_access( num, baseArray[ i ] );
              let is_applying_for_access = await dmdContract.patient_check_if_healthcare_worker_is_applying_for_ones_authority_to_access( num, baseArray[ i ] );

              if( is_applying_for_access ){
                state_of_access = "閲覧申請中";
              }else{
                if( authority_to_access ){
                  state_of_access = "閲覧権限あり";
                }else{
                  state_of_access = "閲覧権限なし";
                }
              }
              state_of_edit = "編集権限なし";
              //console.log("閲覧申請状況 ",is_applying_for_access);
              
              if( flag_through ){

                let authority_to_edit = await dmdContract.patient_check_if_healthcare_worker_has_ones_authority_to_edit( num, baseArray[ i ] );
                let is_applying_for_edit = await dmdContract.patient_check_if_healthcare_worker_is_applying_for_ones_authority_to_edit( num, baseArray[ i ] );

                if( is_applying_for_edit ){
                  state_of_edit = "編集申請中";
                }else{
                  if( authority_to_edit ){
                    state_of_edit = "編集権限あり";
                  }else{
                    state_of_edit = "編集権限なし";
                  }
                }

                setAllApplicantValue((prevState) => [
                  ...prevState,
                  {
                    healthcareworker: baseArray[ i ], //　医療従事者様のアドレス
                    familyname: sahw.familyname, // 医療従事者様の苗字
                    firstname: sahw.firstname , // 医療従事者様の名前
                    furiganafamilyname: sahw.furiganafamilyname , // 医療従事者様の苗字(フリガナ)
                    furiganafirstname: sahw.furiganafirstname , // 医療従事者様の名前(フリガナ)
                    workplace: sahw.workplace , // 医療従事者様の勤務先
                    occupation: sahw.occupation, // 医療従事者様の職種（医師、看護師、理学療法士、薬剤師、レントゲン技師など）
                    authoritytoaccess: authority_to_access, //閲覧権限の有無
                    isapplyingforaccess: is_applying_for_access, //閲覧申請の有無
                    authoritytoedit: authority_to_edit, //編集権限の有無
                    isapplyingforedit: is_applying_for_edit, //編集申請の有無
                  },
                ]);
              }
              else{

                setAllApplicantValue((prevState) => [
                  ...prevState,
                  {
                    healthcareworker: baseArray[ i ], //　医療従事者様のアドレス
                    familyname: sahw.familyname, // 医療従事者様の苗字
                    firstname: sahw.firstname , // 医療従事者様の名前
                    furiganafamilyname: sahw.furiganafamilyname , // 医療従事者様の苗字(フリガナ)
                    furiganafirstname: sahw.furiganafirstname , // 医療従事者様の名前(フリガナ)
                    workplace: sahw.workplace , // 医療従事者様の勤務先
                    occupation: sahw.occupation, // 医療従事者様の職種（医師、看護師、理学療法士、薬剤師、レントゲン技師など）
                    authoritytoaccess: authority_to_access, //閲覧権限の有無
                    isapplyingforaccess: is_applying_for_access, //閲覧申請の有無
                  },
                ]);
              
              }
            }
            //editListが基準
            else{

              let authority_to_edit = await dmdContract.patient_check_if_healthcare_worker_has_ones_authority_to_edit( num, baseArray[ i ] );
              let is_applying_for_edit = await dmdContract.patient_check_if_healthcare_worker_is_applying_for_ones_authority_to_edit( num, baseArray[ i ] );

              if( is_applying_for_edit ){
                state_of_edit = "編集申請中";
              }else{
                if( authority_to_edit ){
                  state_of_edit = "編集権限あり";
                }else{
                  state_of_edit = "編集権限なし";
                }
              }
              state_of_access = "閲覧権限なし";

              if( flag_through ){

                let authority_to_access = await dmdContract.patient_check_if_healthcare_worker_has_ones_authority_to_access( num, baseArray[ i ] );
                let is_applying_for_access = await dmdContract.patient_check_if_healthcare_worker_is_applying_for_ones_authority_to_access( num, baseArray[ i ] );

                if( is_applying_for_access ){
                  state_of_access = "閲覧申請中";
                }else{
                  if( authority_to_access ){
                    state_of_access = "閲覧権限あり";
                  }else{
                    state_of_access = "閲覧権限なし";
                  }
                }

                setAllApplicantValue((prevState) => [
                  ...prevState,
                  {
                    healthcareworker: baseArray[ i ], //　医療従事者様のアドレス
                    familyname: sahw.familyname, // 医療従事者様の苗字
                    firstname: sahw.firstname , // 医療従事者様の名前
                    furiganafamilyname: sahw.furiganafamilyname , // 医療従事者様の苗字(フリガナ)
                    furiganafirstname: sahw.furiganafirstname , // 医療従事者様の名前(フリガナ)
                    workplace: sahw.workplace , // 医療従事者様の勤務先
                    occupation: sahw.occupation, // 医療従事者様の職種（医師、看護師、理学療法士、薬剤師、レントゲン技師など）
                    authoritytoaccess: authority_to_access, //閲覧権限の有無
                    isapplyingforaccess: is_applying_for_access, //閲覧申請の有無
                    authoritytoedit: authority_to_edit, //編集権限の有無
                    isapplyingforedit: is_applying_for_edit, //編集申請の有無
                  },
                ]);

              }
              else{

                setAllApplicantValue((prevState) => [
                  ...prevState,
                  {
                    healthcareworker: baseArray[ i ], //　医療従事者様のアドレス
                    familyname: sahw.familyname, // 医療従事者様の苗字
                    firstname: sahw.firstname , // 医療従事者様の名前
                    furiganafamilyname: sahw.furiganafamilyname , // 医療従事者様の苗字(フリガナ)
                    furiganafirstname: sahw.furiganafirstname , // 医療従事者様の名前(フリガナ)
                    workplace: sahw.workplace , // 医療従事者様の勤務先
                    occupation: sahw.occupation, // 医療従事者様の職種（医師、看護師、理学療法士、薬剤師、レントゲン技師など）
                    authoritytoedit: authority_to_edit, //編集権限の有無
                    isapplyingforedit: is_applying_for_edit, //編集申請の有無
                  },
                ]);
              
              }
            }
            
            setIsGotAuthorityToAccessValue((prevState) => [
              ...prevState,
              {
                stateofaccess: state_of_access
              },
            ]);
            setIsGotAuthorityToEditValue((prevState) => [
              ...prevState,
              {
                stateofedit: state_of_edit
              },
            ]);
            
            console.log(isGotAuthorityToAccessValue[i]);
            console.log(isGotAuthorityToEditValue[i]);
          }

          console.log("申請者",allApplicantValue);

          number_of_applicants = baseArray.length;
          console.log("申請者数",number_of_applicants);

        }
        
      }
      else{

        console.log("未登録");
        
      }

      //自分の基本情報を取得
      getRegisterdBasicInformation( bool );

      setIsFirstLoadingValue( false );
      
      //console.log(basicinformationValue);
      
      setIsRegisteredValue( bool );
      
    } catch (error) {
      setIsFirstLoadingValue( false );
      console.log(error);
    }

  };

  //コントラクトのNewMedicalDataAboutPatientイベントから送られてきたデータを受け取り、処理する
  useEffect(() => {
    
    let dmdContract;

    //コントラクトからの通知を受け取る
    const onNewBasicInformationAboutPatient = (id, patient, familyname, firstname, furiganafamilyname, furiganafirstname, bloodtype, lasttimestamp) => {
      
      console.log("NewData", id, patient, familyname, firstname, furiganafamilyname, furiganafirstname, bloodtype, lasttimestamp);
      
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
      
      dmdContract.on("NewBasicInformationAboutPatient", onNewBasicInformationAboutPatient);
    }
    /*メモリリークを防ぐために、NewBasicInformationAboutPatientのイベントを解除します*/
    return () => {
      if (dmdContract) {
        dmdContract.off("NewBasicInformationAboutPatient", onNewBasicInformationAboutPatient);
      }
    };
  }, []);

  // 基本情報が未登録の場合の登録フォームをレンダリングする関数
  const renderNotRegisteredBaseContainer = () => {

    if( isFirstLoadingValue ){
      return(
        <div className="textcenter"><ColorRing/></div>
      );
    }else{
      return(
        renderNotRegisteredContainer()
      );
    }
  };

  // 基本情報が未登録の場合の登録フォームをレンダリングする関数
  const renderNotRegisteredContainer = () => (
    <div className="form-container">
      <h1>患者様用　登録フォーム</h1>
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
              <th>血液型</th>
              <td  colSpan="2" className="form-table-not-marge">
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
                {errors.bloodtypes && <div id="color-red">血液型は必須の項目です</div>}
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
  const onSubmit = async (data) => {

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

      console.log("register medical data");
      
      //基本情報を登録する
      let registerTxn = await dmdContract.register_basic_information_for_patient_by_patient(
        data.familyname,
        data.firstname,
        data.furiganafamilyname,
        data.furiganafirstname,
        data.bloodtypes
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
      let editTxn = await dmdContract.edit_basic_information_for_patient_by_patient(
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

  // 閲覧権限を付与する関数
  const giveAuthorityToAccess = async ( ind, wallet ) => {

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

      //  患者様のアドレスに紐づいたデータの通し番号をご本人が取得する
      let num = await dmdContract.get_data_index_by_patient();

      //  医療従事者様に閲覧権限を与える
      let giveTxn = await dmdContract.give_healthcare_worker_authority_to_access( num, wallet );
      console.log("Giving...", giveTxn);
      await giveTxn.wait();
      console.log("Gave -- ", giveTxn);

      //setIsGotAuthorityToAccessValue( "閲覧権限あり" );
      setIsGotAuthorityToAccessValue( (oldStates) => {
          return oldStates.map((oldState, id) => {
            if (id === ind) {
              return { ...oldState, stateofaccess: "閲覧権限あり" };
            }
            return oldState;
          });
        }
      );
      
    } catch (error) {
      console.log(error);
    }

    setIsLoadingValue( false );

  };

  // 閲覧権限を奪う関数
  const usurpAuthorityToAccess = async ( ind, wallet ) => {

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

      //  患者様のアドレスに紐づいたデータの通し番号をご本人が取得する
      let num = await dmdContract.get_data_index_by_patient();

      //  医療従事者様から閲覧権限を奪う
      let usurpTxn = await dmdContract.usurp_healthcare_worker_ones_authority_to_access( num, wallet );
      console.log("Usurping...", usurpTxn);
      await usurpTxn.wait();
      console.log("Usurped -- ", usurpTxn);

      //setIsGotAuthorityToAccessValue( "閲覧権限なし" );
      setIsGotAuthorityToAccessValue( (oldStates) => {
          return oldStates.map((oldState, id) => {
            if (id === ind) {
              return { ...oldState, stateofaccess: "閲覧権限なし" };
            }
            return oldState;
          });
        }
      );
      
    } catch (error) {
      console.log(error);
    }

    setIsLoadingValue( false );

  };

  // 編集権限を付与する関数
  const giveAuthorityToEdit = async ( ind, wallet ) => {

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

      //  患者様のアドレスに紐づいたデータの通し番号をご本人が取得する
      let num = await dmdContract.get_data_index_by_patient();

      //  医療従事者様に編集権限を与える
      let giveTxn = await dmdContract.give_healthcare_worker_authority_to_edit( num, wallet );
      console.log("Giving...", giveTxn);
      await giveTxn.wait();
      console.log("Gave -- ", giveTxn);

      //setIsGotAuthorityToEditValue( "編集権限あり" );
      setIsGotAuthorityToEditValue( (oldStates) => {
          return oldStates.map((oldState, id) => {
            if (id === ind) {
              return { ...oldState, stateofedit: "編集権限あり" };
            }
            return oldState;
          });
        }
      );
      
    } catch (error) {
      console.log(error);
    }

    setIsLoadingValue( false );

  };

  // 編集権限を奪う関数
  const usurpAuthorityToEdit = async ( ind, wallet ) => {

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

      //  患者様のアドレスに紐づいたデータの通し番号をご本人が取得する
      let num = await dmdContract.get_data_index_by_patient();

      //  医療従事者様から編集権限を奪う
      let usurpTxn = await dmdContract.usurp_healthcare_worker_ones_authority_to_edit( num, wallet );
      console.log("Usurping...", usurpTxn);
      await usurpTxn.wait();
      console.log("Usurped -- ", usurpTxn);

      //setIsGotAuthorityToEditValue( "編集権限なし" );
      setIsGotAuthorityToEditValue( (oldStates) => {
          return oldStates.map((oldState, id) => {
            if (id === ind) {
              return { ...oldState, stateofedit: "編集権限なし" };
            }
            return oldState;
          });
        }
      );
      
    } catch (error) {
      console.log(error);
    }

    setIsLoadingValue( false );

  };

  //閲覧許可を申請するボタンの表示をレンダリングする関数
  const renderGiveAuthorityToAccessContainer = ( _index, wallet ) => {
    //console.log("ウォレット  ",wallet);
    //setWalletValue( wallet );
    return(
    <button onClick={() => giveAuthorityToAccess( _index, wallet )} className="cta-button3 connect-wallet-button" >
      閲覧を許可
    </button>
    )
};

  //閲覧許可を申請するボタンの表示をレンダリングする関数
  const renderUsurpAuthorityToAccessContainer = ( _index, wallet ) => (
    <button onClick={() => usurpAuthorityToAccess( _index, wallet )} className="cta-button3 connect-wallet-button2" >
      閲覧を停止
    </button>
  );

  //編集許可を申請するボタンの表示をレンダリングする関数
  const renderGiveAuthorityToEditContainer = ( _index, wallet ) => (
    <button onClick={() => giveAuthorityToEdit( _index, wallet )} className="cta-button3 connect-wallet-button" >
      編集を許可
    </button>
  );

  //編集許可を申請するボタンの表示をレンダリングする関数
  const renderUsurpAuthorityToEditContainer = ( _index, wallet ) => (
    <button onClick={() => usurpAuthorityToEdit( _index, wallet )} className="cta-button3 connect-wallet-button2" >
      編集を停止
    </button>
  );

  // 前のページに戻る関数
  /*const goBack = async () => {
    window.location.reload();
    return < App />;
  }*/

  //既に基本情報が登録されている場合の表示をレンダリングする関数
  const renderRegisteredContainer = () => (
    <div>
      {/*<button onClick={() => goBack()} className="cta-button3 connect-wallet-button" >
        前のページに戻る
      </button>*/}
      <h1>患者様　基本情報</h1>
      <div className="textcenter">
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
      あなたの許可を待っている申請者一覧
      {allApplicantValue
            .slice(0)
            //.reverse()
            .map((applicant, index) => {
              return (
                <div
                  key={index}
                  className="display-between applicant-area"
                >
                  <div style={{
                    hight: "45px", width:"45px",
                  }}>
                    <img hight="45px" width="45px" src="https://bafybeic4f5glfmmyqzxbrfoodr7lfxwzj355exgqpkkc3w5dxye6gicwjm.ipfs.w3s.link/art-hauntington-jzY0KRJopEI-unsplash.jpg"/>
                    {/*<img hight="45px" width="45px" src="https://bafybeifl4s25twa5ecjfr7osyn5zoruxfxi2cvmfvvw53k2ap7z7xneali.ipfs.w3s.link/joseph-gonzalez-iFgRcqHznqg-unsplash.jpg"/>*/}
                  </div>
                  <div>{applicant.familyname}{applicant.firstname}</div>
                  <div>{applicant.workplace}</div>
                  <div>{applicant.occupation}</div>
                  { isLoadingValue && <ColorRing/> }
                  {isGotAuthorityToAccessValue[index].stateofaccess === "閲覧権限あり" && !isLoadingValue && renderUsurpAuthorityToAccessContainer(index, applicant.healthcareworker) }
                  {isGotAuthorityToAccessValue[index].stateofaccess === "閲覧申請中" && !isLoadingValue && renderGiveAuthorityToAccessContainer(index, applicant.healthcareworker) }
                  {isGotAuthorityToAccessValue[index].stateofaccess === "閲覧権限なし" && !isLoadingValue && <div>閲覧権限なし</div> }
                  {isGotAuthorityToEditValue[index].stateofedit === "編集権限あり" && !isLoadingValue && renderUsurpAuthorityToEditContainer(index, applicant.healthcareworker) }
                  {isGotAuthorityToEditValue[index].stateofedit === "編集申請中" && !isLoadingValue && renderGiveAuthorityToEditContainer(index, applicant.healthcareworker) }
                  {isGotAuthorityToEditValue[index].stateofedit === "編集権限なし" && !isLoadingValue && <div>編集権限なし</div> }
                </div>
              );
            })}

    </div>
  );

  //ページがロードされた時に走る処理
  useEffect(() => {
    checkIfWalletIsRegisterd();
  }, []);

  return (
    <div  className="pages-for-second-pages"> 
      <p>分散型医療データベース</p>
      {!isRegisteredValue && renderNotRegisteredBaseContainer() }
      {isRegisteredValue && renderRegisteredContainer()}
    </div>
  );
};
export default PatientsPages;
