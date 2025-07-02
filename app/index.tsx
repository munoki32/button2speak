import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import { reloadAppAsync } from "expo";
import { Audio, InterruptionModeAndroid } from 'expo-av';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, AppState, BackHandler, Dimensions, Linking, Modal, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Text, TouchableHighlight, useWindowDimensions, View
} from 'react-native';
// import Purchases from 'react-native-purchases';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GestureRecognizer from 'react-native-swipe-gestures';
import { VolumeManager } from 'react-native-volume-manager';
import {
  buttonSort, dispText,
  findButtonHeight, findButtonWidth,
  findFontSize, iniObj, mojiStack, pgObj, pgStack, readInitialFile, speakStack,
  writeFile, writeLog
} from './comFunc';
// import Purchases, {
//   CustomerInfo, PurchasesOffering, PurchasesPackage
// } from 'react-native-purchases';

SplashScreen.preventAutoHideAsync();
export let orgVol = 0 // save system volume level

export default function index(){
  const [scnNum, setScnNum] = useState(0)
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const isFocused = useIsFocused(); //これでrouter.backで戻ってきても再レンダリングされる
  const [changeScrn, setChangeScrn] = useState(true) //再レンダリング用
  const { height, width } = useWindowDimensions();
  const isPortrait = height >= width;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  useEffect(() => {  // only once after 1st rendering

      // if (Platform.OS === 'ios') {
      //   Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      // }
      // if (Platform.OS === 'ios') {
      //   Purchases.configure({apiKey: 'appl_jdpXVGjdWJBVuRGkicsZOXBmPXv' });
      // } else if (Platform.OS === 'android') {
      //   // Purchases.configure({apiKey: 'appl_dcSptaIsDjlXUHVvpyeDSkNXLpA'});
      // } 

      readInitialFile().then(() => { // ここで一旦データはリセットされ以前のデータを読込みます
      setScnNum(0);    // 画面をホームセット
      router.dismissTo('/'); //これをしないと初画面がブランク
//      writeLog( 0, 'AppStartmyVol' + iniObj.myVol.toString());
//      writeLog( 0, JSON.stringify(iniObj));// 機種によって（Freetel）はこれが読まれない
      writeLog( 0, 'Start LogLevel:' + iniObj.logLevel.toString())
      if(Platform.OS !== 'ios') {saveVol();} // 音量を保存　  iosはActiveで呼ばれる
      aquireAudio(); // for android
      // if (iniObj.changeVol) {
      //   setVol(iniObj.myVol); // 音量をセット
      // }
    }) // read後に呼ぶ
    setTimeout(() => { 
      SplashScreen.hideAsync();
    }, 2000);
  }, []);

  useFocusEffect(  // バックハンドラーを設定
    useCallback(() => {
      const onBackPress = () => {
        pgBack();
        return true; // デフォルトの戻る動作を防ぐ
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        // BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        backHandler.remove();
      };
    }, [])
  );

// バックグラウンド・フォアグランド切替の際の処理
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
//      if ( appState.current.match(/inactive|background/) && nextAppState === 'active' ) { writeLog( 0, 'App has come to the foreground!');   }
      appState.current = nextAppState;
      // writeLog( 0, 'AppState', appState.current);
      if (appState.current === 'active') { 
        writeLog( 0, 'Active:' + orgVol.toString())
        saveVol()
        aquireAudio(); // for android
      } else {
        writeLog( 0, 'Deactive:'+orgVol.toString())
        if (iniObj.changeVol) {
          setVol(orgVol)/*.then(() => {  //以下のボリューム変更がOPPOで機能しない！！
            writeLog( 0, 'volRest!:' + orgVol.toString()) }) */
        }
        VolumeManager.setActive(false, true) // ios OK release audio
        releaseAudio(); // for android
        writeFile();
      }
    });
    return () => {
      subscription.remove();
       releaseAudio();  // for android
    };
  }, []);

  const aquireAudio = async () => { // アンドロイドでバックグラウンドの音楽を止める
    if (Platform.OS !== 'android') { return; }
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(require('../assets/Decision2.mp3'));
      setSound(sound);
      await sound.playAsync()

    } catch (e) {
      console.warn('Silent playback failed:', e);
    }
  };

  const releaseAudio = async () => { // resutor Audio (not work now)
    if (Platform.OS !== 'android') { return; }
    await sound?.unloadAsync();
  }

