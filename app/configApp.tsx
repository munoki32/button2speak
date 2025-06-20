import Slider from '@react-native-community/slider';
import { reloadAppAsync } from "expo";
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Switch,
  Text,
  TouchableHighlight, View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VolumeManager } from 'react-native-volume-manager';
import {
  copyToClipboard, freeTextPath, iniObj, iniObjPath, initData, pgObj, pgObjPath, pgObjPathOld,
  pgStack, shareFile, shareLog, storeCSVdata, writeFile, writeLog,
} from './comFunc';
import { orgVol, styles, } from './index';

export default function configApp(){
  
  // const [clearOnRead, setClearOnRead] = useState(iniObj.clearOnRead)   
  // const [addFreeStack, setAddFreeStack] = useState(iniObj.addFreeStack)
  // const [btn3col, setBtn3col] = useState(iniObj.btn3col)
  const [textOnSpeak, setTextOnSpeak] = useState(iniObj.textOnSpeak)
  const [modalRotae, setModalRotate] = useState(iniObj.modalTextRotate)
  const [changeVol, setChangeVol] = useState(iniObj.changeVol)
  const [useSlide, setuseSlide] = useState(false)
  const [changeScrn, setChangeScrn] = useState(true)
  const [replayScrnHold, setReplayScrnHold] = useState(iniObj.replayScrnHold)
  const [removeButtonHistory, setRemoveButtonHistory] = useState(iniObj.removeButtonHistory)
  const [selectedSort, setSelectedSort] = useState(iniObj.defaultSortType)
  const [writeLogFile, setWriteLogFile] = useState(iniObj.writeLogFile)

  const sortList = [ // ソートの選択リスト
                { label: '定義順', value: 'def' },
                { label: '使用順', value: 'dat' },
                { label: '頻度順', value: 'cnt' },
              ]

  const { post, from } = useLocalSearchParams();
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog( 0, 'Err: configScrn No post number');
    scnNum = 0;
  };

  const router = useRouter();

  function onPressConfigText(){
    router.push({ pathname: "/configText", params: { post: scnNum, from: 'configApp' } });
  }

  const [sliderValue, setSliderValue] = useState(iniObj.changeVol?iniObj.myVol:orgVol)
  function onSlider(value:number) {
    setSliderValue(value)
    setVol(value)
    iniObj.myVol = value;
  }
  
  async function setVol(vol:number) {
  //  writeLog( 0, 'new   Vol' + vol.toString());
    writeLog( 0, 'setVoltoBe:' + vol.toString())
    VolumeManager.setVolume(vol/100 ,{showUI: false})
    const { volume } = await VolumeManager.getVolume();
    writeLog( 0, 'setVolResuld:' + (volume*100).toString())
  }
  const readClip = async (scnNum:number) => {
    const csvBuff = await Clipboard.getStringAsync();
    // writeLog( 0, 'readClip:' + csvBuff.substring(0,100));
    pgStack.splice(0);
    storeCSVdata(csvBuff, scnNum);
    applyConfiSetting();
    writeFile();
    setChangeScrn(!changeScrn)
    Alert.alert('定義を読込みました')
  }

  const pickFile = async (scnNum:number) => { // データの読込み
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: 'text/plain',
    });
    if (result.assets !== null) {
      // writeLog( 0, 'pickFile:', result.assets[0]);
      if (Platform.OS === 'web' ) { return }
      try {
        const csvBuff = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8, });
        // writeLog( 0, 'Store PickFile:' + result.assets[0].name + ' ' + result.assets[0].uri);
        pgStack.splice(0);
        storeCSVdata(csvBuff, scnNum);
        // writeLog( 0, 'pickFile:' + csvBuff.substring(0,100));
        applyConfiSetting();
      } catch (e) {
        writeLog( 0, e);
        writeLog( 0, 'pickFile Error:' + result.assets[0].name);
      }
      writeFile();
      setChangeScrn(!changeScrn)
      Alert.alert('定義を読込みました')
    }
  };

  async function readOldFile() {
    if (Platform.OS === 'web' ) { return }
    let tmp = await FileSystem.getInfoAsync(pgObjPathOld);
    if (tmp.exists) {
      try {
        const pgObjTxt = await FileSystem.readAsStringAsync(pgObjPathOld, {
          encoding: FileSystem.EncodingType.UTF8, });
          pgObj.splice(0); 
          pgObj.push({ pgTitle:'', btnList:[], pgOption:'' }) 
          pgStack.splice(0);
          storeCSVdata(pgObjTxt, 0)
          writeLog( 0, 'readOldFile:');
          writeFile();
          applyConfiSetting()
          setChangeScrn(!changeScrn)
          Alert.alert('定義を前に戻しました')
        } catch (e) {
        writeLog( 0, e);
        writeLog( 0, 'Read Old Error:' + pgObjPathOld + '\n');
      }
    } else {
      Alert.alert('情報','前のデータは有りません')
    }
  };
  
  function applyConfiSetting(){
    writeLog( 0, 'applyConfig:');
    // setAddFreeStack(iniObj.addFreeStack);
    // setBtn3col(iniObj.btn3col);
    setTextOnSpeak(iniObj.textOnSpeak);
    setModalRotate(iniObj.modalTextRotate);
    setChangeVol(iniObj.changeVol);
    setSliderValue(iniObj.myVol);
    setReplayScrnHold(iniObj.replayScrnHold);
  }

  const restoreInit = async () => {  // 初期化
    if (Platform.OS === 'web' ) { return }
    writeLog( 0, 'restoreInit:');
    if ((await FileSystem.getInfoAsync(pgObjPath)).exists) { await FileSystem.deleteAsync(pgObjPath)} 
    if ((await FileSystem.getInfoAsync(pgObjPathOld)).exists) { await FileSystem.deleteAsync(pgObjPathOld)} 
    if ((await FileSystem.getInfoAsync(freeTextPath)).exists) { await FileSystem.deleteAsync(freeTextPath)} 
    if ((await FileSystem.getInfoAsync(iniObjPath)).exists) { await FileSystem.deleteAsync(iniObjPath)} 
    // writeLog( 0, 'delFile2:');
    initData()  // 空のデータにする
    writeFile()
    // writeIniObj()
    applyConfiSetting();
    setChangeScrn(!changeScrn)
    Alert.alert('アプリケーションを初期状態に戻しました')
    reloadAppAsync();
  }

  function pgBack(){
    if (iniObj.changeVol) {
      setVol(sliderValue)
    } else {
      setVol(orgVol)
    }
    writeFile();
    router.back();
  }

  return(
  <SafeAreaProvider>
      <Stack.Screen options={{
        title: '全体の設定',
        headerTitleAlign: 'center',
        headerBackTitle: '',
        headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
        headerLeft:  () => ( 
          <Pressable onPressIn={() => pgBack()}>
            <View style={[styles.headerButton, ]}>
              <Text style={{textAlign:'center' }}>＜</Text>
            </View>
          </Pressable> 
        ), 
        headerRight:  () => ( 
          <Pressable onPressIn={() => router.push({ pathname: "/help", params: { post: scnNum } })}>
            <View style={[styles.headerButton, ]}>
              <Text style={{textAlign:'center', fontSize:12 }}>ヘルプ</Text>
            </View>
          </Pressable>
        ), 
        }} />
    <ScrollView>
    <View style={[stylAppConf.container]}>
        <TouchableHighlight  onLongPress={ ()  => { 
          Alert.alert('質問','画面定義ファイルをひとつ前に戻しますか？', [
            { text: 'いいえ', onPress: () => {return}},
            { text: 'はい', onPress: () => { 
              readOldFile()
              reloadAppAsync();
            }}, ])}} >
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/4-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>定義を前に戻す</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          Alert.alert('質問','アプリケーションを初期に戻しますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => {
              writeLog( 0, 'Reset Initial Start:');
            restoreInit();
            // reloadAppAsync();
          }}, ])}} >
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/4-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>初期化する</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          reloadAppAsync();
          }} >
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/4-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>再起動</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ ()  => { 
            router.push({ pathname: "/configPay", params: { post: scnNum, from: 'configApp' } });
          }} 
          onLongPress={ () => {
            router.push({ pathname: "/payWall", params: { post: scnNum, from: 'configApp' } });
          }}>
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/4-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>応援</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {
          Alert.alert('質問','データをコピーしますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: '履歴も含めコピー', onPress: () => {
              iniObj.removeButtonHistory = false;
              copyToClipboard()
            }}, 
            { text: '基本データのみコピー', onPress: () => { 
              iniObj.removeButtonHistory = true;
              copyToClipboard()
            }},  ])
          }} >
          <View style={[stylAppConf.button ]}>
            <Text style={[stylAppConf.text]}>クリップボードへ定義をコピーする</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight  onPress={ ()  => { 
          Alert.alert('質問','定義ファイルをクリップボードから読込みますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => { 
              readClip(scnNum);
              }}, ])
          }} >
          <View style={[stylAppConf.button]}>
            <Text style={[stylAppConf.text]}>クリップボードから定義を読込む</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {
            Alert.alert('質問','データをシェアしますか？', [
              { text: 'いいえ', onPress: () => {return
              }},
              { text: '履歴も含めシェア', onPress: () => {
                iniObj.removeButtonHistory = false;
                shareFile()
              }}, 
              { text: '基本データのみシェア', onPress: () => { 
                iniObj.removeButtonHistory = true;
                shareFile()
              }}, 
              { text: 'ログのシェア', onPress: () => { 
                shareLog()
              }}, 
            ])
          }}
          onLongPress={ () => { 
            Alert.alert('質問','データをシェアしますか？', [
              { text: 'いいえ', onPress: () => {return
              }},
              { text: 'ログのシェア', onPress: () => { 
                shareLog()
              }}, 
            ])
           }}
          >
          <View style={[stylAppConf.button]}>
            <Text style={[stylAppConf.text]}>定義を保存/シェアする</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {
          Alert.alert('質問','定義ファイルをファイルから読込みますか？', [
              { text: 'いいえ', onPress: () => {return} },
              { text: 'はい', onPress: () => { 
                pickFile(scnNum);
                }}, ])
          }} >
          <View style={[stylAppConf.button]}>
            <Text style={[stylAppConf.text]}>定義を読込む</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {
          if (iniObj.changeVol) {
            setVol(sliderValue)
          } else {
            setVol(orgVol)
          }
          router.push({ pathname: "/configScrn", params: { post: scnNum, from: 'index' } });
          }} >
          <View style={[stylAppConf.button, {width:Dimensions.get('window').width, 
            backgroundColor:stylAppConf.bottomButton.backgroundColor}]}>
            <Text style={[stylAppConf.text]}>画面「{scnNum.toString() + ':' + pgObj[scnNum].pgTitle}」の設定へ</Text>
          </View>
        </TouchableHighlight>

        <View style={stylAppConf.switchContainer} >

          <TouchableHighlight onPress={ () => { setTextOnSpeak(!textOnSpeak) }}>
            <Text style={stylAppConf.switchText}>発声時に文字を表示する</Text>
          </TouchableHighlight>
          <Switch style={stylAppConf.switch}
            onValueChange = {()=> {setTextOnSpeak(!textOnSpeak);
              iniObj.textOnSpeak = !textOnSpeak }} 
            value = {textOnSpeak} />

          <TouchableHighlight onPress={ () => { setModalRotate(!modalRotae) }}>
           <Text style={stylAppConf.switchText}>文字を反転表示する</Text>
          </TouchableHighlight>
          <Switch style={stylAppConf.switch}
            onValueChange = {()=> {setModalRotate(!modalRotae);
              iniObj.modalTextRotate = !modalRotae }} 
            value = {modalRotae} />

          <TouchableHighlight onPress={ () => { setReplayScrnHold(!replayScrnHold) }}>
            <Text style={stylAppConf.switchText}>もう一度を閉じない</Text>
          </TouchableHighlight>
          <Switch style={stylAppConf.switch}
            onValueChange = {()=> {setReplayScrnHold(!replayScrnHold);
            iniObj.replayScrnHold = !replayScrnHold }} 
            value = {replayScrnHold} />

          <TouchableHighlight disabled={!changeVol} onPress={ () => {
            setSliderValue(sliderValue>0?sliderValue - 1:sliderValue)
            if(iniObj.myVol>0){iniObj.myVol--}
           }}>
            <Text style={[stylAppConf.switchText, { textAlign:'center', width:80, borderWidth:0, }]}>➖</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => { setChangeVol(!changeVol) }}>
          <Text style={[stylAppConf.switchText, { textAlign:'center', width: 100, 
            color:changeVol ? 'black' : 'gray'}]}>
            音量 {sliderValue.toFixed(0).toString()} </Text>
          </TouchableHighlight>
          <TouchableHighlight disabled={!changeVol} onPress={ () => { 
            setSliderValue(sliderValue<100?sliderValue + 1:sliderValue)
            if(iniObj.myVol<100){iniObj.myVol++}
            }}>
            <Text style={[stylAppConf.switchText, { textAlign:'center', width:80, borderWidth:0, }]}>➕</Text>
          </TouchableHighlight>

          <Switch style={stylAppConf.switch}
            onValueChange = {()=> {
              setChangeVol(!changeVol);
              iniObj.changeVol = !changeVol;
              if (iniObj.changeVol) {
                setVol(sliderValue)
              } else {
                setVol(orgVol)
              }
            }} 
            value = {changeVol} />
          <View style={{flexDirection:'row'}}>
            <Slider
              style={[stylAppConf.switchText, {width:Dimensions.get('window').width - 100}]}
                step={1}
                disabled={!useSlide || !changeVol}
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor="#1fb28a"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#1a9274"
                thumbImage={require('../assets/images/thum.png')} 
                value={sliderValue}
                //  onValueChange={setSliderValue}  //　これが有ると震える現象が起きる、無くても問題ない
                onSlidingComplete={(sliderValue)=>{
                  iniObj.myVol = sliderValue;
                  onSlider(sliderValue)} }
            />
            <Switch style={[stylAppConf.switch, {paddingTop:20}]}
              disabled={!changeVol}
              onValueChange = {()=> {
                setuseSlide(!useSlide);
              }} 
              value = {useSlide} />
          </View>

          <TouchableHighlight onPress={ () => { setWriteLogFile(!writeLogFile) }}>
           <Text style={stylAppConf.switchText}>ログ出力</Text>
          </TouchableHighlight>
          <Switch style={stylAppConf.switch}
            onValueChange = {()=> {setWriteLogFile(!writeLogFile);
              iniObj.writeLogFile = !writeLogFile
              }} 
            value = {writeLogFile} />
        </View>
    </View>
    <View style={{height:100}}></View>
    </ScrollView>
    <TouchableHighlight onPress={ ()  => { pgBack() }} >
         <View style={[stylAppConf.bottomButton,{height: stylAppConf.button.height}]}>
        <Text style={[stylAppConf.text, {fontSize:18}]}>戻る</Text>
      </View>
    </TouchableHighlight>
  </SafeAreaProvider>
  );
}

