// index.js
import React, { useEffect, useState } from "react";
import "./PatientsPages.css";

import { CONTRACT_ADDRESS, ABI, ETHERS } from "./../../constants";
import { useForm } from 'react-hook-form';

const PatientsPages = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [isRegisteredValue, setIsRegisteredValue] = useState("");

  //コントラクトから返ってきた医療データを保存する変数とメソッド
  const [medicaldataValue, setMedicalDataValue] = useState([]);

  //コントラクトから返ってきた時刻を日本表記にして保存する変数とメソッド
  const [lasttimeValue, setLastTimeValue] = useState("");

  //編集フラグを保存する変数とメソッド
  const [editmodeValue, setEditModeValue] = useState("");

  //登録済みの医療データをコントラクトから取得する
  const getRegisterdMedicalData = async ( flag ) => {
    
    //医療データが登録済みなら
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
          //自分の医療データ取得
          const datas = await dmdContract.get_medical_data_by_patient();
          console.log( datas );

          let date = new Date( datas.lasttimestamp * 1000 ).toLocaleString();
          console.log( "date is ", date );
          setLastTimeValue( date );

          setMedicalDataValue( datas );

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
      //医療データが登録済みかどうか確認
      let bool = await dmdContract.check_if_patient_registered();

      //登録済みなら
      if( bool ){
        
        console.log("登録済み");
        
      }
      else{

        console.log("未登録");
        
      }

      //自分の医療データを取得
      getRegisterdMedicalData( bool );
      
      //console.log(medicaldataValue);
      
      setIsRegisteredValue( bool );
      
    } catch (error) {
      console.log(error);
    }

  };

  //コントラクトのNewMedicalDataAboutPatientイベントから送られてきたデータを受け取り、処理する
  useEffect(() => {
    
    let dmdContract;

    //コントラクトからの通知を受け取る
    const onNewMedicalDataAboutPatient = (id, patient, familyname, firstname, furiganafamilyname, furiganafirstname, bloodtype, lasttimestamp) => {
      
      console.log("NewData", id, patient, familyname, firstname, furiganafamilyname, furiganafirstname, bloodtype, lasttimestamp);
      
      //自分の医療データを取得する。tureは医療データが登録済みであることを示す
      getRegisterdMedicalData( true );

      console.log("Mission Completed");
      
      //これをしないとベージの表示が更新されない
      setIsRegisteredValue( true );

    };

    /* NewMedicalDataAboutPatientイベントがコントラクトから発信されたときに、情報を受け取ります */
    if (window.ethereum) {
      const provider = new ETHERS.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      dmdContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      dmdContract.on("NewMedicalDataAboutPatient", onNewMedicalDataAboutPatient);
    }
    /*メモリリークを防ぐために、NewMedicalDataAboutPatientのイベントを解除します*/
    return () => {
      if (dmdContract) {
        dmdContract.off("NewMedicalDataAboutPatient", onNewMedicalDataAboutPatient);
      }
    };
  }, []);

  // 医療データが未登録の場合の登録フォームをレンダリングする関数
  const renderNotRegisteredContainer = () => (
    <div className="patient-form-container">
      <h1>患者様用登録フォーム</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="familyname">お名前　姓  :  </label>
          <input id="patient-name" {...register('familyname', { required: true })} autoComplete="family-name"/>
          <label htmlFor="firstname">名  :  </label>
          <input id="patient-name" {...register('firstname', { required: true })} autoComplete="given-name"/>
        </div>
        {errors.familyname && <div id="color-red">姓は必須の項目です</div>}
        {errors.firstname && <div id="color-red">名は入力が必須の項目です</div>}
        <div>
          <label htmlFor="furiganafamilyname">フリガナ　セイ  :  </label>
          <input id="patient-name" {...register('furiganafamilyname', { required: true })} />
          <label htmlFor="furiganafirstname">メイ  :  </label>
          <input id="patient-name" {...register('furiganafirstname', { required: true })} />
        </div>
        {errors.furiganafamilyname && <div id="color-red">セイは必須の項目です</div>}
        {errors.furiganafirstname && <div id="color-red">メイは入力が必須の項目です</div>}
        <div className="radio-button-field">
      血液型　　
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
        
        <button type="submit" className="cta-button connect-wallet-button" >登録</button>
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
        {errors.bloodtypes && <div id="color-red">血液型は必須の項目です</div>}
      </div>
    )
  };

  const renderBloodType = () => {
    return(
      <p>{medicaldataValue.bloodtype}型</p>
    )
  };

  
  //登録ボタンが押されたときに呼ばれる関数
  const onSubmit = async (data) => {
    
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
      
      //医療データを登録する
      let registerTxn = await dmdContract.register_for_patient_by_patient(
        data.familyname,
        data.firstname,
        data.furiganafamilyname,
        data.furiganafirstname,
        data.bloodtypes
      );
      console.log("Registering...", registerTxn);
      await registerTxn.wait();
      console.log("Registered -- ", registerTxn);
      
    } catch (error) {
      console.log(error);
    }
  };

  //登録ボタンが押されたときに呼ばれる関数
  const onEdit = async () => {
    
    if( !editmodeValue ){
      
      console.log("Clicked onEdit!");
      setEditModeValue( true );
    
    }else{

      console.log("Clicked onEdit!");
      setEditModeValue( false );

    }

  };

  //既に医療データが登録されている場合の表示をレンダリングする関数
  const renderRegisteredContainer = () => (
    <div>
      <h1>基本情報</h1>
      <button className="cta-button connect-wallet-button" onClick={()=>onEdit()} >データを編集する</button>
      <div>
        <table align="center">
          <tbody>
            <tr>
              <th>データ番号</th><th colSpan="2">{String(Number(medicaldataValue.id))}</th>
            </tr>
            <tr>
              <th>アドレス</th><th colSpan="2">{medicaldataValue.patient}</th>
            </tr>
            <tr>
              <th>お名前</th>
              <th>{ !editmodeValue ? medicaldataValue.familyname : <input id="patient-name-edit" {...register('familyname', { required: true })} autoComplete="family-name" value={medicaldataValue.familyname}/>}</th>
              <th>{ !editmodeValue ? medicaldataValue.firstname : <input id="patient-name-edit" {...register('firstname', { required: true })} autoComplete="given-name" value={medicaldataValue.firstname}/>}</th>
            </tr>
            <tr>
              <th>フリガナ</th>
              <th>{ !editmodeValue ? medicaldataValue.furiganafamilyname : <input id="patient-name-edit" {...register('furiganafamilyname', { required: true })} value={medicaldataValue.furiganafamilyname}/>}</th>
              <th>{ !editmodeValue ? medicaldataValue.furiganafirstname : <input id="patient-name-edit" {...register('furiganafirstname', { required: true })} value={medicaldataValue.furiganafirstname}/>}</th>
            </tr>
            <tr>
              <th>血液型</th>
              <th colSpan="2">{ !editmodeValue ? renderBloodType() : renderEditBloodType() }</th>
            </tr>
            <tr>
              <th>最終更新日</th><th colSpan="2">{lasttimeValue}</th>
            </tr>
            {/*<tr>
              <th>最終更新日</th><th colspan="2">{String(new Date(medicaldataValue.lasttimestamp * 1000))}</th>
            </tr>*/}
          </tbody>
        </table>
      </div>
  </div>
  );

  //ページがロードされた時に走る処理
  useEffect(() => {
    checkIfWalletIsRegisterd();
  }, []);

  return (
    <div  className="pages-for-patients">  
      <p>分散型医療データベース</p>
      {!isRegisteredValue && medicaldataValue.length !== 0 ? renderNotRegisteredContainer() : <span></span>}
      {isRegisteredValue && medicaldataValue.length !== 0 ? renderRegisteredContainer() : <span>読み込み中</span>}
    </div>
  );
};
export default PatientsPages;