async function saveVol(){
  const { volume } = await VolumeManager.getVolume();
  orgVol = volume*100
  writeLog( 0, 'saveVol:' + orgVol.toString().substring(0,5))
  VolumeManager.setCategory('SoloAmbient', false)
  VolumeManager.setMode('SpokenAudio')
  VolumeManager.setActive(true, true)
  if (iniObj.changeVol) {
    setVol(iniObj.myVol)
  }
//  writeLog( 0, 'saved Vol' + orgVol.toString());
}

async function setVol(vol:number) {
//  writeLog( 0, 'new   Vol' + vol.toString());
  writeLog( 0, 'setVolto.:' + vol.toString().substring(0,5))
  VolumeManager.setVolume(vol/100 ,{showUI: false})
  const { volume } = await VolumeManager.getVolume();
  writeLog( 0, 'setVolend:' + (volume*100).toString().substring(0,5))
}

  function toDo(index:number){
    let matchText = pgObj[scnNum].btnList[index].option.match(/.*(lpr):(.+?)(\s+.*|$)/); // 長押しが必要
    if (matchText !== null && matchText[2] !== '' && matchText[2] === 'true') { return }
    toDoSpeak(index)
  }

  function toDoSpeak(index:number) {   //発声ボタンが押された時の処理
    // if(iniObj.changeVol === true) {setVol(iniObj.myVol)}
    if (scnNum === 0) {
      speakStack.splice(0);
      mojiStack.splice(0);
    }
    let speakText = ''
    dispText.splice(0)
    pgObj[scnNum].btnList[index].numUsed += 1000;
    pgObj[scnNum].btnList[index].usedDt = Date.now();
    switch (pgObj[scnNum].btnList[index].speak) {
      case 'na': ; break;
      case 'Sound1': playDecision4(); break;
      case 'Sound2': playBeep1(); break;
      case 'Sound3': playDecisoin2(); break;
      case '': 
        speakText = pgObj[scnNum].btnList[index].moji;
        break;
      default: 
        if (pgObj[scnNum].btnList[index].tugi === 'url') break;
        speakText = pgObj[scnNum].btnList[index].speak
    }
    if (speakText !== '') {
      speakStack.push(speakText)
      mojiStack.push(pgObj[scnNum].btnList[index].moji)
      // Speech.stop();
      const timeOutId = setTimeout(() => {
        // writeLog( 0, 'speakTimeOut:' + speakText.length);
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
          dispText.push(pgObj[scnNum].btnList[index].moji)
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
    // setVol(orgVol);
    switch (pgObj[scnNum].btnList[index].tugi) {
      case 'home': pgHome();  break;
      case 'back': pgBack();  break;
      case 'url' : linkWeb(pgObj[scnNum].btnList[index].speak); break;  // webにリンク
      default:
        var regStr = new RegExp(/^[0-9]+$/) // 'Scrn1-Scrn20'
        if(regStr.test(pgObj[scnNum].btnList[index].tugi)){
          const nextPg = parseInt(pgObj[scnNum].btnList[index].tugi)
          if ( nextPg >= pgObj.length ) { // 行く先が未定義の場合
            for ( let i = pgObj.length; i <= nextPg; i++ ) {
              pgObj.push({ pgTitle:pgObj[scnNum].btnList[index].moji, btnList:[], pgOption:'' })
            }
          }
          pgStack.push(scnNum)
          setScnNum( nextPg )
        }
    }
    buttonSort(scnNum)
    setChangeScrn(!changeScrn); //画面の強制更新

  } // end of toDo

  function pgBack(){
    if (pgStack.length > 0) {
      let backPg:number;
      backPg = pgStack[pgStack.length-1]
      pgStack.pop();
      setScnNum(backPg);
    } else {
      setScnNum(0)
    }
  }

  function pgHome(){
    if (scnNum !== 0 ) {
      pgStack.push(scnNum)
      setScnNum(0)  }
  }

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
  //　発声関係設定
  //const speak = (words:string) => { Speech.speak( words, { language:"ja", volume:1, rate:0.7 } ) }
  // mp4再生

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
//  Webへのリンク
  function linkWeb(url: string){
    Linking.openURL(url).catch(err => console.error('URLを開けませんでした。', err));
  }

  const gestureConfig = { 
    velocityThreshold: 2,  //0.3, Velocity that has to be breached in order for swipe to be triggered (vx and vy properties of gestureState)
    directionalOffsetThreshold: 80,  //80 Absolute offset that shouldn't be breached for swipe to be triggered (dy for horizontal swipe, dx for vertical swipe)
//    isClickThreshold: 5, //5  Absolute distance that should be breached for the gesture to not be considered a click (dx or dy properties of gestureState)
  };
  function onSwipeLeft(){ //左から右へのスワイプ、画面次　なければ追加
//    writeLog( 0, 'left');
    if (scnNum < pgObj.length - 1) {
      setScnNum(scnNum + 1);
    } else {
      pgObj.push({ pgTitle:'', btnList:[], pgOption:'' })
      setScnNum(scnNum + 1);
    }
  }
  function onSwipeRight(){ //右から左にスワイプ、画面ー１、ホームはラストへ
//    writeLog( 0, 'right');
    if (scnNum > 0) {
      setScnNum(scnNum - 1);
    } else {
      setScnNum(pgObj.length - 1)
    }
  }
  function onConfigScrn(){ //　上のスワイプ
//    writeLog( 0, 'UP');
      router.push({ pathname: "/configScrn", params: { post: scnNum } });
  }  

  function onLognPress(index:number){ //  ボタン編集
    let matchText = pgObj[scnNum].btnList[index].option.match(/.*(conf):(.+?)(\s+.*|$)/); // 止まらない
    if (matchText !== null && matchText[2] !== '' && matchText[2] === 'true') {
      // writeLog( 0, 'onLongPress:' + matchText[2]);
      toDoSpeak(index)
    } else {
      // router.push({ pathname: "/editButton", params: { post: scnNum, from: index, originScn:-2 } }); 
      toDoSpeak(index)
    }
  }

  return (
  <GestureRecognizer
    onSwipeLeft={(state) => onSwipeLeft()}
    onSwipeRight={(state) => onSwipeRight()}
    config={gestureConfig}
    style={{ flex: 1  }} >
    <SafeAreaProvider>
      <SafeAreaView>
        <Stack.Screen options={{
          headerTitle: () => (
            <Pressable onLongPress={() => router.push({ pathname: "/helpIndex", params: { post: scnNum, from: 'index' } })}>
              <View style={styles.headerTitle}>
                <Text style={styles.headerText}>
                  {pgObj[scnNum].pgTitle}</Text>
              </View>
            </Pressable>
          ),
          headerBackButtonDisplayMode:  'minimal' ,
          headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
          headerRight:  () => (
            <Pressable 
              onPress={() => { router.push({ pathname: "/configApp", params: { post: scnNum, from: 'index' } }); }}
              onLongPress={() => {router.push({ pathname: "/configScrn", params: { post: scnNum, from: 'index' } });}}>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                <Text style={{textAlign:'center' }}>設定</Text>
              </View>
            </Pressable> ), 
          headerLeft:  () => ( 
            <Pressable onPress={() => pgBack()}>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                <Text style={{textAlign:'center' }}>＜</Text>
              </View>
            </Pressable> ),         
        }} />
        <Modal 
          animationType="slide"
          transparent={true}
          visible={modalVisible} >
            <View style={[styles.modalView,  { height:Dimensions.get('window').height-styles.modalButton.height-70 ,
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
                  backgroundColor:iniObj.controlButtonColor, }]}>
                <Text style={{ fontSize: findFontSize(scnNum, 3)-6 }}>閉じる</Text>
              </View>
            </Pressable>
          </View>
        </Modal>
        <View style={[styles.button, {backgroundColor:styles.container.backgroundColor, borderWidth:0, 
          width:Dimensions.get('window').width, height: 20}]} />
        <ScrollView >
          <View style={[styles.container, { width: Dimensions.get('window').width }, ]} >
            {pgObj[scnNum].btnList.map((i, index) =>
              <TouchableHighlight key={index} onPress={() => {toDo(index)}} onLongPress={() => {onLognPress(index)}} >
                <View style={[styles.button, 
                  { width: findButtonWidth(scnNum), height: findButtonHeight(scnNum) },
                  { backgroundColor: /.*(btncolor|bc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option)? //　ボタン色の指定
                    pgObj[scnNum].btnList[index].option.match(/.*(btncolor|bc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defaultButtonColor },
                  { borderColor: (pgObj[scnNum].btnList[index].tugi !== '') ? 'darkgray' : iniObj.defaultButtonColor}  ]} >
                  <IconInsert index={index} />
                  <Text style={[styles.text, { fontSize: findFontSize(scnNum, pgObj[scnNum].btnList[index].moji.length)  },
                    {color: (/.*(textcolor|tc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option))? //文字色の指定
                      pgObj[scnNum].btnList[index].option.match(/.*(textcolor|tc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defualtTextColor },  ]} >
                    {pgObj[scnNum].btnList[index].moji}
                  </Text>
                </View>
              </TouchableHighlight>  )}
              <TouchableHighlight onLongPress={() => {router.push({ pathname: "/freeText", params: { post: scnNum, from: 'configScrn' } })} }>
                <View style={[styles.button, {backgroundColor:styles.container.backgroundColor, borderWidth:0, 
                  width:Dimensions.get('window').width, height: styles.button.height*2, justifyContent:'flex-start' }]} >
                  <Text style={{textAlign:'center', color:'#d3d3d3'}}>ボタン追加/編集</Text>
                </View>
              </TouchableHighlight>
          </View>
        </ScrollView>
        </SafeAreaView>
        <SafeAreaView style={styles.containerBottom}>
          <MoveButton name='＜' onPress={() => {pgBack()}}
            width={Dimensions.get('window').width/4-12}/>
          <MoveButton name='もう一度'  onPress={() => replaySpeak()} onLongPress={() => {
            speakStack.splice(0);
            mojiStack.splice(0);
            playDecisoin2(); }}
            width={Dimensions.get('window').width/4-12}/>
          <MoveButton name='フリー' onPress={() => { router.push({ pathname: "/freeText", params: { post: scnNum, from: 'index' } }) }}
            onLongPress={() => {
              router.push({ pathname: "/freeText", params: { post: scnNum, from: 'index' } })
              // onConfigScrn()  
            }} 
            width={ Dimensions.get('window').width/4-12 }/>
          <MoveButton name='ホーム' onPress={() => {
              pgHome()
            }} 
            width={ Dimensions.get('window').width/4-12 } />
        <StatusBar backgroundColor={styles.containerBottom.backgroundColor} barStyle="dark-content" />
      </SafeAreaView>
    </SafeAreaProvider>
  </GestureRecognizer>
  );

  function MoveButton(props:any){
    return (
      <Pressable onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={1000}>
        <View style={[styles.buttonBottom, {backgroundColor:iniObj.controlButtonColor, 
          width:props.width, }]}>
          <Text style={{ fontSize: findFontSize(scnNum, 3)-6}}>{props.name}</Text>
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

export const styles = StyleSheet.create({
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
    flexWrap: 'wrap',
    rowGap: 10,             //縦の間隔
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-between',
    left: 0,
    paddingVertical:10,
    width: Dimensions.get('window').width,
    // height: (Dimensions.get('window').height-230)/6 + 15,
    backgroundColor: 'white',
    },
  buttonBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ddff99',
    width: Dimensions.get('window').width/7*2-8,
    height: (Dimensions.get('window').height-230)/6 ,
    borderRadius: 15,
    borderColor: 'gary',
    borderWidth: 1,   //ここで全ての操作ボタンのボーダーが変わる
  },
  headerTitle: {
    width:Dimensions.get('window').width < 1000? 170:300,
    height:35,
    alignItems:'center',
    justifyContent:'center',
  },
  headerText: {
    // alignSelf:'center', 
    // textAlignVertical:'center',
    // fontWeight:'bold',
    fontSize:( Dimensions.get('window').height < 1000 )? 22:32
  },
  headerButton: {
    backgroundColor:'#ddff99' ,
    width:80, 
    height:35, 
    justifyContent:'center', 
    alignContent:'center',
    borderRadius: 15,
    borderColor: 'gray',
    borderWidth: 1,   //ここで全てのヘダーボタンのボーダーが変わる
  },
  modalView: {
    width:'100%',              // 表示の幅
    marginTop:5,             // 上からの位置
    marginBottom:0,           //　下のボタンとの間隔
    backgroundColor:'whitesmoke',
    borderRadius:15,
    // height: Dimensions.get('window').height,
    alignItems:'center',      // 文字の左右位置
    justifyContent: 'center', // 文字の上下位置
  },
  modalText: {
    margin:5,                 //テキストの上下間隔、改行間隔
    fontSize: 32,
    textAlignVertical:'center',
    // alignSelf:'center',
  },
  modalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddff99',
    width: Dimensions.get('window').width,
    height: (Dimensions.get('window').height)/8,
    borderRadius: 15,
    borderColor: 'gray',
    borderWidth: 1,  
  },

});
