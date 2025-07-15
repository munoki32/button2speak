import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GestureRecognizer from 'react-native-swipe-gestures';
import { iniObj, pgObj, removeDup, writeFile, writeLog } from './comFunc';
import { styles } from './index';

export let tempObj = { pgTitle:'', btnList:[{moji:'', speak:'', tugi:'', option:'', defSeq:'' }], pgOption:''} ;

export default function configText(){
  const router = useRouter();
  const { post } = useLocalSearchParams();
  const [offSet, setOffSet] =useState(0);  // edit from offset (ex 0, 6, 12, 18, ...)  numInput = 6
  const [modalVisible, setModalVisible] = useState(false);

  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog(20, 'Err: configText No post number');
    scnNum = 0;
  };
  const numInput = 6;
// writeLog(10, '5: configText flat');
//  init tempObj & copy form pgObj
  tempObj.pgTitle = pgObj[scnNum].pgTitle
  tempObj.pgOption = pgObj[scnNum].pgOption
  tempObj.btnList.splice(0)
  pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1); //編集時は定義順で表示
  let numConf = ( Math.trunc(( pgObj[scnNum].btnList.length - 1 )/ numInput)  + 1 ) * numInput
  for( let i = 0; i < numConf ; i++) {
    if(pgObj[scnNum].btnList[i] !== undefined) {
      tempObj.btnList.push({
        moji:pgObj[scnNum].btnList[i].moji, 
        speak:pgObj[scnNum].btnList[i].speak, 
        tugi:pgObj[scnNum].btnList[i].tugi,
        option:pgObj[scnNum].btnList[i].option,
        defSeq:pgObj[scnNum].btnList[i].defSeq.toString(),
      })
    } else {
      tempObj.btnList.push({ moji:'', speak:'', tugi:'', option:'', defSeq:'' })
    }
  }
