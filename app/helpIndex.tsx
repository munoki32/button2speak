import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './index';

export default function help(){
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
	<SafeAreaProvider>
		<SafeAreaView style={stylesHelp.container} edges={['top']}>
			<Stack.Screen options={{
				title: 'ヘルプ',
				headerTitleAlign: 'center',
				headerBackButtonDisplayMode:  'minimal' ,
				headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
				headerRight:  () => (
					<Pressable onPress={() => router.push('/about')}>
					<View style={[styles.headerButton, ]}>
						<Text style={{textAlign:'center' }}>About</Text>
					</View>
					</Pressable> ),         
				headerLeft:  () => ( 
					<Pressable onPress={() => router.back()}>
					<View style={[styles.headerButton,]}>
						<Text style={{textAlign:'center' }}>＜</Text>
					</View>
					</Pressable> ),               
			}} />
			<View  style={[stylesHelp.container, {height:300 }]}>
			<ScrollView >
						<Text style={stylesHelp.text}>
{`---------------------------------------------
基本画面
---------------------------------------------
発声ボタン（グレー）
押すとボタン定義によって（以下のいずれかの動作）
●	発声、発声＆遷移、遷移
	※遷移の有るボタンはボタンの縁が濃い

上部の（黄色）遷移ボタン
●	＜'<'＞：前画面があれば戻ります（各画面共通）
●	＜設定＞：全体設定に遷移します、長押しで画面設定に遷移します
●	タイトルを長押しするとヘルプが表示されます（各画面共通）

下部の（黄色）遷移ボタン
●	＜'<'＞：前画面があれば戻ります
●	＜もう一度＞：ホームからの一連の発声を、もう一度再生し、発生内容を画面上に表示します。
	○	ホームから別の発声をすると以前の内容はクリアされます。
	○	約1秒の「長押し」でクリアできます。
●	＜フリー＞：フリーテキスト画面に遷移します。
●	＜ホーム＞：ホーム画面に戻ります

画面を「左にスライド」すると次の画面へ移動することが出来ます。「右にスライド」すると前の画面に移動します。
各画面のタイトルを押すと各画面のヘルプが表示されます。
画面の一番下の空白を長押しすると、この画面の「ボタン追加/編集」へ遷移します。

`}
					</Text>
				</ScrollView>
			</View>
			</SafeAreaView>
			<SafeAreaView>
				<TouchableHighlight style={{alignItems:'center'}} onPress={ () => router.back() } >
					<View style={[stylesHelp.button, ]}>
						<Text style={[stylesHelp.text]}>＜</Text>
					</View>
				</TouchableHighlight>
			</SafeAreaView>
		</SafeAreaProvider>
	)
};

export const stylesHelp = StyleSheet.create({
  container: {
		flex: 1,
//		flexDirection: 'row', 	//これが有るとスクロールしない
//		flexWrap: 'wrap',		//これが有るとスクロールしない
		justifyContent: 'space-around',
		gap: 5,
		paddingHorizontal: 5,
		paddingVertical:5,
		width: Dimensions.get('window').width ,
  },
  button: {
    alignItems: 'center',
    backgroundColor: styles.headerButton.backgroundColor,
    justifyContent: 'center',
    paddingHorizontal: 5, 
    width: Dimensions.get('window').width,
    height: 60,
    borderRadius: 10,
    borderColor: styles.buttonBottom.borderColor,
    borderWidth: styles.buttonBottom.borderWidth,
  },
	text: {
     fontSize: Dimensions.get('window').width < 1000? 18: 36,
    color: styles.text.color,
  },
});
