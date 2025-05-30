import React from 'react';
import { useState } from 'react';
import { Switch, Pressable, Dimensions, StyleSheet, Platform, ScrollView, 
   Text, TouchableHighlight, View, Alert,  } from 'react-native';
import { reloadAppAsync } from "expo";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams, useFocusEffect   } from 'expo-router';
import  { makeLink, pgObj, pgObjPath, pgObjPathOld, freeTextPath, writeFile, shareFile,
  copyToClipboard, initData, removeDup, iniObj, storeCSVdata, iniObjPath, freeTextScn,
  pgStack} from './comFunc';
import { freeText } from './comFunc';
import Slider from '@react-native-community/slider';
import { VolumeManager } from 'react-native-volume-manager';
import { orgVol, styles, } from './index';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import RNPickerSelect from 'react-native-picker-select';

export default function configScrn(){
  
  // const [clearOnRead, setClearOnRead] = useState(iniObj.clearOnRead)   
  // const [addFreeStack, setAddFreeStack] = useState(iniObj.addFreeStack)
  // const [btn3col, setBtn3col] = useState(iniObj.btn3col)
  const [freeTextClear, setfreeTextClear] = useState(iniObj.freeTextClear)
  const [textOnSpeak, setTextOnSpeak] = useState(iniObj.textOnSpeak)
  const [modalRotae, setModalRotate] = useState(iniObj.modalTextRotate)
  const [changeVol, setChangeVol] = useState(iniObj.changeVol)
  const [changeScrn, setChangeScrn] = useState(true)
  const [replayScrnHold, setReplayScrnHold] = useState(iniObj.replayScrnHold)
  const [removeButtonHistory, setRemoveButtonHistory] = useState(iniObj.removeButtonHistory)
  const [selectedSort, setSelectedSort] = useState(iniObj.defaultSortType)

  const sortList = [ // ソートの選択リスト
                { label: '未設定', value: 'non' },
                { label: '定義順', value: 'def' },
                { label: '使用順', value: 'dat' },
                { label: '頻度順', value: 'cnt' },
              ]

  const { post, from } = useLocalSearchParams();
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    console.log('Err: configScrn No post number');
    scnNum = 0;
  };
  // 現在の頁のソート指定を読込む
  let pgSort = 'non';
  // console.log('pgOption:' + pgObj[scnNum].pgOption);
  let matchText = pgObj[scnNum].pgOption.match(/(^|^.*)(sort:)(...)($| .*$)/)
  if (matchText !== null && matchText[3] !== ''){
    pgSort=matchText[3]
  } ;
  // console.log('pgSort:' + pgSort);
  const [pageSort, setPageSort] = useState(pgSort)
  // console.log('pgsort:' + pgSort + ' ' + pageSort );
  const router = useRouter();

  function onPressConfigText(){
    router.push({ pathname: "/configText", params: { post: scnNum, from: 'configScrn' } });
  }

  function addFreeText(){
    if (pgObj[scnNum].pgTitle !== 'フリー') { return }
    if (freeText[0].key === undefined) {
      freeText.splice(0);
      // writeFreeText();
      Alert.alert('情報','旧フリーテキストが読めませんでした');
      return;
    }
    for (let i = 0; i < freeText.length; i++){
      if (freeText[i].value === '') {continue;}
      let lastSeq = Math.max(...pgObj[scnNum].btnList.map(item => item.defSeq), 0) + 1
      pgObj[scnNum].btnList.push({moji: freeText[i].value, speak:'', 
        tugi:'', option:' ', defSeq:lastSeq, usedDt:999-lastSeq, numUsed:999-lastSeq});
      console.log('addFreeText:' + freeText[i].value + ' ' + lastSeq);
      removeDup(scnNum);
    }
    Alert.alert('情報','フリーテキストを'+scnNum.toString()+':'+pgObj[scnNum].pgTitle +'に取り込みました');
    writeFile();
  }

  const [sliderValue, setSliderValue] = useState(iniObj.myVol)
  function onSlider(sValue:number) {
    setSliderValue(sValue)
//    console.log('slider changed:' + sValue.toString());
    VolumeManager.setVolume(sValue/100, {
      type: 'music', // default: "music" (Android only)
      showUI: false, // default: false (suppress native UI volume toast for iOS & Android)
      playSound: true, // default: false (Android only)
    })
    iniObj.myVol = sValue;
  }

  const readClip = async (scnNum:number) => {
    const csvBuff = await Clipboard.getStringAsync();
    // console.log('readClip:' + csvBuff.substring(0,100));
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
      // console.log('pickFile:', result.assets[0]);
      if (Platform.OS === 'web' ) { return }
      try {
        const csvBuff = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8, });
        // console.log('Store PickFile:' + result.assets[0].name + ' ' + result.assets[0].uri);
        pgStack.splice(0);
        storeCSVdata(csvBuff, scnNum);
        // console.log('pickFile:' + csvBuff.substring(0,100));
        applyConfiSetting();
      } catch (e) {
        console.log(e);
        console.log('pickFile Error:' + result.assets[0].name);
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
          console.log('readOldFile:');
          writeFile();
          applyConfiSetting()
          setChangeScrn(!changeScrn)
          Alert.alert('定義を前に戻しました')
        } catch (e) {
        console.log(e);
        console.log('Read Old Error:' + pgObjPathOld + '\n');
      }
    } else {
      Alert.alert('情報','前のデータは有りません')
    }
  };
  
  function applyConfiSetting(){
    // console.log('applyConfig:');
    setfreeTextClear(iniObj.freeTextClear);
    // setAddFreeStack(iniObj.addFreeStack);
    // setBtn3col(iniObj.btn3col);
    setTextOnSpeak(iniObj.textOnSpeak);
    setModalRotate(iniObj.modalTextRotate);
    setChangeVol(iniObj.changeVol);
    setSliderValue(iniObj.myVol);
    setReplayScrnHold(iniObj.replayScrnHold);
  }

  const restoreInit = async () => {
    if (Platform.OS === 'web' ) { return }
    // console.log('delFile1:');
    if ((await FileSystem.getInfoAsync(pgObjPath)).exists) { await FileSystem.deleteAsync(pgObjPath)} 
    if ((await FileSystem.getInfoAsync(pgObjPathOld)).exists) { await FileSystem.deleteAsync(pgObjPathOld)} 
    if ((await FileSystem.getInfoAsync(freeTextPath)).exists) { await FileSystem.deleteAsync(freeTextPath)} 
    if ((await FileSystem.getInfoAsync(iniObjPath)).exists) { await FileSystem.deleteAsync(iniObjPath)} 
    // console.log('delFile2:');
    initData()
    writeFile()
    // writeIniObj()
    applyConfiSetting();
    setChangeScrn(!changeScrn)
    Alert.alert('アプリケーションを初期状態に戻しました')
  }

  function pgBack(){
    // writeFile();
    router.back();
  }

  function delScn(scn:number){
    console.log('delScn:' + scn);
    pgObj.splice(scn, 1);
    writeFile();
    reloadAppAsync();
  }

  return(
  <SafeAreaProvider>
      <Stack.Screen options={{
        title: '設定メニュー',
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
    <View style={[stylesConfig.container]}>
        <TouchableHighlight  onLongPress={ ()  => { 
          Alert.alert('質問','画面定義ファイルをひとつ前に戻しますか？', [
            { text: 'いいえ', onPress: () => {return}},
            { text: 'はい', onPress: () => { 
              readOldFile()
              reloadAppAsync();
            }}, ])}} >
          <View style={[stylesConfig.button, {width: Dimensions.get('window').width/3-7} ]}>
            <Text style={[stylesConfig.text, {color: 'red'}]}>定義を前に戻す</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          Alert.alert('質問','アプリケーションを初期に戻しますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => {
            restoreInit();
            reloadAppAsync();
          }}, ])}} >
          <View style={[stylesConfig.button, {width: Dimensions.get('window').width/3-7} ]}>
            <Text style={[stylesConfig.text, {color: 'red'}]}>初期化する</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          reloadAppAsync();
          }} >
          <View style={[stylesConfig.button, {width: Dimensions.get('window').width/3-7} ]}>
            <Text style={[stylesConfig.text, {color: 'red'}]}>再起動</Text>
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
          <View style={[stylesConfig.button ]}>
            <Text style={[stylesConfig.text]}>クリップボードへ定義をコピーする</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight  onPress={ ()  => { 
          Alert.alert('質問','定義ファイルをクリップボードから読込みますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => { 
              readClip(scnNum);
              }}, ])
          }} >
          <View style={[stylesConfig.button]}>
            <Text style={[stylesConfig.text]}>クリップボードから定義を読込む</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {
            Alert.alert('質問','データをシェアしますか？', [
              { text: 'いいえ', onPress: () => {return} },
              { text: '履歴も含めシェア', onPress: () => {
                iniObj.removeButtonHistory = false;
                shareFile()
              }}, 
              { text: '基本データのみシェア', onPress: () => { 
                iniObj.removeButtonHistory = true;
                shareFile()
              }}, 
            ])
          }} >
          <View style={[stylesConfig.button]}>
            <Text style={[stylesConfig.text]}>定義を保存/シェアする</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {
          Alert.alert('質問','定義ファイルをファイルから読込みますか？', [
              { text: 'いいえ', onPress: () => {return} },
              { text: 'はい', onPress: () => { 
                pickFile(scnNum);
                }}, ])
          }} >
          <View style={[stylesConfig.button]}>
            <Text style={[stylesConfig.text]}>定義を読込む</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onLongPress={ ()  => { 
          Alert.alert('質問','「' + scnNum.toString() + ':' + pgObj[scnNum].pgTitle + '」画面を削除しますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => { 
              delScn(scnNum);
              }}, ])
          }} >
          <View style={[stylesConfig.button,  {width: Dimensions.get('window').width/3-7} ]}>
            <Text style={[stylesConfig.text, {color: 'red'}]}>画面を削除する</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ ()  => { 
          Alert.alert('質問','「' + scnNum.toString() + ':' + pgObj[scnNum].pgTitle + '」の使用回数をリセットしますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => { 
              pgObj[scnNum].btnList.map((a) => a.numUsed = 0);
              }}, ])
          }} >
          <View style={[stylesConfig.button,   {width: Dimensions.get('window').width/3-7} ]}>
            <Text style={[stylesConfig.text,]}>使用回数をリセット</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ ()  => { 
          scnNum !== freeTextScn ?
          Alert.alert('質問','「' + scnNum.toString() + ':' + pgObj[scnNum].pgTitle + '」にどこからもリンクされていない画面を登録しますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => { 
              makeLink(scnNum)
            }}, ])
            :
          Alert.alert('質問','旧フリーテキストを取込みますか？', [
            { text: 'いいえ', onPress: () => {return} },
            { text: 'はい', onPress: () => { 
            addFreeText()
            }}, ])
          }} >
          <View style={[stylesConfig.button,  {width: Dimensions.get('window').width/3-7} ]}>
            <Text style={[stylesConfig.text,]}>{scnNum !== freeTextScn ?'非リンク画面登録':'旧フリーの取込' }</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={ () => {onPressConfigText()}} >
          <View style={[stylesConfig.button,{width: stylesConfig.bottomButton.width}]}>
            <Text style={stylesConfig.text}>「{scnNum.toString() + ':' + pgObj[scnNum].pgTitle}」画面を編集する</Text>
          </View>
        </TouchableHighlight>
        <View style={stylesConfig.switchContainer} >
          <Text style={stylesConfig.switchText}>フリーテキストは発声後クリア</Text>
          <Switch style={stylesConfig.switch}
            onValueChange = {()=> {setfreeTextClear(!freeTextClear);
              iniObj.freeTextClear = !freeTextClear; }} 
            value = {freeTextClear} />
          <Text style={stylesConfig.switchText}>発声時に文字を表示する</Text>
          <Switch style={stylesConfig.switch}
            onValueChange = {()=> {setTextOnSpeak(!textOnSpeak);
              iniObj.textOnSpeak = !textOnSpeak }} 
            value = {textOnSpeak} />
          <Text style={stylesConfig.switchText}>文字を反転表示する</Text>
          <Switch style={stylesConfig.switch}
            onValueChange = {()=> {setModalRotate(!modalRotae);
              iniObj.modalTextRotate = !modalRotae }} 
            value = {modalRotae} />
          <Text style={stylesConfig.switchText}>もう一度を閉じない</Text>
          <Switch style={stylesConfig.switch}
            onValueChange = {()=> {setReplayScrnHold(!replayScrnHold);
            iniObj.replayScrnHold = !replayScrnHold }} 
            value = {replayScrnHold} />
          <Text style={[{ width:Dimensions.get('window').width-300, textAlign:'right',
            marginTop: 15, color:iniObj.changeVol ? 'black' : 'gray'}]}>
            音量 {sliderValue.toFixed(0).toString()} </Text>
          <Slider
            style={{ marginTop: -30, width:200, height:40}}
              step={1}
              disabled={!iniObj.changeVol}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor="#1fb28a"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#1a9274"
              thumbImage={require('../assets/images/thum.png')} 
              value={sliderValue}
              //  onValueChange={setSliderValue}  //　これが有ると震える現象が起きる、無くても問題ない
              onSlidingComplete={(sliderValue)=>onSlider(sliderValue) }
            />
          <Switch style={stylesConfig.switch}
            onValueChange = {()=> {
              setChangeVol(!changeVol);
              iniObj.changeVol = !changeVol;
              if (iniObj.changeVol) {
                VolumeManager.setVolume(sliderValue/100)
              } else {
                VolumeManager.setVolume(orgVol/100)
              }
            }} 
            value = {changeVol} />
          <View>
            <View style={{borderWidth:0}}>
              <RNPickerSelect 
                onValueChange={(value) => {
                  setPageSort(value);
                  pgSort = value;
                  // if (value === 'def') return;
                  let matchText = pgObj[scnNum].pgOption.match(/(^.*)(sort:)(...)($| .*$)/)
                  if (matchText !== null && matchText[2] !== '') {
                    if (value !== 'non') {
                      pgObj[scnNum].pgOption = matchText[1] + 'sort:' + value + matchText[4]; // change sort: option
                    } else {
                      pgObj[scnNum].pgOption = matchText[1] + matchText[4]; // remove sort: option
                    }
                  } else {
                    if (value !== 'non') { pgObj[scnNum].pgOption += ' sort:' + value; } // add sort:option
                  }
                }}
                items={sortList}
                Icon={() => (<Text style={{ position: 'absolute', right: 10, top: 15, fontSize: 18, color: '#789' }}>{Platform.OS === 'ios' ? '▼' : '' }</Text>)}
                style={pickerSelectStyles}
                placeholder={{ label:'この画面の表示順', value: pageSort }}
                value={pageSort}
                />
              <Text style={{width:200, fontSize:16, textAlign:'left',
                marginTop:Platform.OS === 'ios'? -30: -38 }}>この画面の表示順{Platform.OS === 'ios' ? 
                '('+sortList[sortList.findIndex(text => text.value === pageSort)].label+')' :''}</Text>
            </View>
            <View style={{borderWidth:0}}>
              <RNPickerSelect 
                onValueChange={(value) => {
                  setSelectedSort(value);
                  iniObj.defaultSortType = value;
                  // if (value === 'non') {iniObj.defaultSortType = 'def'};
                }}
                items={sortList}
                Icon={() => (<Text style={{ position: 'absolute', right: 10, top: 15, fontSize: 18, color: '#789' }}>{Platform.OS === 'ios' ? '▼' : '' }</Text>)}
                style={pickerSelectStyles}
                placeholder={{ label:'全体の基本の表示順', value: iniObj.defaultSortType }}
                value={iniObj.defaultSortType}
              />
              <Text style={{width:200, fontSize:16, textAlign:'left',
                marginTop:Platform.OS === 'ios'? -30: -38 }}>全体の基本表示順{Platform.OS === 'ios' ? 
                '('+sortList[sortList.findIndex(text => text.value === iniObj.defaultSortType)].label+')':''}</Text>
            </View>
          </View>
      </View>
    </View>
    <View style={{height:100}}></View>
    </ScrollView>
    <TouchableHighlight onPress={ ()  => { pgBack() }} >
         <View style={[stylesConfig.bottomButton,{height: stylesConfig.button.height}]}>
        <Text style={[stylesConfig.text, {fontSize:18}]}>戻る</Text>
      </View>
    </TouchableHighlight>
  </SafeAreaProvider>
  );
}

export const stylesConfig = StyleSheet.create({
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
//    fontSize: 16,
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
  },
  switch: {
    marginLeft: 10,
    marginRight: 10,
    height: 40,   // スイッチの間隔が変わる
  },
  switchText:{
    width: Dimensions.get('window').width - 100, 
    textAlign: 'right'
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 20,
    paddingVertical: 12,
    paddingHorizontal: 5,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 150,
    marginLeft: 200,
    marginTop: 5,
    pointerEvents:'none',
  },
  inputAndroid: {
    fontSize: 16,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 150,
    marginLeft: 180,
    marginTop: 0,
  },
});