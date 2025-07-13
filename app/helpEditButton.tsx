import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './index';

export default function helpEditButton(){
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
ボタン編集
---------------------------------------------
●	ボタンの表示	ボタンの上に表示される文字
●	発音テキスト	発音する文字（空欄の場合はボタンの表示の文字）、漢字の読みがおかしいときなど
naを指定すると発音しない
●	オプション		
tc:ボタンの文字色、bc:ボタンの色、
icon:アイコンの指定、ic:アイコンの色、
emoji:絵文字など文字、lpr:true （このボタンは長押しが必要）

使用できるアイコンは　https://oblador.github.io/react-native-vector-icons/#MaterialIcons　のアイコン
●	リンク先		ボタンを押し、発声後にリンクする画面
●	移動・コピー先　このボタンを別の画面に移動、コピーする（移動、コピー先の一番後ろに配置）

●	＜　　　　　戻る
●	＜移動＞　　移動先の画面に移動します
●	＜コピー＞　コピー先の画面に追加しましす

●	＜削除＞　　このボタンを削除します（長押し）
●	＜更新＞　　変更内容で更新します（移動、コピーはしません）
●	＜発音＞　　発音が確認できます

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
