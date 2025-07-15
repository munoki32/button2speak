import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import { reloadAppAsync } from "expo";
import { Audio } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Dimensions, Modal, Pressable, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableHighlight, View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  buttonSort, dispText, findBottmHeight, findButtonHeight, findButtonWidth,
  findFontSize, iniObj, mojiStack, pgObj, speakStack, writeFile, writeLog,
} from './comFunc';
import { styles } from './index';

export let freeTextScn = 14; // フリーテキストに使用している画面番号

export default function freeText(){ // フリー・ボタン追加/編集

  const [textInput, setTextInput] = useState('');  // for TextInput area 初期値
  const router = useRouter();
  const isFocused = useIsFocused(); //これでrouter.backで戻ってきても再レンダリングされる
  const [changeScrn, setChangeScrn] = useState(true) //再レンダリング用
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
   
  const { post, from } = useLocalSearchParams();  //  呼び出しの画面番号を受け取る
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog(20, 'Err: freeText No post number');
    scnNum = 0;
  };
  const originScn = scnNum; // save original screen  
  freeTextScn = pgObj.findIndex(text => text.pgTitle === 'フリー') // find free text screen
  // writeLog(10, 'findFreeTextScreen:' + freeTextScn);
  if (freeTextScn < 0) { // no free text screen
    pgObj.push({ pgTitle:'フリー', btnList:[], pgOption:'sort:dat row:8' }); // フリー画面の初期値
    freeTextScn = pgObj.length - 1;
  } 
  scnNum = freeTextScn;  // セット　フリーテキストモード
  buttonSort(scnNum);  // 20250616 sort after say

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
    const timeOutId = setTimeout(() => {  // 時間監視セット
      writeLog(20, 'speakTimeOut:' + speakText.length);
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
    if (iniObj.textOnSpeak) { // 表示有り
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
      } else { // 表示なし
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
} // end of toDo
  
  function onLognPress(index:number){ // 
      setTextInput(pgObj[scnNum].btnList[index].moji);  //入力欄に表示
      router.push({ pathname: "/editButton", params: { post: scnNum, from: index.toString(), originScn:originScn} });
  }

  function onPressSay(){ // 発声・追加ボタン
    if (textInput.trim() === '') {
      setTextInput('')
      return;
    }
    dispText.splice(0)
    if (iniObj.textOnSpeak) {  // 表示する
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
    } else { // 表示しない
      Speech.speak(textInput, {
        language: "ja",
        })
    }
    //もう一度への蓄積
    speakStack.push(textInput)
    mojiStack.push(textInput)
    //
    const isSame = pgObj[scnNum].btnList.findIndex(text => text.moji === textInput) 
    if (isSame === -1) { //同じ内容は記録しない
      pgObj[scnNum].btnList.push({moji:textInput, speak:'', tugi:'', option:' ',
        defSeq:-999, usedDt:Date.now(), numUsed:1000 }) // 最初のエントリーに定義
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1).map((item,i)=> item.defSeq = i*10+10)
    } else {
      pgObj[scnNum].btnList[isSame].numUsed += 1000;
      pgObj[scnNum].btnList[isSame].usedDt = Date.now();
    }
    if (iniObj.freeTextClear) {  // クリアする
      setTextInput('');
    } else { // クリアしない（画面の更新）
      setChangeScrn(!changeScrn)
    }
    // setChangeScrn(!changeScrn);
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
    router.dismissTo({pathname:'/', params: {post: scnNum, from:'freeText'}})
  }

  const textInputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    textInputRef.current?.focus();
  };

  async function replaySpeak(){
    let speakText = ''
    dispText.splice(0)
    if (speakStack.length > 0) { 
      Speech.stop()   //発声中にもう一度を押すと、モーダルが前の発声で閉じる問題の対応　25.04.02
      setModalVisible(true)
      speakStack.map((txt) => speakText += txt + ',') // 発音内容を一列につなぐ
      if (iniObj.replayScrnHold) {
        Speech.speak(speakText, {
          language: "ja",
          onDone: () => { 
          }
        });
      } else {
        Speech.speak(speakText, {
            language: "ja",
            onDone:() => {
              setTimeout(() => { 
              setModalVisible(false);
            }, 1000)}
        })
      }
    } else { playBeep1(); }
  }
  async function playDecision4() {
    const { sound } = await Audio.Sound.createAsync(require('../assets/Decision4.mp3'));
    setSound(sound);
    await sound.playAsync();  }
  async function playBeep1() {
    const { sound } = await Audio.Sound.createAsync(require('../assets/Beep1.mp3'));
    setSound(sound);
    await sound.playAsync();  }
  async function playDecisoin2() {
    const { sound } = await Audio.Sound.createAsync(require('../assets/Decision2.mp3'));
    setSound(sound);
    await sound.playAsync();  }
  useEffect(() => { return sound ? () => { sound.unloadAsync(); } : undefined; }, [sound]);

  return (
    <SafeAreaProvider>
      <SafeAreaView>
          <Stack.Screen options={{
            headerTitle: () => (
              <Pressable onLongPress={() => {
                writeFile();
                router.push({ pathname: "/helpFreeText", params: { post: scnNum, from: originScn } })
              }} >
              <View style={styles.headerTitle}>
                <Text style={styles.headerText}>フリー</Text>
              </View>
              </Pressable>
            ),
            headerBackButtonDisplayMode:  'minimal' ,
            headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
            headerRight:  () => ( 
              <Pressable onPress={() => {
                writeFile();
                  router.push({ pathname: "/configScrn", params: { post: scnNum, from: originScn } }) // フリーの設定
                }} >
                <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                  <Text style={{textAlign:'center' }}>設定</Text>
                </View>
              </Pressable>
            ), 
            headerLeft:  () => ( 
              <Pressable onPress={() => pgBack()}>
                <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                  <Text style={{textAlign:'center' }}>　＜　</Text>
                </View>
              </Pressable> ),         
          }} />
        <Modal 
          animationType="slide"
          transparent={true}
          visible={modalVisible} >
            <View style={[styles.modalView,  
            { height:Dimensions.get('window').height-styles.modalButton.height ,
                transform:(iniObj.modalTextRotate) ? [{ rotate: '180deg' }] : [] } ] } >
              {(dispText.length === 1 ) ?
                (dispText.map((moji, index) => <Text key={index} 
                  style={[styles.modalText, {fontSize:findFontSize(scnNum, 3)}]}>{moji}</Text>)) :         
                (mojiStack.map((moji, index) => <Text key={index} 
                  style={[styles.modalText, {fontSize:findFontSize(scnNum, 3)}]}>{moji}</Text>))
              }
            </View>
            <View style={[styles.modalView]}>
              <Pressable onPress={() => {Speech.stop(); setModalVisible(false)}} >
                <View style={[styles.modalButton, { width: Dimensions.get('window').width, 
                    backgroundColor:iniObj.controlButtonColor }]}>
                  <Text style={{ fontSize: findFontSize(scnNum, 3)-6 }}>閉じる</Text>
                </View>
              </Pressable>
            </View>
        </Modal>
        <View>
          <TextInput style={[stylesFree.textInput,{width: Dimensions.get('window').width, 
            height:(Dimensions.get('window').height < 1000)?60:140,
            fontSize:findFontSize(scnNum, 3) } ]}
            ref={textInputRef}
            autoFocus={scnNum===freeTextScn?true:false}
            multiline={true}
            onChangeText={(text)=>setTextInput(text)} 
            value={textInput} 
            />
        </View>
        <View  style={[stylesFree.containerMiddle,{width: Dimensions.get('window').width, height:findBottmHeight(scnNum)*0.8+30} ]}>
          <MoveButton name='＜' onPress={() => {pgBack()}}
            width={Dimensions.get('window').width/4-12}/>
          <MoveButton name='もう一度' 
            onPress={() => { replaySpeak();}}
            onLongPress={() => {
                         speakStack.splice(0);
                         mojiStack.splice(0);
                         playDecisoin2(); }}
            width={ Dimensions.get('window').width/4-12 } />
          <MoveButton name='クリア' 
            onPress={() => {
              setTextInput('');
              handleFocus(); }} 
            onLongPress={() => {onLongPressClear() }}
            width={ Dimensions.get('window').width/4-12 } />
          <MoveButton name='発声/追加' 
            onPress={() => {
              handleFocus();
              onPressSay()}} 
            width={ Dimensions.get('window').width/4-12 } />
        </View>
        <ScrollView >
          <View style={[styles.container, { width: Dimensions.get('window').width }, ]} >
            {pgObj[scnNum].btnList.map((i, index) =>
              <TouchableHighlight key={index} onPress={ () => {toDo(index)}} onLongPress={ () => {onLognPress(index)}}>
                <View style={[styles.button, 
                  { width: findButtonWidth(scnNum), height: findButtonHeight(scnNum) },
                  { backgroundColor: /.*(btncolor|bc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option)? //　ボタン色の指定
                    pgObj[scnNum].btnList[index].option.match(/.*(btncolor|bc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defaultButtonColor },
                  { borderColor: (pgObj[scnNum].btnList[index].tugi !== '') ? 'darkgray' : iniObj.defaultButtonColor }  ]} >
                  <IconInsert index={index} />
                  <Text style={[styles.text, { fontSize: findFontSize(scnNum, pgObj[scnNum].btnList[index].moji.length)  },
                    {color: (/.*(textcolor|tc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option))? //文字色の指定
                      pgObj[scnNum].btnList[index].option.match(/.*(textcolor|tc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defualtTextColor },  ]} >
                    {pgObj[scnNum].btnList[index].moji}
                  </Text>
                </View>
              </TouchableHighlight>  )}
              <View style={[styles.button, {backgroundColor:styles.container.backgroundColor, borderWidth:0, 
                width:Dimensions.get('window').width, height: styles.button.height*2}]} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar backgroundColor={styles.containerBottom.backgroundColor} barStyle="dark-content" />
    </SafeAreaProvider>
  );
  function MoveButton(props:any){
    return (
      <Pressable onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={1000}>
        <View style={[styles.buttonBottom, {backgroundColor:iniObj.controlButtonColor, width:props.width, height:findBottmHeight(scnNum)*0.8 }]}>
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
  textInput: {
    width: Dimensions.get('window').width,
    height: 60,
    borderWidth: 1,
    padding: 5,
    textAlignVertical: 'top',
    fontSize: 20,
  },
  containerMiddle: {
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
});
