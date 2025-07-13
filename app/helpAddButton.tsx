import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './index';

export default function helpAddButton(){
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
ボタン追加/編集
---------------------------------------------
●	上部の＜入力エリア＞に文字を入力し、＜発声＞ボタンを押すと発声し、ボタンが追加されます
	フリー設定のスイッチ(e)によって、入力エリアは自動的にクリアされるか、そのままに成ります。
●	＜クリア＞ボタンを押すと入力エリアがクリアされます。（長押しで、全てのフリーボタンを消します。確認があります）
●	＜発音＞入力エリアの内容を発音します。
●	ボタンを長押しすると、そのボタンの編集画面に移ります

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
