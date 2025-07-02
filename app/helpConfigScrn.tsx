import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './index';

export default function helpConfigScrn(){
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
画面の設定
---------------------------------------------
●	＜画面を削除する＞現在の画面を削除します（長押し）
●	＜使用回数をリセット＞保存されているボタンの使用頻度の情報をリセットします（表示順の頻度順に影響します）
●	＜非リンク画面登録＞新たに追加された画面などで、どこからもリンクされていない画面が有る場合、現在の画面にリンクを登録します。
●	＜画面エディタ＞ボタン定義編集画面に遷移します
●	＜ボタン追加/編集へ＞画面のボタンの編集機能へ遷移します

a. 「タイトル」　画面のタイトルを変更することが出来ます
b.  「画面表示順」は設定中の画面のボタンの表示順を設定できます。
	未設定：表示順は全体の設定（定義順）となります。
	定義順：表示順は定義の順で固定です（画面編集のボタンの順序（オプション）の数字の昇順です）
	使用順：最後に使用したボタンが先頭に表示されます、以下最近に使用した順です
	頻度順：ボタンが押された回数の多い順に表示されます（回数は＜使用回数をリセット＞でリセットできます
c. 「画面の行数」この画面でのボタンの行数（おおまかな縦の数）
d. 「画面の列数」この画面でのボタンの列数（横の数）

`}
					</Text>
				</ScrollView>
			</View>
			</SafeAreaView>
			<SafeAreaView>
				<TouchableHighlight style={{alignItems:'center'}} onPress={ () => router.back() } >
					<View style={[stylesHelp.button, ]}>
						<Text style={[stylesHelp.text]}>戻る</Text>
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
