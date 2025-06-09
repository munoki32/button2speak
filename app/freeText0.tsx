import React from 'react';
import { ScrollView, Modal, Pressable, Dimensions, StyleSheet, Text, 
  View, Button, TextInput, Alert, TouchableHighlight, Platform, useWindowDimensions } from 'react-native';
import { useRouter, Stack, useLocalSearchParams,  } from 'expo-router';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import RNPickerSelect from 'react-native-picker-select';
import * as FileSystem from 'expo-file-system';
import { iniObj, speakStack, dispText, mojiStack, writeFreeText, freeText, writeLog } from './comFunc';
import { Audio } from 'expo-av';
import { styles } from './index';

export default function freeTextSpeak(){
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const router = useRouter();
  const [textInput, setTextInput] = useState((iniObj.freeTextClear ) ? '':freeText[freeText.length - 1 ].value);  // for TextInput area 初期値
  const [selectValue, setSelectValue] = useState((iniObj.freeTextClear ) ? '' :freeText[freeText.length - 1 ].value); //最後の値を表示
  const [modalVisible, setModalVisible] = useState(false);

  const { post, from } = useLocalSearchParams();  //  呼び出しの画面番号を受け取る
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog( 0, 'Err: freeText No post number');
    scnNum = 0;
  };
  if (from) { 
    // writeLog( 0, 'freeText: from ' + from );
  }
  
  function onPressSay(){ 
//    writeLog( 0, text0 + '\n')
    if (textInput !== '') {
      dispText.splice(0)
      if (iniObj.textOnSpeak) { 
        dispText.push(textInput)
        setModalVisible(true) 
        Speech.speak(textInput, {
          language: "ja",
          onDone:() => {setTimeout(() => { 
            setModalVisible(false);
          }, 1000)}})
      } else {
        Speech.speak(textInput, {  language: "ja", })
      }
      if (iniObj.addFreeStack) { 
//        if (scnNum === 0) {speakStack.splice(0)} //ホーム画面では発声後最後のみ記録
        speakStack.push(textInput)
        mojiStack.push(textInput)
      }
      if (freeText.findIndex(text => text.value === textInput) === -1) { //同じ内容は記録しない
        // writeLog( 0, 'onPressSay:' + textInput);
        // freeText.push({ key:Math.max(...freeText.map(item => item.key))+1, label:textInput, value:textInput});
        freeText.push({ key:freeText.length, label:textInput, value:textInput});
        // writeLog( 0, 'onPressSay:' + freeText[freeText.length-1].label + freeText.length);
        writeFreeText();
      }
      if (iniObj.freeTextClear) {
        setTextInput('');
        setSelectValue('');
      }
    }
//    writeLog( 0, 'freeText:' + iniObj.speakText + '\n')
  }

  function onPressDel(){
    Alert.alert('確認','履歴を全てクリアしますか？',[
      { text: 'いいえ', onPress: () => {return} },
      { text: 'はい', onPress: () => {
        freeText.splice(0);
        freeText.push({ key:0, label: '', value: '' }) 
        setTextInput('');     //これで再レンダリングされる
        setSelectValue('');  //これで再レンダリングされる
      }},])
      writeFreeText();
  }

  function onPressDelItem(){
    writeLog( 0, 'onPressDelItem' + selectValue);
    const itemIndex = freeText.findIndex(text => text.value === textInput)
    if (itemIndex > -1) {freeText.splice(itemIndex,1);}
    setSelectValue('')
    writeFreeText();
  } 
  
  function replaySpeak(){
    if (speakStack.length > 0) { 
      dispText.splice(0)
      setModalVisible(true)
      let speakText = ''
      speakStack.map((txt) => speakText += txt + ',')
      if (iniObj.replayScrnHold) {
        Speech.speak(speakText, {
          language: "ja"});
      } else {
        Speech.speak(speakText, {
            language: "ja",
            onDone:() => {setTimeout(() => { 
              setModalVisible(false);
            }, 1000)}
        }) 
      }
    } else {
      playBeep1();
    }
  }

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  async function playDecision2() {
    const { sound } = await Audio.Sound.createAsync(require('../assets/Decision2.mp3'));
    setSound(sound);
    await sound.playAsync();  }
  async function playBeep1() {
    const { sound } = await Audio.Sound.createAsync(require('../assets/Beep1.mp3'));
    setSound(sound);
    await sound.playAsync();  }
  useEffect(() => { return sound ? () => { sound.unloadAsync(); } : undefined; }, [sound]);

  return (
    <SafeAreaProvider>
          <SafeAreaView style={[stylesFreeText.container,{ width:Dimensions.get('window').width }]}>
        <Stack.Screen options={{
          title:'フリーテキスト',
          headerTitleAlign: 'center',  
          headerTitleStyle: { fontWeight:'bold',  fontSize: 25 },
          headerBackButtonDisplayMode:  'minimal' ,
          headerStyle: { backgroundColor:styles.containerBottom.backgroundColor },
          headerRight:  () => (
            <Pressable onPressIn={() => {
                  router.push({ pathname: "/configApp", params: { post: scnNum, from: 'freeText' } });
            }}>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor}]}>
                <Text style={{textAlign:'center' }}>設定</Text>
              </View>
            </Pressable> 
          ),         
          headerLeft:  () => ( 
            <Pressable onPressIn={() => router.back() }>
              <View style={[styles.headerButton, {backgroundColor:iniObj.controlButtonColor}]}>
                <Text style={{textAlign:'center' }}>＜</Text>
              </View>
            </Pressable> 
          ),    
          }}/>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible} >
          <ScrollView >
          <View style={[styles.centeredView,{ width:Dimensions.get('window').width }]}>
              <View style={[styles.modalView,  { height: Dimensions.get('window').height*6/7-20, 
                  transform:(iniObj.modalTextRotate) ? [{ rotate: '180deg' }] : [] } ] } >
                  {(dispText.length === 1 ) ?
                    (dispText.map((moji, index) => <Text key={index} style={styles.modalText}>{moji}</Text>)) :         
                    (mojiStack.map((moji, index) => <Text key={index} style={styles.modalText}>{moji}</Text>))
                  }
              </View>
              <Pressable onPress={() => {Speech.stop(); setModalVisible(false)}} >
                <View style={[styles.modalButton, {backgroundColor:iniObj.controlButtonColor}]}>
                  <Text style={{ fontSize: 18}}>閉じる</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </Modal>
        <View>
          <View>
            <TextInput style={[stylesFreeText.textInput,{width: Dimensions.get('window').width } ]}
              autoFocus={true}
              multiline={true}
              onSubmitEditing={() => onPressSay()}
              onChangeText={(text)=>setTextInput(text)} 
              value={textInput} />
          </View>
          <View style={[stylesFreeText.containerBottom,{ width:Dimensions.get('window').width }]}>
            <TouchableHighlight onPress={ () => replaySpeak()} onLongPress={ () => {
                speakStack.splice(0);
                mojiStack.splice(0); 
                playDecision2() }}>
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                  width:Dimensions.get('window').width/3-8 }]}>
                <Text style={[stylesFreeText.text,]} >もう一度</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => setTextInput('')} >
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                  width:Dimensions.get('window').width/3-8 }]}>
                <Text style={stylesFreeText.text} >クリア</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => { onPressSay()} }>
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
              width:Dimensions.get('window').width/3-8 }]}>
                <Text style={stylesFreeText.text}>発音</Text>
              </View>
            </TouchableHighlight>
          </View>
          <Text style={stylesFreeText.text}>以前のテキストから選ぶ</Text>
          <View style={{height:80, borderWidth:0.5}}>
            <RNPickerSelect 
              onValueChange={(value) => { 
                setTextInput(value);
                setSelectValue(value);
              }} 
              items={freeText}
              value={selectValue}
              placeholder={{label:'以前のテキストから選ぶ', value:''}}
              style={pickerSelectStyles}
              />
          </View>
          <View style={[stylesFreeText.containerBottom,{ height:100,
              width:Dimensions.get('window').width }]}>
            <TouchableHighlight onPress={ () => { router.back() } }> 
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                  width:Dimensions.get('window').width/4-9 }]}>
                <Text style={stylesFreeText.text}>＜</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => { onPressDelItem() }} >
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                  width:Dimensions.get('window').width/4-9 }]}>
                <Text style={stylesFreeText.text}>除く</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => { onPressDel() } }> 
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
                  width:Dimensions.get('window').width/4-9 }]}>
                <Text style={stylesFreeText.text}>空に</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={ () => { onPressSay()} }>
              <View style={[stylesFreeText.button, {backgroundColor:iniObj.controlButtonColor,
              width:Dimensions.get('window').width/4-9 }]}>
                <Text style={stylesFreeText.text}>発音</Text>
              </View>
            </TouchableHighlight>
          </View>
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
     android: 80,
     ios:     80,}),
    borderRadius: 20,
    borderColor:styles.buttonBottom.borderColor,
    borderWidth:styles.buttonBottom.borderWidth,
  },
  textInput: {
    width: Dimensions.get('window').width,
    height: 80,
    borderWidth: 1,
    padding: 5,
    textAlignVertical: 'top',
    fontSize: 20,
  },
  picker: {
    width: Dimensions.get('window').width,
    height: Platform.select({
      android: 50,
      ios: 120,
    }),
    borderWidth: 1,
    padding: 0,
  },
  text: {
    fontSize: 20,
    color: styles.text.color,
  },
  containerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: styles.container.backgroundColor,
    height:100,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: 230,
    marginLeft: 30,
    pointerEvents:'none', // fix make possble to click on line
  },
  inputAndroid: {
    fontSize: 20,
    paddingRight: 30, // to ensure the text is never behind the icon
    width: Dimensions.get('window').width,
  },
});