export const stylAppConf = StyleSheet.create({
  slider: {
    width: 300,
    opacity: 1,
    marginTop: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
//    paddingHorizontal: 5,
    paddingVertical:5, //エリアの上の空白
    width: Dimensions.get('window').width,
//    height: 400,
    backgroundColor:styles.container.backgroundColor,
  },
  button: {
//    alignItems: 'center',
    backgroundColor: '#dcdcdc' ,
    justifyContent: 'center',  //上下位置
    paddingHorizontal: 5, 
//    paddingRight: 70,
    width: Dimensions.get('window').width/2-5,
    height: styles.button.height*0.7,
    borderRadius: 15,
    borderColor:styles.buttonBottom.borderColor,
    borderWidth:styles.button.borderWidth,
  },
  bottomButton: {
      backgroundColor:'#ddff99' ,
      justifyContent: 'center',  //上下位置
      paddingHorizontal: 5, 
      paddingRight:0,
      width: Dimensions.get('window').width,
      height: 80,
      borderRadius: 15,
      borderColor:styles.buttonBottom.borderColor,
      borderWidth:styles.buttonBottom.borderWidth,
      },

  text: {
    fontSize: 18,
    color: styles.text.color,
    textAlign: 'center',
  },
  switchContainer: {
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',       //上下位置
    justifyContent: 'flex-end', //左右位置
    flexDirection:'row',
    width: Dimensions.get('window').width,
    verticalAlign:'middle',
  },
  switch: {
    marginLeft: 10,
    marginRight: 10,
    height: 60,   // スイッチの間隔が変わる
    // paddingTop: Platform.OS === 'ios' ? -40: 0 ,
  },
  switchText:{
    width: Dimensions.get('window').width - 100, 
    textAlign: 'right',
    textAlignVertical: 'center',
    height: 60,
    fontSize: 18,
    paddingTop: 7,
  },
  textInput: {
    width: 100,
    height: 40,
    borderWidth: 0.5,
    paddingLeft: 5,
    fontSize: 18,
    marginTop:10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 5,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 150,
    marginLeft: 200,
    marginTop: 5,
    pointerEvents:'none',
  },
  inputAndroid: {
    fontSize: 18,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 150,
    marginLeft: 180,
    marginTop: 0,
  },
});