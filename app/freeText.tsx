import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, StatusBar, BackHandler, Pressable, Dimensions, StyleSheet, useWindowDimensions,
  AppState, Text, TouchableHighlight, View, ScrollView, Linking, Alert, TextInput, 
  KeyboardAvoidingView} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { pgObj, iniObj, writeFile, dispText, speakStack, mojiStack, findBottmHeight,
  findButtonWidth, findButtonHeight, findFontSize, buttonSort, writeLog } from './comFunc'
import { useIsFocused } from '@react-navigation/native';
import { reloadAppAsync } from "expo";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export let freeTextScn = 14;

export default function freeText(){
  const [textInput, setTextInput] = useState('');  // for TextInput area 初期値
  const router = useRouter();
  const isFocused = useIsFocused(); //これでrouter.backで戻ってきても再レンダリングされる
  const [changeScrn, setChangeScrn] = useState(true) //再レンダリング用
  const { height, width } = useWindowDimensions();
  const isPortrait = height >= width;
  const [modalVisible, setModalVisible] = useState(false);
  
  const { post, from } = useLocalSearchParams();  //  呼び出しの画面番号を受け取る
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog( 0, 'Err: freeText No post number');
    scnNum = 0;
  };
  let isFromConifigScn:boolean = false;
  const originScn = scnNum; // save original screen  
  freeTextScn = pgObj.findIndex(text => text.pgTitle === 'フリー') // find free text screen
  // writeLog( 0, 'findFreeTextScreen:' + freeTextScn);
  if (freeTextScn < 0) { // no free text screen
    pgObj.push({ pgTitle:'フリー', btnList:[], pgOption:'sort:dat row:8' }); // フリー画面の初期値
    freeTextScn = pgObj.length - 1;
  } 
  scnNum = freeTextScn;  // セット　フリーテキストモード

  if (from) {   // change to updat by freeText
    writeLog( 0, 'freeText: post:'+ post + ' from:' + from);
    if (from === 'configScrn') {
      scnNum = originScn;  // セット　画面編集モード
      isFromConifigScn = true;
    }
  } 

  
