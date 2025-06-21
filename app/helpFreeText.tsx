import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './index';

export default function helpConfigApp(){
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
					<Pressable onPressIn={() => router.push('/help')}>
					<View style={[styles.headerButton, ]}>
						<Text style={{textAlign:'center' }}>ヘルプ</Text>
					</View>
					</Pressable> ),         
				headerLeft:  () => ( 
					<Pressable onPressIn={() => router.back()}>
					<View style={[styles.headerButton,]}>
						<Text style={{textAlign:'center' }}>＜</Text>
					</View>
					</Pressable> ),               
			}} />
			<View  style={[stylesHelp.container, {height:300 }]}>
			<ScrollView >
						<Text style={stylesHelp.text}>
						{`---------------------------------------------
フリーテキスト（自由入力＆発声）画面
---------------------------------------------
●	上部の＜入力エリア＞に文字を入力し、＜発声＞ボタンを押すと発声します。
内容はボタンとして蓄積します（蓄積は重複しません）設定のスイッチ(a)によって、入力エリアは自動的にクリアされるか、そのままに成ります。
●	＜クリア＞ボタンを押すと入力エリアがクリアされます。（長押しで、全てのフリーボタンを消します。確認があります）
●	＜発音＞入力エリアの内容を発音します。
●	フリー画面から「フリー設定」を呼び出すとフリーについての設定が出来ます
●	ボタンを長押しすると、そのボタンの「ボタン編集」画面に移ります
●	タイトル「フリー」を長押しするとフリーテキスト画面の設定に移ります

`}
					</Text>
				</ScrollView>
			</View>
			</SafeAreaView>
			<SafeAreaView>
				<TouchableHighlight style={{alignItems:'center'}} onPress={ () => router.back() } >
					<View style={[stylesHelp.button, ]}>
						<Text style={[stylesHelp.text,{fontSize:18}]}>戻る</Text>
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
    fontSize: 14,
    color: styles.text.color,
  },
});
