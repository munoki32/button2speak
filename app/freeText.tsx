import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, StatusBar, BackHandler, Pressable, Dimensions, StyleSheet, useWindowDimensions,
  AppState, Text, TouchableHighlight, View, ScrollView, Linking, Alert, TextInput, 
  KeyboardAvoidingView} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { pgObj, iniObj, writeFile, freeTextScn, dispText, speakStack, mojiStack,
  findButtonWidth, findButtonHeight, findFontSize, buttonSort } from './comFunc'
import { useIsFocused } from '@react-navigation/native';
import { KeyboardAwareScrollView  } from 'react-native-keyboard-aware-scroll-view';

export default function freeText(){
  const [textInput, setTextInput] = useState('');  // for TextInput area 初期値
  const router = useRouter();
  const isFocused = useIsFocused(); //これでrouter.backで戻ってきても再レンダリングされる
  const [changeScrn, setChangeScrn] = useState(true) //再レンダリング用
  const { height, width } = useWindowDimensions();
  const isPortrait = height >= width;
  const [modalVisible, setModalVisible] = useState(false);
  
  const { post, from } = useLocalSearchParams();  //  呼び出しの画面番号を受け取る
  let scnNum =freeTextScn;
  // if (post) {
  //   scnNum = Number(post);
  // } else {
  //   console.log('Err: freeText No post number');
  //   scnNum = 0;
  // };
  
  function toDo(count:number) {   //発声ボタンが押された時の処理
    let speakText = pgObj[scnNum].btnList[count].moji
    pgObj[scnNum].btnList[count].numUsed += 1000;
    pgObj[scnNum].btnList[count].usedDt = Date.now();
    if (speakText !== '') {       
      dispText.splice(0)
      if (iniObj.textOnSpeak) {
        dispText.push(speakText)
        setModalVisible(true)
        Speech.speak(speakText, {
            language: "ja",
            onDone:() => {
              setTimeout(() => { 
                setModalVisible(false);
              }, 1000)
            }
          })
      } else {
          Speech.speak(speakText, {
            language: "ja",
          })
      }
      // if (iniObj.addFreeStack) { //もう一度への蓄積
      //   speakStack.push(textInput)
      //   mojiStack.push(textInput)
      // }
      setTextInput(speakText);
    }
  } // end of toDo

  function onLognPress(index:number){ //  ボタンを消す
    pgObj[scnNum].btnList.splice(index, 1);
    setChangeScrn(!changeScrn);
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
        nextDefSeq = Math.max(...pgObj[scnNum].btnList.map(item => item.defSeq),0)+1
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
  buttonSort(scnNum);

  return (
    <SafeAreaProvider>
      <SafeAreaView>
          <Stack.Screen options={{
              title: pgObj[scnNum].pgTitle ,
              headerTitleAlign: 'center',
              headerTitleStyle: { fontWeight:'bold', fontSize:( Dimensions.get('window').height < 1000 )? 25:40 },
              headerBackButtonDisplayMode:  'minimal' ,
              headerStyle: { backgroundColor: stylesFree.containerBottom.backgroundColor },
              headerRight:  () => (
               <Pressable onPressIn={() => {
                  writeFile();
                  router.push({ pathname: "/configScrn", params: { post: scnNum, from: 'index' } });
               }}>
               <View style={[stylesFree.headerButton, {backgroundColor:iniObj.controlButtonColor, }]}>
               <Text style={{textAlign:'center' }}>設定</Text>
              </View>
            </Pressable> ), 
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
        <View>
          <TextInput style={[stylesFree.textInput,{width: Dimensions.get('window').width, 
            height:(Dimensions.get('window').height < 1000)?80:160,
            fontSize:findFontSize(scnNum, 3) } ]}
            autoFocus={true}
            multiline={true}
            onChangeText={(text)=>setTextInput(text)} 
            value={textInput} />
        </View>
        <View  style={[stylesFree.containerBottom,{width: Dimensions.get('window').width, height:findButtonHeight(scnNum)+20} ]}>
          <MoveButton name='＜' onPress={() => {pgBack()}}
            width={Dimensions.get('window').width/3-6}/>
          <MoveButton name='クリア' onPress={() => {onPressClear()}} onLongPress={() => {onLongPressClear() }}
            width={ Dimensions.get('window').width/3-6 } />
          <MoveButton name='発声' onPress={() => {onPressSay()}}
            width={ Dimensions.get('window').width/3-6 } />
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
        <View style={[stylesFree.buttonBottom, {backgroundColor:iniObj.controlButtonColor, width:props.width, height:findButtonHeight(scnNum) }]}>
          <Text style={{ fontSize:findFontSize(scnNum, 3)-6}}>{props.name}</Text>
        </View>
      </Pressable>
    )
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
    marginTop:5,
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
    height: 80,
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