function toDo(count:number) {   //発声ボタンが押された時の処理
  if (scnNum === 0) {
    speakStack.splice(0);
    mojiStack.splice(0);
  }
  let speakText = ''
  dispText.splice(0)
  pgObj[scnNum].btnList[count].numUsed += 1000;
  pgObj[scnNum].btnList[count].usedDt = Date.now();
  switch (pgObj[scnNum].btnList[count].speak) {
    case 'na': ; break;
    case '': 
      speakText = pgObj[scnNum].btnList[count].moji;
      break;
    default: 
      if (pgObj[scnNum].btnList[count].tugi === 'url') break;
      speakText = pgObj[scnNum].btnList[count].speak
  }
  if (speakText !== '') {
    speakStack.push(speakText)
    mojiStack.push(pgObj[scnNum].btnList[count].moji)
    // Speech.stop();
    const timeOutId = setTimeout(() => {
      writeLog( 0, 'speakTimeOut:' + speakText.length);
      setModalVisible(false); 
      Alert.alert('エラー','音声が出ていませんか？、「はい」で再起動します', [
        { text: 'いいえ', onPress: () => {
          clearTimeout(timeOutId);
          Speech.stop();
        }},
        { text: 'はい', onPress: () => { 
          reloadAppAsync();
        }}, ])
      }, speakText.length*300 + 9000)
    if (iniObj.textOnSpeak) { 
        dispText.push(pgObj[scnNum].btnList[count].moji)
        setModalVisible(true) 
        Speech.speak(speakText, {
          language: "ja",
          onStopped:() => {
            clearTimeout(timeOutId);
            setModalVisible(false);
          },
          onDone:() => {
            clearTimeout(timeOutId);
            setTimeout(() => { 
              setModalVisible(false);
            }, 1000)
          }})
      } else {
        Speech.speak(speakText, {
          language: "ja",
          onDone:() => {
            clearTimeout(timeOutId);
          },
          onStopped:() => {
            clearTimeout(timeOutId);
          }
        })
      }
  }
  setTextInput(pgObj[scnNum].btnList[count].moji)
  buttonSort(scnNum)
  // setChangeScrn(!changeScrn); //画面の強制更新

} // end of toDo
  

  function onLognPress(index:number){ // 
      setTextInput(pgObj[scnNum].btnList[index].moji);  //入力欄に表示
      router.push({ pathname: "/configButton", params: { post: scnNum, from: index.toString(), originScn:originScn} });
  }

  function onPressSay(){
    if (textInput.trim() === '') {
      setTextInput('')
      return;
    }
    dispText.splice(0)
    if (iniObj.textOnSpeak) {
      dispText.push(textInput)
      setModalVisible(true)
      Speech.speak(textInput, {
          language: "ja",
          onDone:() => {
            setTimeout(() => { 
              setModalVisible(false);
            }, 1000)
          }
        })
    } else {
      Speech.speak(textInput, {
        language: "ja",
        })
    }
    // if (iniObj.addFreeStack) { //もう一度への蓄積
    //   speakStack.push(textInput)
    //   mojiStack.push(textInput)
    // }
    const isSame = pgObj[scnNum].btnList.findIndex(text => text.moji === textInput) 
    if (isSame === -1) { //同じ内容は記録しない
      let nextDefSeq = pgObj[scnNum].btnList.length
      if (pgObj[scnNum].btnList.length > 0) {
        nextDefSeq = Math.max(...pgObj[scnNum].btnList.map(item => item.defSeq),0)+10
      } 
    pgObj[scnNum].btnList.push({moji:textInput, speak:'', tugi:'', option:' ',
       defSeq:nextDefSeq, usedDt:Date.now(), numUsed:1000 })
      } else {
        pgObj[scnNum].btnList[isSame].numUsed += 1000;
        pgObj[scnNum].btnList[isSame].usedDt = Date.now();
      }
      if (iniObj.freeTextClear) {
        setTextInput('');
      }
      setChangeScrn(!changeScrn);
  }

  function onPressClear(){
     setTextInput('');
  }

  function onLongPressClear(){
    Alert.alert('確認','全てのフリーのボタンをクリアしますか？', [
      { text: 'いいえ', onPress: () => {return} },
      { text: 'はい', onPress: () => { 
        pgObj[scnNum].btnList.splice(0);
        setChangeScrn(!changeScrn);
        }}, ])
  }

  function pgBack(){
    writeFile();
    router.back();
  }

  function pgHome(){
    writeFile();
    router.dismissTo('/')
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView>
          <Stack.Screen options={{
            title: scnNum === freeTextScn?'フリー':'ボタン追加' ,
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight:'bold', fontSize:( Dimensions.get('window').height < 1000 )? 25:40 },
            headerBackButtonDisplayMode:  'minimal' ,
            headerStyle: { backgroundColor: stylesFree.containerBottom.backgroundColor },
            headerRight:  () => ( 
              !isFromConifigScn?
              <Pressable onPressIn={() => {
                writeFile();
                router.push({ pathname: "/configScrn", params: { post: scnNum, from: originScn } });
              }}>
                <View style={[stylesFree.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                  <Text style={{textAlign:'center' }}>フリー設定</Text>
                </View>
              </Pressable>
              :               
              <Pressable onPressIn={() => {
                writeFile();
                router.push({ pathname: "/help", params: { post: scnNum, from: originScn } });
              }}>
                <View style={[stylesFree.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                  <Text style={{textAlign:'center' }}>ヘルプ</Text>
                </View>
              </Pressable>
            ), 
            headerLeft:  () => ( 
              <Pressable onPressIn={() => pgBack()}>
                <View style={[stylesFree.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                  <Text style={{textAlign:'center' }}>　＜　</Text>
                </View>
              </Pressable> ),         
          }} />
        <Modal 
          animationType="slide"
          transparent={true}
          visible={modalVisible} >
          <ScrollView >
          <View style={[stylesFree.centeredView,]}>
              <View style={[stylesFree.modalView,  { height:Dimensions.get('window').height*6/7-20 ,
                  transform:(iniObj.modalTextRotate) ? [{ rotate: '180deg' }] : [] } ] } >
                {(dispText.length === 1 ) ?
                  (dispText.map((moji, index) => <Text key={index} 
                    style={[stylesFree.modalText, {fontSize:findFontSize(scnNum, 3)}]}>{moji}</Text>)) :         
                  (mojiStack.map((moji, index) => <Text key={index} 
                    style={[stylesFree.modalText, {fontSize:findFontSize(scnNum, 3)}]}>{moji}</Text>))
                }
              </View>
              <Pressable onPress={() => {Speech.stop(); setModalVisible(false)}} >
                <View style={[stylesFree.modalButton, { width: Dimensions.get('window').width, 
                    backgroundColor:iniObj.controlButtonColor }]}>
                  <Text style={{ fontSize: findFontSize(scnNum, 3)-6 }}>閉じる</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </Modal>
        <Text style={{fontSize:20, textAlign:'center'}}>{scnNum.toString()+':' + pgObj[scnNum].pgTitle}</Text> 
        <View>
          <TextInput style={[stylesFree.textInput,{width: Dimensions.get('window').width, 
            height:(Dimensions.get('window').height < 1000)?60:140,
            fontSize:findFontSize(scnNum, 3) } ]}
            autoFocus={scnNum===freeTextScn?true:false}
            multiline={true}
            onChangeText={(text)=>setTextInput(text)} 
            value={textInput} />
        </View>
        <View  style={[stylesFree.containerBottom,{width: Dimensions.get('window').width, height:findBottmHeight(scnNum)*0.8+30} ]}>
          <MoveButton name='＜' onPress={() => {pgBack()}}
            width={Dimensions.get('window').width/3-12}/>
          <MoveButton name='クリア' onPress={() => {onPressClear()}} onLongPress={() => {onLongPressClear() }}
            width={ Dimensions.get('window').width/3-12 } />
          <MoveButton name='発声/追加' onPress={() => {onPressSay()}} 
            onLongPress={() => {router.push({ pathname: "/freeText0", params: { post: scnNum, from: 'freeText' } })
            }}
            width={ Dimensions.get('window').width/3-12 } />
        </View>
        <ScrollView >
          <View style={[stylesFree.container, { width: Dimensions.get('window').width }, ]} >
            {pgObj[scnNum].btnList.map((i, index) =>
              <TouchableHighlight key={index} onPress={ () => {toDo(index)}} onLongPress={ () => {onLognPress(index)}}>
                <View style={[stylesFree.button, 
                  { width: findButtonWidth(scnNum), height: findButtonHeight(scnNum) },
                  { backgroundColor: /.*(btncolor|bc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option)? //　ボタン色の指定
                    pgObj[scnNum].btnList[index].option.match(/.*(btncolor|bc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defaultButtonColor },
                  { borderColor: (pgObj[scnNum].btnList[index].tugi !== '') ? 'darkgray' : iniObj.defaultButtonColor }  ]} >
                  <IconInsert index={index} />
                  <Text style={[stylesFree.text, { fontSize: findFontSize(scnNum, pgObj[scnNum].btnList[index].moji.length)  },
                    {color: (/.*(textcolor|tc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option))? //文字色の指定
                      pgObj[scnNum].btnList[index].option.match(/.*(textcolor|tc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defualtTextColor },  ]} >
                    {pgObj[scnNum].btnList[index].moji}
                  </Text>
                </View>
              </TouchableHighlight>  )}
              <View style={[stylesFree.button, {backgroundColor:stylesFree.container.backgroundColor, borderWidth:0, 
                width:Dimensions.get('window').width, height: stylesFree.button.height*2}]} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar backgroundColor={stylesFree.containerBottom.backgroundColor} barStyle="dark-content" />
    </SafeAreaProvider>
  );
  function MoveButton(props:any){
    return (
      <Pressable onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={1000}>
        <View style={[stylesFree.buttonBottom, {backgroundColor:iniObj.controlButtonColor, width:props.width, height:findBottmHeight(scnNum)*0.8 }]}>
          <Text style={{ fontSize:findFontSize(scnNum, 3)-6}}>{props.name}</Text>
        </View>
      </Pressable>
    )
  }
  function IconInsert(props:any){
    let iconName:any = ''
    const matchIconName = pgObj[scnNum].btnList[props.index].option.match(/.*(icon):(.+?)(\s+.*|$)/);
    if (matchIconName !== null && matchIconName[2] !== '') {
      iconName = matchIconName[2].toString()
    }
    let iconColor:any = 'gray'
    const matchIconColor = pgObj[scnNum].btnList[props.index].option.match(/.*(ic):(.+?)(\s+.*|$)/);
    if (matchIconColor !== null && matchIconColor[2] !== '') {
      iconColor = matchIconColor[2].toString()
    }
    if (iconName !== '') {
      return ( <MaterialIcons name={iconName} size={findButtonHeight(scnNum)/2.5} color={iconColor} style={{alignSelf:'center'}}/>  )
    }
    let emojiName = ''
    const matchEmoji = pgObj[scnNum].btnList[props.index].option.match(/.*(emoji):(.+?)(\s+.*|$)/);
    if (matchEmoji !== null && matchEmoji[2] !== '') {
      emojiName = matchEmoji[2].toString()
    }
    if (emojiName !== '') {
      return( <Text style={{fontSize:findButtonHeight(scnNum)/2.5, alignSelf:'center'}}>{emojiName}</Text>)
    }
  }
}

export const stylesFree = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // 左右サイドに空欄なし
//    justifyContent: 'space-around', // 左右サイドに空欄あり
//    justifyContent: 'space-evenly', // 左右サイドに空欄あり(大)
//    columnGap: 10,          //横の間隔
    rowGap: 10,             //縦の間隔
    paddingVertical:5,      //縦の開始位置
    width: Dimensions.get('window').width,
    backgroundColor: '#f2f2f2', 
    },
  button: {
    justifyContent: 'center', //テキストの上下の位置
    backgroundColor: '#dcdcdc',
    borderColor:'#dcdcdc',
    padding: 2,
    paddingHorizontal: 5,
    height: Math.max((Dimensions.get('window').height)/8,80),
    borderRadius: 15,
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
    color: iniObj.defualtTextColor,
    fontSize: 25,
  },
  containerBottom: {
    flexDirection: 'row',
    position: 'relative',
    bottom: 0,
    justifyContent: 'space-between',
    left: 0,
    paddingVertical:5,
    width: Dimensions.get('window').width,
    height: Math.max((Dimensions.get('window').height)/9+20, 60),
    backgroundColor: 'white',

  },
  buttonBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ddff99',
    width: Dimensions.get('window').width/7*2-8,
    // height: Math.max((Dimensions.get('window').height)/9, 50),
    borderRadius: 15,
    borderColor: 'gary',
    borderWidth: 1,   //ここで全ての操作ボタンのボーダーが変わる
    marginTop:10,
  },
  headerButton: {
    backgroundColor:'#ddff99' ,
    width:80, 
    height:40, 
    justifyContent:'center', 
    borderRadius: 15,
    borderColor: 'gray',
    borderWidth: 1,   //ここで全てのヘダーボタンのボーダーが変わる
  },
  textInput: {
    width: Dimensions.get('window').width,
    height: 60,
    borderWidth: 1,
    padding: 5,
    textAlignVertical: 'top',
    fontSize: 20,
  },
  centeredView: {
    alignItems:'center',      //　modalViewの水平位置
  },
  modalView: {
    width:'98%',              // 表示の幅
    marginTop:10,             // 上からの位置
    marginBottom:0,           //　下のボタンとの間隔
    backgroundColor:'whitesmoke',
    borderRadius:15,
    height: Dimensions.get('window').height*6/7-20,
    alignItems:'center',      // 文字の左右位置
    justifyContent: 'center', // 文字の上下位置
  },
  modalText: {
    margin:5,                 //テキストの上下間隔、改行間隔
    fontSize: 32,
  },
  modalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddff99',
    width: Dimensions.get('window').width,
    height: (Dimensions.get('window').height)/6,
    borderRadius: 15,
    borderColor: 'gray',
    borderWidth: 1,  
  },


});
