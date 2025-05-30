import { useIsFocused } from '@react-navigation/native';
import { reloadAppAsync } from "expo";
import { Audio } from 'expo-av';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TouchableHighlight,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GestureRecognizer from 'react-native-swipe-gestures';
import { VolumeManager } from 'react-native-volume-manager';
import {
  buttonSort,
  dispText,
  findButtonHeight,
  findButtonWidth,
  findFontSize,
  iniObj,
  mojiStack,
  pgObj,
  pgStack,
  readInitialFile,
  speakStack,
  writeFile
} from './comFunc';

SplashScreen.preventAutoHideAsync();
export let orgVol = 50 // save system volume level

export default function index(){
  const [scnNum, setScnNum] = useState(0)
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const isFocused = useIsFocused(); //これでrouter.backで戻ってきても再レンダリングされる
  const [changeScrn, setChangeScrn] = useState(true) //再レンダリング用
  const { height, width } = useWindowDimensions();
  const isPortrait = height >= width;
    
  useEffect(() => {  // only once after 1st rendering
    readInitialFile().then(() => { // ここで一旦データはリセットされ以前のデータを読込みます
      setScnNum(0);    // 画面をホームセット
      router.dismissTo('/'); //これをしないと初画面がブランク
//      console.log('AppStartmyVol' + iniObj.myVol.toString());
//      console.log(JSON.stringify(iniObj));// 機種によって（Freetel）はこれが読まれない
      saveVol(); // 音量を保存
      if (iniObj.changeVol) {
        setVol(iniObj.myVol); // 音量をセット
      }
    }) // read後に呼ぶ
    setTimeout(() => { 
      SplashScreen.hideAsync();
    }, 2000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        pgBack();
        return true; // デフォルトの戻る動作を防ぐ
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        backHandler.remove();
      };
    }, [])
  );


async function saveVol(){
  orgVol = (await VolumeManager.getVolume()).volume*100
//  console.log('saved Vol' + orgVol.toString());
}
async function setVol(vol:number) {
//  console.log('new   Vol' + vol.toString());
  await VolumeManager.setVolume(vol/100 ,{showUI: false});
}

// バックグラウンド・フォアグランド切替の際の処理
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
//      if ( appState.current.match(/inactive|background/) && nextAppState === 'active' ) { console.log('App has come to the foreground!');   }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      // console.log('AppState', appState.current);
      if (appState.current === 'active') { 
        saveVol()
        if (iniObj.changeVol) {
          setVol(iniObj.myVol)
        }
      } else {
        if (iniObj.changeVol) {
          setVol(orgVol)/*.then(() => {  //以下のボリューム変更がOPPOで機能しない！！
            console.log('volRest!:' + orgVol.toString()) }) */
        }
        writeFile();
        // writeIniObj();
//        writeFreeText();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

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
      case 'Sound1': playDecision4(); break;
      case 'Sound2': playBeep1(); break;
      case 'Sound3': playDecisoin2(); break;
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
        console.log('speakTimeOut:' + speakText.length);
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
    switch (pgObj[scnNum].btnList[count].tugi) {
      case 'home': pgHome();  break;
      case 'back': pgBack();  break;
      case 'url' : linkWeb(pgObj[scnNum].btnList[count].speak); break;  // webにリンク
      default:
        var regStr = new RegExp(/^[0-9]+$/) // 'Scrn1-Scrn20'
        if(regStr.test(pgObj[scnNum].btnList[count].tugi)){
          const nextPg = parseInt(pgObj[scnNum].btnList[count].tugi)
          if ( nextPg >= pgObj.length ) { // 行く先が未定義の場合
            for ( let i = pgObj.length; i <= nextPg; i++ ) {
              pgObj.push({ pgTitle:'', btnList:[], pgOption:'' })
            }
          }
          pgStack.push(scnNum)
          setScnNum( nextPg )
        } else {
          buttonSort(scnNum); //画面が更新されない
          setChangeScrn(!changeScrn); //画面の強制更新
        }
    }

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
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
//    console.log('left');
    if (scnNum < pgObj.length - 1) {
      setScnNum(scnNum + 1);
    } else {
      pgObj.push({ pgTitle:'', btnList:[], pgOption:'' })
      setScnNum(scnNum + 1);
    }
  }
  function onSwipeRight(){ //右から左にスワイプ、画面ー１、ホームはラストへ
//    console.log('right');
    if (scnNum > 0) {
      setScnNum(scnNum - 1);
    } else {
      setScnNum(pgObj.length - 1)
    }
  }
  
