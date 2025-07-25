import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableHighlight, View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { iniObj, makeLink, pgObj, writeFile, writeLog } from './comFunc';
import { freeTextScn } from './freeText';
import { styles } from './index';

export default function configScrn(){ // 画面設定・フリー設定

  const [freeTextClear, setfreeTextClear] = useState(iniObj.freeTextClear)
  
  const sortList = [ // ソートの選択リスト
    { label: '未設定', value: 'non' }, { label: '定義順', value: 'def' }, { label: '逆定義順', value: 'dfr' },
    { label: '使用順', value: 'dat' }, { label: '頻度順', value: 'cnt' }, ]

  const { post, from } = useLocalSearchParams();
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog(40, 'Err: configScrn No post number');
    scnNum = 0;
  }

  writeLog(10, 'configScrn from: ' + scnNum  );

  // 現在の頁のソート指定を読込む
  let pgSort = 'non';
  writeLog(0, 'configScrn:pgOption:' + pgObj[scnNum].pgOption);
  let matchText = pgObj[scnNum].pgOption.match(/(^|^.*)(sort:)(...)($| .*$)/)
  if (matchText !== null && matchText[3] !== ''){ pgSort=matchText[3] } ;
  writeLog(0, 'configScrn:pgOptionSort:' + pgSort + '/' +pgObj[scnNum].pgOption);
  const [pageSort, setPageSort] = useState(pgSort)
  //　rowを読込む
  let pgRow = '6';
  matchText = pgObj[scnNum].pgOption.match(/(^|^.*)(row:)(\d+)($| .*$)/)
  if (matchText !== null && matchText[3] !== ''){ pgRow=matchText[3] } ;
  writeLog(0, 'configScrn:pgOptionRow:' + pgRow + '/' +pgObj[scnNum].pgOption);
  const [pageRow, setPageRow] = useState(pgRow)
  //　colを読込む
  let pgCol = '2';
  matchText = pgObj[scnNum].pgOption.match(/(^|^.*)(col:)(\d+)($| .*$)/)
  if (matchText !== null && matchText[3] !== ''){ pgCol=matchText[3] } ;
  writeLog(0, 'configScrnpgOptionCol:' + pgCol + '/' +pgObj[scnNum].pgOption);
  const [pageCol, setPageCol] = useState(pgCol)
  // タイトル
  const [textInput, setTextInput] = useState(pgObj[scnNum].pgTitle);  // for TextInput area 初期値
  //
  const router = useRouter();

  function onPressConfigText(){
    router.push({ pathname: "/configText", params: { post: scnNum, from: 'configScrn' } });
  }

  function pgBack(){ 
    pgObj[scnNum].pgTitle = textInput;
    // writeFile();
    scnNum === freeTextScn ? router.dismissTo({pathname:'/freeText', params: {post: scnNum, from:'configScrn'}}) 
    :  router.dismissTo({pathname:'/', params: {post: scnNum, from:'configScrn' }});
  }

  function delScn(scn:number){
    writeLog(20, 'delScn:' + scn);
    setTextInput('')
    pgObj[scn].pgTitle = '';
    pgObj[scn].btnList.splice(0)
    writeFile();
  }

  return(
  <SafeAreaProvider>
      <Stack.Screen options={{
        headerTitle: () => (
          <Pressable onPress={() => {
            router.push({ pathname: "/helpConfigScrn", params: { post: scnNum, from: 'configScrn'} })
          }} >
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>{scnNum.toString()+':' + pgObj[scnNum].pgTitle +' 設定'}</Text>
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
          <Pressable onPress={() => router.push({ pathname: "/helpConfigScrn", params: { post: scnNum, from:'configScrn' } })}>
            <View style={[styles.headerButton, ]}>
              <Text style={{textAlign:'center', fontSize:12 }}>ヘルプ</Text>
            </View>
          </Pressable>
        ), 
        }} />
    <SafeAreaView>
      <ScrollView>
        <View style={[stylScrnConf.container]}>
          <TouchableHighlight onLongPress={ ()  => { 
            Alert.alert('質問','「' + scnNum.toString() + ':' + pgObj[scnNum].pgTitle + '」画面を削除しますか？', [
              { text: 'いいえ', onPress: () => {return} },
              { text: 'はい', onPress: () => { 
                delScn(scnNum);
                }}, ])
            }} >
            <View style={[stylScrnConf.button,  {width: Dimensions.get('window').width/2-5} ]}>
              <Text style={[stylScrnConf.text, {color: 'red'}]}>画面を削除する</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ ()  => { 
            Alert.alert('質問','「' + scnNum.toString() + ':' + pgObj[scnNum].pgTitle + '」の使用回数をリセットしますか？', [
              { text: 'いいえ', onPress: () => {return} },
              { text: 'はい', onPress: () => { 
                pgObj[scnNum].btnList.map((a) => a.numUsed = 0);
                }}, ])
            }} >
            <View style={[stylScrnConf.button,   {width: Dimensions.get('window').width/2-5} ]}>
              <Text style={[stylScrnConf.text,]}>使用回数をリセット</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ ()  => { 
            Alert.alert('質問','「' + scnNum.toString() + ':' + pgObj[scnNum].pgTitle + '」にどこからもリンクされていない画面を登録しますか？', [
              { text: 'いいえ', onPress: () => {return} },
              { text: 'はい', onPress: () => { 
                makeLink(scnNum)
              }}, ])
            }} >
            <View style={[stylScrnConf.button,  {width: Dimensions.get('window').width/2-5} ]}>
              <Text style={[stylScrnConf.text,]}>{'非リンク画面登録'}</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => {onPressConfigText()}} >
            <View style={[stylScrnConf.button,{width: Dimensions.get('window').width/2-5} ]}>
              <Text style={stylScrnConf.text}>{scnNum.toString() + ':' + pgObj[scnNum].pgTitle}</Text>
              <Text style={stylScrnConf.text}>画面エディタ</Text>
            </View>
          </TouchableHighlight>
          { scnNum !== freeTextScn?
          <TouchableHighlight disabled={scnNum===freeTextScn?true:false}
            onPress={() => { router.push({ pathname: "/addButton", params: { post: scnNum, from: 'configScrn' } }) }} 
            >
            <View style={[stylScrnConf.button,{width: Dimensions.get('window').width,
              backgroundColor:stylScrnConf.bottomButton.backgroundColor} ]}>
                <Text style={stylScrnConf.text}>「{scnNum.toString() + ':' + pgObj[scnNum].pgTitle}」ボタン追加/編集へ</Text> 
            </View>
          </TouchableHighlight>
          : <View style={[stylScrnConf.button,{width: Dimensions.get('window').width, borderWidth:0,
            backgroundColor:styles.container.backgroundColor} ]}>
              <Text>「フリー」のタイトルを変更すると、このフリー画面は新たな画面に成ります。
                その画面をリンクしたい画面の設定で「非リンク画面登録」をしてください。
              </Text>
            </View>
          }
          <Text style={[stylScrnConf.text, {marginTop:19, height:40}]}>タイトル</Text>
          <TextInput style={[stylScrnConf.textInput]}
            autoFocus={false}
            multiline={false}
            onChangeText={(text)=> { setTextInput(text);
              // pgObj[scnNum].pgTitle = text;
            }}
            value={textInput} />
          <View style={{borderWidth:0,}}>

            <RNPickerSelect 
              onValueChange={(value) => {
                setPageSort(value);
                pgSort = value;
                // if (value === 'def') return;
                let matchPattern = /(^.*)(sort:)(...)($| .*$)/
                let matchText = pgObj[scnNum].pgOption.match(matchPattern)
                if (matchText !== null && matchText[2] !== '') {
                  if (value !== 'non') {
                    pgObj[scnNum].pgOption = pgObj[scnNum].pgOption.replace(matchPattern, '$1$2'+value+'$4')
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
              // placeholder={{ label:'この画面の表示順', value: pageSort }}
              value={pageSort}
              />
            <Text style={[stylScrnConf.pickerText,]}>画面表示順</Text>

            <RNPickerSelect 
              onValueChange={(value) => {
                setPageRow(value);
                let matchPattern = /(^.*)(row:)(\d+)($| .*$)/
                let matchText = pgObj[scnNum].pgOption.match(matchPattern)
                if (matchText !== null && matchText[2] !== '') {
                  if (value !== '') {
                    pgObj[scnNum].pgOption = pgObj[scnNum].pgOption.replace(matchPattern, "$1$2"+value+"$4") ; // change sort: option
                    // writeLog( 0, 'match:' +pgObj[scnNum].pgOption +':'+value+':' );
                  } else {
                    pgObj[scnNum].pgOption = matchText[1] + matchText[4]; // remove sort: option
                  }
                } else {
                  if (value !== '') { pgObj[scnNum].pgOption += ' row:' + value; } // add sort:option
                }
              }}
              items={[{label:'1', value:'1'},{label:'2', value:'2'},{label:'3', value:'3'},
                {label:'4', value:'4'},{label:'5', value:'5'},{label:'6', value:'6'}, 
                {label:'7', value:'7'},{label:'8', value:'8'},{label:'9', value:'9'}, 
                ]}
              Icon={() => (<Text style={{ position: 'absolute', right: 10, top: 15, fontSize: 18, color: '#789' }}>{Platform.OS === 'ios' ? '▼' : '' }</Text>)}
              style={pickerSelectStyles}
              placeholder={{ label:'---', value: '' }}
              value={pageRow}
              />
            <Text style={[stylScrnConf.pickerText,]}>この画面の行数</Text>

            <RNPickerSelect 
              onValueChange={(value) => {
                setPageCol(value);
                let matchPattern = /(^.*)(col:)(\d+)($| .*$)/
                let matchText = pgObj[scnNum].pgOption.match(matchPattern)
                if (matchText !== null && matchText[2] !== '') {
                  if (value !== '') {
                    pgObj[scnNum].pgOption = pgObj[scnNum].pgOption.replace(matchPattern, "$1$2"+value+"$4") ; // change sort: option
                    // writeLog( 0, 'match:' +pgObj[scnNum].pgOption +':'+value+':' );
                  } else {
                    pgObj[scnNum].pgOption = matchText[1] + matchText[4]; // remove sort: option
                  }
                } else {
                  if (value !== '') { pgObj[scnNum].pgOption += ' col:' + value; } // add sort:option
                }
              }}
              items={[{label:'1', value:'1'},{label:'2', value:'2'},{label:'3', value:'3'},
                {label:'4', value:'4'},{label:'5', value:'5'},{label:'6', value:'6'}, 
                ]}
              Icon={() => (<Text style={{ position: 'absolute', right: 10, top: 15, fontSize: 18, color: '#789' }}>{Platform.OS === 'ios' ? '▼' : '' }</Text>)}
              style={pickerSelectStyles}
              placeholder={{ label:'---', value: '' }}
              value={pageCol}
              />
            <Text style={[stylScrnConf.pickerText,]}>この画面の列数</Text>

            <View style={stylScrnConf.switchContainer} >
              <TouchableHighlight onPress={ () => { setfreeTextClear(!freeTextClear) }}>
                <Text style={[stylScrnConf.pickerText,
                  {width:Dimensions.get("window").width-100,
                   height:80, marginTop:Platform.OS === 'ios'? 30 :-10}]}>入力は自動クリア（共通）</Text>
              </TouchableHighlight>
              <Switch style={stylScrnConf.switch}
                onValueChange = {()=> {setfreeTextClear(!freeTextClear);
                  iniObj.freeTextClear = !freeTextClear; }} 
                value = {freeTextClear} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    <SafeAreaView  style={[styles.containerBottom ]}>
      <TouchableHighlight onPress={ ()  => { pgBack() }} >
          <View style={[stylScrnConf.bottomButton,{height: stylScrnConf.button.height}]}>
          <Text style={[stylScrnConf.text, {fontSize:Dimensions.get('window').width < 1000? 18: 36,}]}>＜</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight onPress={ () => {
        router.push({ pathname: "/configApp", params: { post: scnNum, from: scnNum !== freeTextScn ? 'configScrn':'free' } });
        }} >
        <View style={[stylScrnConf.bottomButton,{height: stylScrnConf.button.height}]}>
          <Text style={[stylScrnConf.text]}>全体設定</Text>
        </View>
      </TouchableHighlight>
    </SafeAreaView>
  </SafeAreaProvider>
  );

}
export const stylScrnConf = StyleSheet.create({
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
    color: styles.text.color,
    textAlign: 'center',
    fontSize: Dimensions.get('window').width < 1000? 18: 36,
  },
  switchContainer: {
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',       //上下位置
    justifyContent: 'flex-start', //左右位置
    flexDirection:'row',
    width: Dimensions.get('window').width,
  },
  pickerText:{
    width: Dimensions.get('window').width < 1000? 200:400, 
    textAlign: 'left',
    textAlignVertical: 'center',
    height: 40,
    fontSize: Dimensions.get('window').width < 1000? 18: 36,
    marginTop:Platform.OS === 'ios'?  Dimensions.get('window').width < 1000? -35 : -50 : -48,
  },
    switch: {
    marginLeft: 10,
    marginRight: 10,
    height: 60,   // スイッチの間隔が変わる
    // paddingTop: Platform.OS === 'ios' ? -40: 0 ,
  },
    textInput: {
    width:  Dimensions.get('window').width < 1000? Dimensions.get('window').width-100:Dimensions.get('window').width-200,
    height: 40,
    borderWidth: 0.5,
    paddingLeft: 5,
    fontSize: Dimensions.get('window').width < 1000? 18: 36,
    marginTop:10,
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