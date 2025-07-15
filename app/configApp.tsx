import Slider from '@react-native-community/slider';
import { reloadAppAsync } from "expo";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Switch,
  Text, TouchableHighlight, View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { VolumeManager } from 'react-native-volume-manager';
import {
  iniObj, iniObjPath, initData, pgObj, pgObjPath, pgObjPathOld,
  pgStack, shareFile, shareLog, storeCSVdata, writeFile, writeLog,
} from './comFunc';
import { orgVol, styles, } from './index';

export default function configApp(){ //全体の設定

  const [textOnSpeak, setTextOnSpeak] = useState(iniObj.textOnSpeak)
  const [modalRotae, setModalRotate] = useState(iniObj.modalTextRotate)
  const [changeVol, setChangeVol] = useState(iniObj.changeVol)
  const [useSlide, setuseSlide] = useState(false)
  const [changeScrn, setChangeScrn] = useState(true)
  const [replayScrnHold, setReplayScrnHold] = useState(iniObj.replayScrnHold)
  const { post, from } = useLocalSearchParams();
  const [logLevel, setLogLevel] = useState(iniObj.logLevel)
  const [homeScrn, setHomeScrn] = useState(iniObj.homeScrn)

  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog(20, 'Err: configScrn No post number');
    scnNum = 0;
  };

  writeLog(10, 'configApp:scrNum:' + scnNum)
  const router = useRouter();

  const scrnList = []
  for (let i =0; i < pgObj.length; i++) {
    scrnList.push({key:i, label:i.toString()+':'+pgObj[i].pgTitle, value:i})
  }

  const [sliderValue, setSliderValue] = useState(iniObj.changeVol?iniObj.myVol:orgVol)
  function onSlider(value:number) {
    setSliderValue(value)
    setVol(value)
    iniObj.myVol = value;
  }
  
  async function setVol(vol:number) {
    writeLog(10, 'setVoltoBe:' + vol.toString())
    VolumeManager.setVolume(vol/100 ,{showUI: false})
    const { volume } = await VolumeManager.getVolume();
    writeLog(10, 'setVolResuld:' + (volume*100).toString())
  }

  const pickFile = async (scnNum:number) => { // データの読込み
    writeLog(20, 'pickFIle:')
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: 'text/plain',
    });
    if (result.assets !== null) {
      writeLog(20, 'picFile:');
      if (Platform.OS === 'web' ) { return }
      try {
        const csvBuff = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8, });
        pgStack.splice(0);
        storeCSVdata(csvBuff);
        applyConfiSetting();
      } catch (e) {
        writeLog(40, e);
        writeLog(40, 'pickFile Error:' + result.assets[0].name);
      }
      writeFile();
      setChangeScrn(!changeScrn)
      Alert.alert('定義を読込みました')
    }
  };

  async function readOldFile() {
    writeLog(20, 'readOldFile:')
    if (Platform.OS === 'web' ) { return }
    let tmp = await FileSystem.getInfoAsync(pgObjPathOld);
    if (tmp.exists) {
      try {
        const pgObjTxt = await FileSystem.readAsStringAsync(pgObjPathOld, {
          encoding: FileSystem.EncodingType.UTF8, });
          pgObj.splice(0); 
          pgObj.push({ pgTitle:'', btnList:[], pgOption:'' }) 
          pgStack.splice(0);
          storeCSVdata(pgObjTxt)
          writeLog(20, 'readOldFile:');
          writeFile();
          applyConfiSetting()
          setChangeScrn(!changeScrn)
          Alert.alert('定義を前に戻しました')
        } catch (e) {
        writeLog(20, e);
        writeLog(20, 'Read Old Error:' + pgObjPathOld + '\n');
      }
    } else {
      Alert.alert('情報','前のデータは有りません')
    }
  };
  
  function applyConfiSetting(){
    writeLog(20, 'applyConfig:');
    setTextOnSpeak(iniObj.textOnSpeak);
    setModalRotate(iniObj.modalTextRotate);
    setChangeVol(iniObj.changeVol);
    setSliderValue(iniObj.myVol);
    setReplayScrnHold(iniObj.replayScrnHold);
  }

  const restoreInit = async () => {  // 初期化
    if (Platform.OS === 'web' ) { return }
    writeLog(20, 'restoreInit:');
    if ((await FileSystem.getInfoAsync(pgObjPath)).exists) { await FileSystem.deleteAsync(pgObjPath)} 
    if ((await FileSystem.getInfoAsync(pgObjPathOld)).exists) { await FileSystem.deleteAsync(pgObjPathOld)} 
    if ((await FileSystem.getInfoAsync(iniObjPath)).exists) { await FileSystem.deleteAsync(iniObjPath)} 
    writeLog(10, 'restoreInit:FilesDeleted:');
    initData()  // 空のデータにする
    writeFile()
    applyConfiSetting();
    setChangeScrn(!changeScrn)
    Alert.alert('アプリケーションを初期状態に戻しました')
    reloadAppAsync();
  }

  function pgBack(){
    from === 'free' ? router.dismissTo({pathname:'/freeText', params: {post: scnNum, from:'configApp'}}) 
    : router.dismissTo({pathname:'/', params: {post: scnNum, from:'configApp'}})
  }

  return(
  <SafeAreaProvider>
      <Stack.Screen options={{
        headerTitle: () => (
          <Pressable onLongPress={() => {
            router.push({ pathname: "/helpConfigApp", params: { post: scnNum } })
          }} >
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>全体の設定</Text>
          </View>
          </Pressable>
        ),
        headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
        headerLeft:  () => ( 
          <Pressable onPress={() => pgBack()}>
            <View style={[styles.headerButton, ]}>
              <Text style={{textAlign:'center' }}>＜</Text>
            </View>
          </Pressable> 
        ), 
        headerRight:  () => ( 
          <Pressable onPress={() => router.push({ pathname: "/helpConfigApp", params: { post: scnNum } })}>
            <View style={[styles.headerButton, ]}>
              <Text style={{textAlign:'center', fontSize:12 }}>ヘルプ</Text>
            </View>
          </Pressable>
        ), 
        }} />
    <SafeAreaView>
    <ScrollView>

    <View style={[stylAppConf.container]}>
        <TouchableHighlight  onLongPress={ ()  => { 
          Alert.alert('質問','画面定義ファイルをひとつ前に戻しますか？', [
            { text: 'いいえ', onPress: () => {return}},
            { text: 'はい', onPress: () => { 
              readOldFile()
              reloadAppAsync();
            }}, ])}} >
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/3-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>定義を戻す</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          Alert.alert('質問','アプリケーションを初期に戻しますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => {
              writeLog(20, 'Reset Initial Start:');
            restoreInit();
            // reloadAppAsync();
          }}, ])}} >
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/3-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>初期化する</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          reloadAppAsync();
          }} >
          <View style={[stylAppConf.button, {width: Dimensions.get('window').width/3-9} ]}>
            <Text style={[stylAppConf.text, {color: 'red'}]}>再起動</Text>
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={ () => {
            Alert.alert('質問','データを保存しますか？', [
              { text: 'いいえ', onPress: () => {return
              }},
              { text: '履歴も含めシェア', onPress: () => {
                shareFile(false)
              }}, 
              { text: '基本データのみシェア', onPress: () => { 
                shareFile(true)
              }}, 
              { text: 'ログの保存', onPress: () => { 
                shareLog()
              }}, 
            ])
          }}
          onLongPress={ () => { 
            Alert.alert('質問','ログを保存しますか？', [
              { text: 'いいえ', onPress: () => {return
              }},
              { text: 'ログのシェア', onPress: () => { 
                shareLog()
              }}, 
            ])
           }}
          >
          <View style={[stylAppConf.button]}>
            <Text style={[stylAppConf.text]}>定義を保存/</Text>
            <Text style={[stylAppConf.text]}>シェアする</Text>
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
            <Text style={[stylAppConf.switchText, { textAlign:'center', width:40, borderWidth:0, }]}>➖</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => { setChangeVol(!changeVol) }}>
          <Text style={[stylAppConf.switchText, { textAlign:'center', width: 150, 
            color:changeVol ? 'black' : 'gray'}]}>
            音量 {sliderValue.toFixed(0).toString()} </Text>
          </TouchableHighlight>
          <TouchableHighlight disabled={!changeVol} onPress={ () => { 
            setSliderValue(sliderValue<100?sliderValue + 1:sliderValue)
            if(iniObj.myVol<100){iniObj.myVol++}
            }}>
            <Text style={[stylAppConf.switchText, { textAlign:'center', width:30, borderWidth:0, }]}>➕</Text>
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
          <View>
            <RNPickerSelect 
              onValueChange={(value) => {
                setLogLevel(value);
                iniObj.logLevel = logLevel;
              }}
              items={[
                {label:'無し', value:'99'},
                {label:'全て', value:'0'},
                {label:'詳細', value:'10'},
                {label:'標準', value:'20'},
                {label:'警告', value:'30'},
                {label:'問題', value:'40'},
                {label:'重大', value:'50'}, 
                ]}
              Icon={() => (<Text style={{ position: 'absolute', right: 10, top: 15, fontSize: 18, color: '#789' }}>{Platform.OS === 'ios' ? '▼' : '' }</Text>)}
              style={pickerSelectStyles}
              value={logLevel}
              />
            <Text style={[stylAppConf.pickerText,]}>ログレベル</Text>
          </View>
          <View>
            <RNPickerSelect 
              onValueChange={(value) => {
                setHomeScrn(value);
                iniObj.homeScrn = homeScrn;
              }}
              items={scrnList}
              Icon={() => (<Text style={{ position: 'absolute', right: 10, top: 15, fontSize: 18, color: '#789' }}>{Platform.OS === 'ios' ? '▼' : '' }</Text>)}
              style={pickerSelectStyles}
              value={homeScrn}
              />
            <Text style={[stylAppConf.pickerText,]}>ホーム画面</Text>
          </View>
        </View>
    </View>
    <View style={{height:100}}></View>
    </ScrollView>
    </SafeAreaView>
    <SafeAreaView  style={[styles.containerBottom ]}>
      <TouchableHighlight onPress={ ()  => { pgBack() }} >
        <View style={[stylAppConf.bottomButton,{height: stylAppConf.button.height}]}>
          <Text style={[stylAppConf.text, {fontSize:Dimensions.get('window').width < 1000? 18: 36,}]}>＜</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight onPress={ () => {
        router.push({ pathname: "/configScrn", params: { post: scnNum, from: 'index' } });
        }} >
        <View style={[stylAppConf.bottomButton,{height: stylAppConf.button.height}]}>
          <Text style={[stylAppConf.text]}>{scnNum.toString() + ':' + pgObj[scnNum].pgTitle}</Text>
          <Text style={[stylAppConf.text]}>設定</Text>
        </View>
      </TouchableHighlight>
    </SafeAreaView>
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
      width: Dimensions.get('window').width/2-5,
      height: 80,
      borderRadius: 15,
      borderColor:styles.buttonBottom.borderColor,
      borderWidth:styles.buttonBottom.borderWidth,
      },

  text: {
    fontSize: Dimensions.get('window').width < 1000? 18: 36,
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
    fontSize: Dimensions.get('window').width < 1000? 18: 36,
    paddingTop: 7,
  },
    pickerText:{
    width: Dimensions.get('window').width < 1000? 200:400, 
    textAlign: 'left',
    textAlignVertical: 'center',
    height: 40,
    fontSize: Dimensions.get('window').width < 1000? 18: 36,
    marginTop:Platform.OS === 'ios'?  Dimensions.get('window').width < 1000? -35 : -50 : -48,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: Dimensions.get('window').width < 1000? 20: 36,
    paddingVertical: 12,
    paddingHorizontal: 5,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 150,
    marginLeft: Dimensions.get('window').width < 1000? 200:400,
    marginTop: 5,
    pointerEvents:'none',
  },
  inputAndroid: {
    fontSize: Dimensions.get('window').width < 1000? 16: 36,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 150,
    marginLeft: 180,
    marginTop: 0,
  },
});