// writeLog(10, '1:'+ offSet.toString() + ':' + tempObj.btnList.length.toString());
  
  const [pgTitle, setTitle] = useState(tempObj.pgTitle);
  const [pgOption, setPgOption] = useState(tempObj.pgOption);
  const [btnList, setBtnList] = useState(tempObj.btnList.slice(offSet, offSet+numInput))

  const onPressDismiss = () => {
    removeDup(scnNum)
    pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1).map((item,i)=> item.defSeq = i*10+10)
    writeFile();
    router.dismissTo({ pathname: "/configScrn", params: { post: scnNum, from: 'configText' }, });
  } 

  const onPressSave = () => {
    // copy temp to pgObj
    pgObj[scnNum].pgTitle = pgTitle.trim();
    pgObj[scnNum].pgOption = pgOption.trim();
    for ( let i = 0; i < numInput; i++ ) {
      if (pgObj[scnNum].btnList.length <= i+offSet + 1 ) {
        pgObj[scnNum].btnList.push({moji:'', speak:'', tugi:'', option:'', 
          defSeq:pgObj[scnNum].btnList.length, usedDt:0, numUsed:0}) 
      } 
      pgObj[scnNum].btnList[i+offSet].moji = btnList[i].moji.trim();
      pgObj[scnNum].btnList[i+offSet].speak = btnList[i].speak.trim();
      pgObj[scnNum].btnList[i+offSet].tugi = btnList[i].tugi.trim();
      pgObj[scnNum].btnList[i+offSet].option = btnList[i].option.trim();
      pgObj[scnNum].btnList[i+offSet].defSeq = parseInt(btnList[i].defSeq);
    }
// writeLog(10, 'onSave:'+offSet.toString() + ':' + tempObj.btnList.length.toString() + ':' + numConf.toString());
if ( btnList[numInput-1].moji === '' && offSet + numInput >= tempObj.btnList.length ) {  // last screen? (offset+5: last entry of screen)
      removeDup(scnNum)
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1).map((item,i)=> item.defSeq = i*10+10)
      writeFile();
      router.dismissTo({ pathname: "/configScrn", params: {post: scnNum, from:'configText' }, });
    } else {
      if (offSet + numInput*2 > tempObj.btnList.length) {  //頁追加
// writeLog(10, 'add ' + offSet.toString() + ' len ' + tempObj.btnList.length.toString());
        for (let i = 0 ; i < numInput; i++) {
          tempObj.btnList.push({moji:'', speak:'', tugi:'', option:'', defSeq:''})
        }
      }
      setBtnList(tempObj.btnList.slice(offSet+numInput, offSet+numInput*2))
// writeLog(10, 'nextBtnList' + JSON.stringify(btnList));
      setOffSet(offSet + numInput)
    }
  }

  function onChangeMoji(text:string, index:number){
    btnList[index].moji = text
    setBtnList([...btnList])
  }
  function onChangeSpeak(text:string, index:number){
    btnList[index].speak = text
    setBtnList([...btnList])
  }
  function onChangeTugi(text:string, index:number){
    btnList[index].tugi = text
    setBtnList([...btnList])
  }
  function onChangeOpt(text:string, index:number){
    btnList[index].option = text
    setBtnList([...btnList])
  }
  function onChangeSeq(text:string, index:number){
    btnList[index].defSeq = text
    setBtnList([...btnList])
  }
  const gestureConfig = { 
    velocityThreshold: 0.5,  //0.3,
    directionalOffsetThreshold: 80,
//    isClickThreshold: 5,
  };
  function onSwipeLeft(){
// writeLog(10, 'left');
    setModalVisible(true) 
  }
  function onSwipeRight(){
    writeFile();
    setModalVisible(false) 
  }
  return (
  <GestureRecognizer
  onSwipeLeft={(state) => onSwipeLeft()}
  onSwipeRight={(state) => onSwipeRight()}
  config={gestureConfig}
  style={{ flex: 1  }}
  >
  <SafeAreaProvider>
    <SafeAreaView style={stylesConfText.container}>
      <Stack.Screen options={{
          headerTitle: () => (
            <Pressable onLongPress={() => router.push({ pathname: "/helpConfigText", params: { post: scnNum, from: 'configText' } })}>
            <View style={styles.headerTitle}>
              <Text style={[styles.headerText]}>
                {scnNum.toString()+':'+tempObj.pgTitle+ ' 編集/' + (offSet/numInput + 1).toString()}</Text>
            </View>
            </Pressable>
          ),
          headerBackButtonDisplayMode:  'minimal' ,
            headerRight:  () => (
              <Pressable onPress={() => onPressSave()}>
                <View style={[styles.headerButton,]}>
                  <Text style={{textAlign:'center' }}>次へ</Text>
                </View>
              </Pressable> 
            ),         
            headerLeft:  () => ( 
              <Pressable onPress={() => onPressDismiss()}>
                <View style={[styles.headerButton, ]}>
                  <Text style={{textAlign:'center' }}>＜</Text>
                </View>
              </Pressable> 
            ),               
      }} />
      <Modal 
        animationType="none"
        transparent={false}
        visible={modalVisible} >
        <View style={[stylesConfText.container, {backgroundColor:styles.container.backgroundColor, marginTop: 56}]}>
          <Text style={{ paddingTop:5, fontSize:14, width:'30%' }}> {pgTitle} </Text>
          <TextInput style={[stylesConfText.pgOpt, {width:'66%'}]} onChangeText={setPgOption} 
            value={pgOption}  autoFocus={true} /> 
          <Text style={{width:'30%'}}>表示</Text>
          <Text style={{width:'56%'}}>オプション</Text>
          <Text style={{width:'10%'}}>順序</Text>
          {btnList.map((text, index) =>
            <View key={index*4 } style={stylesConfText.containerBody}>
              <TextInput key={(index*4+1).toString()} style={[stylesConfText.moji, {width: '33%'}]} 
                onChangeText={(text) => onChangeMoji(text, index)} value={btnList[index].moji} />
              <TextInput key={(index*4+2).toString()} style={[stylesConfText.moji, {width: '56%'}]} 
                onChangeText={(text) => onChangeOpt(text, index)} value={btnList[index].option} />
              <TextInput key={(index*4+3).toString()} style={[stylesConfText.moji, {width: '10%'}]} 
                onChangeText={(text) => onChangeSeq(text, index)} value={btnList[index].defSeq} />
            </View>
          )}
          <View>
            <TouchableHighlight onPress={() => onSwipeRight() } >
              <View style={[stylesConfText.button, {backgroundColor:iniObj.controlButtonColor, width:100}]}>
                <Text>＜</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <Text style={{ paddingTop:5, fontSize:14 }}>タイトル</Text> 
      <TextInput style={stylesConfText.pgTitle} onChangeText={setTitle} value={pgTitle} autoFocus={true} />
      <Text style={{width:stylesConfText.moji.width}}>表示</Text>
      <Text style={{width:stylesConfText.speak.width}}>発音</Text>
      <Text style={{width:stylesConfText.link.width, fontSize:10}}>リンク</Text>
      {btnList.map((text, index) =>
        <View key={index*4 } style={stylesConfText.containerBody}>
          <TextInput key={(index*4+1).toString()} style={stylesConfText.moji} 
            onChangeText={(text) => onChangeMoji(text, index)} value={btnList[index].moji} />
          <TextInput key={(index*4+2).toString()} style={stylesConfText.speak} 
            onChangeText={(text) => onChangeSpeak(text, index)} value={btnList[index].speak} />
          <TextInput key={(index*4+3).toString()} style={stylesConfText.link} 
            onChangeText={(text) => onChangeTugi(text, index)} value={btnList[index].tugi} />   
        </View>
      )}
      <TouchableHighlight onPress={ onPressDismiss } >
        <View style={[stylesConfText.button,]}>
          <Text>止める</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight onPress={() => setModalVisible(true) } >
        <View style={[stylesConfText.button,]}>
        <Text>オプション＞</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight onPress={ onPressSave} >
        <View style={[stylesConfText.button, ]}>
          {(btnList[numInput-1].moji === '') ? <Text>登録</Text>:<Text>登録・次へ</Text>}
        </View>
      </TouchableHighlight>
      </SafeAreaView>
    </SafeAreaProvider>
    </GestureRecognizer>
 )
};

export const stylesConfText = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical:5,
    width: Dimensions.get('window').width ,
  },
  button: {
    alignItems: 'center',
    backgroundColor: styles.headerButton.backgroundColor,
    paddingTop: 15,
    padding: 1,
    width: Dimensions.get('window').width/3-20,
    height: 50,
    borderRadius: 15,
    borderColor: styles.buttonBottom.borderColor,
    borderWidth: styles.buttonBottom.borderWidth,
  },
  containerBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width ,
  },
  pgTitle: {
    width: '80%',
    height: 30,
    borderWidth: 1,
    padding: 5,
  },
  pgOpt: {
    width: '80%',
    height: 30,
    borderWidth: 1,
    padding: 5,
  },
  moji: {
    width: '45%',
    height: 30,
    borderWidth: 1,
    padding: 5,
  },
  speak: {
    width: '44%',
    height: 30,
    borderWidth: 1,
    padding: 5,
  },
  link: {
    width: '10%',
    height: 30,
    borderWidth: 1,
    padding: 5,
  },
  option: {
    width: '50%',
    height: 30,
    borderWidth: 1,
    padding: 5,
  },
});