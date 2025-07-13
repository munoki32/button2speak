import { Stack, useLocalSearchParams, useRouter, } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import {
  Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
  TouchableHighlight, View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { iniObj, pgObj, writeFile, writeLog } from './comFunc';
import { styles } from './index';

export default function editButton(){ // ボタンの編集
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const { post, from, originScn } = useLocalSearchParams();  //  呼び出しの画面番号を受け取る
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  }
  let buttonNum = 0;
  if (from) { 
    // writeLog(10, 'post:' + Number(from));
    buttonNum = Number(from);
  }
  let originScnNum = -2;
  if (originScn){
    originScnNum = Number(originScn)
  }
  // writeLog(10, 'editButton:' + scnNum +'/' + buttonNum  + '/' + originScnNum);

  const [textInput, setTextInput] = useState(pgObj[scnNum].btnList[buttonNum].moji);  // for TextInput area 初期値
  const [speakInput, setSpeakInput] = useState(pgObj[scnNum].btnList[buttonNum].speak);  // for TextInput area 初期値
  const [optionInput, setOptionInput] = useState(pgObj[scnNum].btnList[buttonNum].option); //

  // let scrnList = [{key:-1, label:'---', value:-1}];
  // let scrnList = [{key:0, label:'---', value:0}];
  let scrnList = []
  for (let i =0; i < pgObj.length; i++) {
    scrnList.push({key:i, label:i.toString()+':'+pgObj[i].pgTitle, value:i+1})
  }
  scrnList.push({key:999, label:'新規画面', value:pgObj.length+1})

  const [selectScrn, setSelectScrn] = useState(scnNum===originScnNum?-1:originScnNum+1); //
  const [selectLink, setSelectLink] = useState(parseInt(pgObj[scnNum].btnList[buttonNum].tugi)+1); //
  // writeLog(10, 'Tugi:' +parseInt(pgObj[scnNum].btnList[buttonNum].tugi) + ' Link:' + selectLink );

  function moveButton(){
    writeLog(20, 'udpateButton:Link:' + selectLink);
    writeLog(20, 'updateButton:Move:' + selectScrn);
    if (setButton()){ // if target set (copied) 
      pgObj[scnNum].btnList.splice(buttonNum,1)  // remove current button
    }
    writeFile();
    router.back();
  }

  function copyButton(){
    writeLog(20, 'copyButton:Link:' + selectLink);
    writeLog(20, 'copyButton:Move:' + selectScrn);
    setButton();
    writeFile();
    router.back();
  }

  function setButton(){
    pgObj[scnNum].btnList[buttonNum].moji = textInput;
    pgObj[scnNum].btnList[buttonNum].speak = speakInput;
    pgObj[scnNum].btnList[buttonNum].option = optionInput;
    if (selectLink >= 0) {
      pgObj[scnNum].btnList[buttonNum].tugi = (selectLink-1).toString()
    } else {
      pgObj[scnNum].btnList[buttonNum].tugi = '';
    }
    if ( selectScrn-1 >= pgObj.length) { //新規画面を作り追加
      pgObj.push({ pgTitle:'新規画面', btnList:[{
        moji:pgObj[scnNum].btnList[buttonNum].moji,
        speak:pgObj[scnNum].btnList[buttonNum].speak,
        tugi:pgObj[scnNum].btnList[buttonNum].tugi,
        option:pgObj[scnNum].btnList[buttonNum].option, 
        defSeq: 0, usedDt:999, numUsed:999}], pgOption:'' });
      //リンク元をオリジナル画面に追加
      const nextDefSeq =  Math.max(...pgObj[originScnNum].btnList.map(item => item.defSeq),0)+10
      pgObj[originScnNum].btnList.push({  
        moji:'新規画面', speak:'', tugi:(pgObj.length-1).toString(), option:'', 
        defSeq:nextDefSeq, usedDt:999-nextDefSeq, numUsed:999-nextDefSeq  })
      return true;
    } else if ( selectScrn >= 0)  { //指定画面に追加
      for (let i = 0; i < pgObj[selectScrn-1].btnList.length; i++ ) {
        if (pgObj[selectScrn-1].btnList[i].moji === pgObj[scnNum].btnList[buttonNum].moji) {
          Alert.alert('情報','既に「'+(selectScrn-1).toString() +':'+ pgObj[selectScrn-1].pgTitle+'」に同じボタンが登録されています');
          return false;
        }
      }
      const nextDefSeq =  Math.max(...pgObj[selectScrn-1].btnList.map(item => item.defSeq),0)+10
      pgObj[selectScrn-1].btnList.push( {  // add to new scrn 
        moji:pgObj[scnNum].btnList[buttonNum].moji,
        speak:pgObj[scnNum].btnList[buttonNum].speak,
        tugi:pgObj[scnNum].btnList[buttonNum].tugi,
        option:pgObj[scnNum].btnList[buttonNum].option, 
        defSeq:nextDefSeq, usedDt:999-nextDefSeq, numUsed:999-nextDefSeq
      })
      return true;
    }
    return false;
  }

  function updateButton(){
    writeLog(20, 'updateButton:Link:' + selectLink);
    writeLog(20, 'updateButton:Move:' + selectScrn);
    pgObj[scnNum].btnList[buttonNum].moji = textInput;
    pgObj[scnNum].btnList[buttonNum].speak = speakInput;
    pgObj[scnNum].btnList[buttonNum].option = optionInput;
    if (selectLink >= 0) {
      pgObj[scnNum].btnList[buttonNum].tugi = (selectLink-1).toString()
    } else {
      pgObj[scnNum].btnList[buttonNum].tugi = '';
    }
    writeFile();
    router.back()
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[stylesFreeText.container,{ width:Dimensions.get('window').width }]}>
        <Stack.Screen options={{
          headerTitle: () => (
            <Pressable onLongPress={() => {
              router.push({ pathname: "/helpEditButton", params: { post: scnNum, from:'editBUtton' } })
            }} >
            <View style={styles.headerTitle}>
              <Text style={styles.headerText}>ボタンの編集</Text>
            </View>
            </Pressable>
          ),
          headerBackButtonDisplayMode:  'minimal' ,
          headerStyle: { backgroundColor:styles.containerBottom.backgroundColor },
          headerRight:  () => (
            <Pressable onPress={() => {
                  router.push({ pathname: "/helpEditButton", params: { post: scnNum, from:'editButton' } } );
            }}>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor}]}>
                <Text style={{textAlign:'center' }}>ヘルプ</Text>
              </View>
            </Pressable> 
          ),         
          headerLeft:  () => ( 
            <Pressable onPress={() => router.back() }>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor}]}>
                <Text style={{textAlign:'center' }}>＜</Text>
              </View>
            </Pressable> 
          ),    
          }}/>
        <ScrollView >
          <Text style={{fontSize:Dimensions.get('window').width < 1000? 20: 36, textAlign:'center'}}>{scnNum.toString()+':' + pgObj[scnNum].pgTitle + ' - #'  + buttonNum.toString()}</Text>
          <View style={{flex:1, flexDirection:'row', flexWrap:'wrap'}}>
            <Text style={[stylesFreeText.text]}>ボタンの表示</Text>
            <TextInput style={[stylesFreeText.textInput]}
              autoFocus={false}
              multiline={false}
              onChangeText={(text)=>setTextInput(text)} 
              value={textInput} />
            <Text style={[stylesFreeText.text]}>発音テキスト</Text>
            <TextInput style={[stylesFreeText.textInput]}
              autoFocus={false}
              multiline={false}
              onChangeText={(text)=>setSpeakInput(text)} 
              value={speakInput} />
            <Text style={[stylesFreeText.text]}>オプション</Text>
            <TextInput style={[stylesFreeText.textInput,{height:80}]}
              autoFocus={false}
              multiline={true}
              onChangeText={(text)=>{
                setOptionInput(text.replace('\n',' '))} }
              value={optionInput} />

          <Text style={[stylesFreeText.text]}>リンク先</Text>
          <View style={stylesFreeText.textInput}>
            <RNPickerSelect 
              onValueChange={(value) => { 
                setSelectLink(value);
              }} 
              items={scrnList}
              value={selectLink}
              placeholder={{label:'----', value:-1}}
              style={pickerSelectStyles}
              />
          </View>
          <Text style={[stylesFreeText.text]}>移動/コピー先</Text>
          <View style={stylesFreeText.textInput}>
            <RNPickerSelect 
              onValueChange={(value) => { 
                setSelectScrn(value);
                writeLog(20, 'selectScrn:' + selectScrn + ' ' + value);
              }} 
              items={scrnList}
              value={selectScrn}
              placeholder={{label:'----', value:-1}}
              style={pickerSelectStyles}
              />
          </View>
        </View>
      </ScrollView>
          </SafeAreaView>
          <SafeAreaView  style={[styles.containerBottom,{ bottom:40,
             height:150} ]}>
          <View style={[styles.containerBottom,{
            width: Dimensions.get('window').width, height:150} ]}>
            <TouchableHighlight onPress={ () => { router.back() } }>
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                width:Dimensions.get('window').width/3-12 }]}>
                <Text style={stylesFreeText.buttonText}>＜</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => {
              writeLog(20, 'move:' + selectScrn);
              moveButton()}} 
              disabled={(selectScrn < 0)?true:false}
              >
              <View style={[stylesFreeText.button, 
                {backgroundColor:(selectScrn<0)?'#d3d3d3':iniObj.controlButtonColor,
                width:Dimensions.get('window').width/3-12 }]}>
                <Text  style={[stylesFreeText.buttonText, {color:(selectScrn<0)?'gray':''}]}>移動</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight  onPress={ () => {
              writeLog(20, 'copy:' + selectScrn);
              copyButton()}}
              disabled={(selectScrn < 0)?true:false}
              >
              <View style={[stylesFreeText.button, 
                {backgroundColor:(selectScrn<0)?'#d3d3d3':iniObj.controlButtonColor,
                width:Dimensions.get('window').width/3-12 }]}>
                <Text style={[stylesFreeText.buttonText, {color:(selectScrn<0)?'gray':''}]}>コピー</Text>
              </View>
            </TouchableHighlight >
            <TouchableHighlight onLongPress={ () => {
              writeLog(20, 'delete:' + scnNum + ' ' + buttonNum);
              writeLog(20, 'delete:' + pgObj[scnNum].btnList[buttonNum].moji);
              pgObj[scnNum].btnList.splice(buttonNum, 1);  //　エントリーを消す
              router.back();
            }} >
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                width:Dimensions.get('window').width/3-12 }]}>
                <Text style={[stylesFreeText.buttonText, {color:'red'}]}>削除</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => { updateButton()} }>
              <View style={[stylesFreeText.button,
               {backgroundColor:iniObj.controlButtonColor,
                width:Dimensions.get('window').width/3-12 }]}>
                <Text style={[stylesFreeText.buttonText,]}>更新</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => {
              if (speakInput === 'na') (Speech.speak('発音しません', {language: "ja",}))
              else if (speakInput !== '') { Speech.speak(speakInput, {language: "ja",}) }
              else {Speech.speak(textInput, {language: "ja",})}
            }} >
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                width:Dimensions.get('window').width/3-12 }]}>
                <Text style={stylesFreeText.buttonText}>発音</Text>
              </View>
            </TouchableHighlight>
          </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export const stylesFreeText = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,  //上下間隔
    width: Dimensions.get('window').width,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: iniObj.controlButtonColor ,
    padding: 1,
    width: Dimensions.get('window').width/3-8,
    height: Platform.select({
     android: 60,
     ios:     60,}),
    borderRadius: 20,
    borderColor:styles.buttonBottom.borderColor,
    borderWidth:styles.buttonBottom.borderWidth,
  },
  textInput: {
    width: Dimensions.get('window').width<1000?Dimensions.get('window').width-120:Dimensions.get('window').width-240,
    height: 45,
    borderWidth: 0.5,
    paddingLeft: 5,
    fontSize:Dimensions.get('window').width < 1000? 18: 36,
    marginTop:10,
  },
  buttonText: {
    fontSize:Dimensions.get('window').width < 1000? 18: 36,
    color: styles.text.color,
    // width: 145,
  },
    text: {
    width:Dimensions.get('window').width < 1000? 120:240 , 
    marginTop:14,
    fontSize:Dimensions.get('window').width < 1000? 18: 36,
    color: styles.text.color,
    // width: 145,
  },
  containerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: styles.container.backgroundColor,
    height:80,
    paddingTop:20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize:Dimensions.get('window').width < 1000? 18: 36,
    paddingVertical: 12,
    paddingHorizontal: 10,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 200,
    marginLeft: 30,
    pointerEvents:'none', // fix make possble to click on line
  },
  inputAndroid: {
   fontSize:Dimensions.get('window').width < 1000? 18: 36,
    paddingRight: 30, // to ensure the text is never behind the icon
    // width: Dimensions.get('window').width,
    width:200,
  },
});