buttonSort(scnNum);

  return (
  <GestureRecognizer
    onSwipeLeft={(state) => onSwipeLeft()}
    onSwipeRight={(state) => onSwipeRight()}
    config={gestureConfig}
    style={{ flex: 1  }} >
    <SafeAreaProvider>
      <SafeAreaView>
          <Stack.Screen options={{
              title: (scnNum !== 0 )? scnNum.toString()+':' + pgObj[scnNum].pgTitle : pgObj[scnNum].pgTitle ,
              headerTitleAlign: 'center',
              headerTitleStyle:{ fontWeight:'bold',  fontSize:( Dimensions.get('window').height < 1000 )? 25:40 },
              headerBackButtonDisplayMode:  'minimal' ,
              headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
              headerRight:  () => (
               <Pressable onPressIn={() => {
                   router.push({ pathname: "/configScrn", params: { post: scnNum, from: 'index' } });
               }}>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                <Text style={{textAlign:'center' }}>設定</Text>
              </View>
            </Pressable> ), 
          headerLeft:  () => ( 
            <Pressable onPressIn={() => pgBack()}>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
                <Text style={{textAlign:'center' }}>　＜　</Text>
              </View>
            </Pressable> ),         
        }} />
        <Modal 
          animationType="slide"
          transparent={true}
          visible={modalVisible} >
          <ScrollView >
          <View style={[styles.centeredView,]}>
              <View style={[styles.modalView,  { height:Dimensions.get('window').height*6/7-20 ,
                  transform:(iniObj.modalTextRotate) ? [{ rotate: '180deg' }] : [] } ] } >
                {(dispText.length === 1 ) ?
                  (dispText.map((moji, index) => <Text key={index} 
                    style={[styles.modalText, {fontSize:findFontSize(scnNum, 3)}]}>{moji}</Text>)) :         
                  (mojiStack.map((moji, index) => <Text key={index} 
                    style={[styles.modalText, {fontSize:findFontSize(scnNum, 3)}]}>{moji}</Text>))
                }
              </View>
              <Pressable onPress={() => {Speech.stop(); setModalVisible(false)}} >
                <View style={[styles.modalButton, { width: Dimensions.get('window').width, 
                    backgroundColor:iniObj.controlButtonColor, }]}>
                  <Text style={{ fontSize: findFontSize(scnNum, 3)-6 }}>閉じる</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </Modal>
            <View style={[styles.button, {backgroundColor:styles.container.backgroundColor, borderWidth:0, 
              width:Dimensions.get('window').width, height: 20}]} />
        <ScrollView >
          <View style={[styles.container, { width: Dimensions.get('window').width }, ]} >
            {pgObj[scnNum].btnList.map((i, index) =>
              <TouchableHighlight key={index} onPress={ () => {toDo(index)}} >
                <View style={[styles.button, 
                  { width: findButtonWidth(scnNum), height: findButtonHeight(scnNum) },
                  { backgroundColor: /.*(btncolor|bc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option)? //　ボタン色の指定
                    pgObj[scnNum].btnList[index].option.match(/.*(btncolor|bc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defaultButtonColor },
                  { borderColor: (pgObj[scnNum].btnList[index].tugi !== '') ? 'darkgray' : iniObj.defaultButtonColor}  ]} >
                  <Text style={[styles.text, { fontSize: findFontSize(scnNum, pgObj[scnNum].btnList[index].moji.length)  },
                    {color: (/.*(textcolor|tc):(.+?)(\s+.*|$)/.test(pgObj[scnNum].btnList[index].option))? //文字色の指定
                      pgObj[scnNum].btnList[index].option.match(/.*(textcolor|tc):(.+?)(\s+.*|$)/)?.[2] : iniObj.defualtTextColor },  ]} >
                    {pgObj[scnNum].btnList[index].moji}
                  </Text>
                </View>
              </TouchableHighlight>  )}
              <View style={[styles.button, {backgroundColor:styles.container.backgroundColor, borderWidth:0, 
                width:Dimensions.get('window').width, height: styles.button.height*1.5}]} />
          </View>
        </ScrollView>
        </SafeAreaView>
        <SafeAreaView  style={[styles.containerBottom,{width: Dimensions.get('window').width, height:findButtonHeight(scnNum) + 50} ]}>
          <View  style={[styles.containerBottom,{width: Dimensions.get('window').width, height:findButtonHeight(scnNum) + 50 } ]}>
          <MoveButton name='＜' onPress={() => {pgBack()}}
            width={Dimensions.get('window').width/4-6}/>
          <MoveButton name='もう一度'  onPress={() => replaySpeak()} onLongPress={() => {
            speakStack.splice(0);
            mojiStack.splice(0);
            playDecisoin2(); }}
            width={Dimensions.get('window').width/4-6}/>
          <MoveButton name='フリー' onPress={() => {
              router.push({ pathname: "/freeText", params: { post: scnNum, from: 'index' } })
            }}
            onLongPress={() => {
              playDecisoin2();
              router.push({ pathname: "/freeText0", params: { post: scnNum, from: 'index' } })
            }}
            width={ Dimensions.get('window').width/4-6 }/>
          <MoveButton name='ホーム' onPress={() => {
              pgHome()
            }} 
            width={ Dimensions.get('window').width/4-6 } />
        </View>
        <StatusBar backgroundColor={styles.containerBottom.backgroundColor} barStyle="dark-content" />
      </SafeAreaView>
    </SafeAreaProvider>
  </GestureRecognizer>
  );

  function MoveButton(props:any){
    return (
      <Pressable onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={1000}>
        <View style={[styles.buttonBottom, {backgroundColor:iniObj.controlButtonColor, 
          width:props.width, height:findButtonHeight(scnNum)}]}>
          <Text style={{ fontSize: findFontSize(scnNum, 3)-6}}>{props.name}</Text>
        </View>
      </Pressable>
    )
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
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-between',
    left: 0,
    paddingVertical:10,
    width: Dimensions.get('window').width,
    height: (Dimensions.get('window').height-230)/6 + 30,
    backgroundColor: 'white',
    },
  buttonBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ddff99',
    width: Dimensions.get('window').width/7*2-8,
    height: Math.max((Dimensions.get('window').height)/8, 70),
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
