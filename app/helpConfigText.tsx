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
定義編集画面
---------------------------------------------
●	各入力エリアで定義が変更できます。「タイトル」は最初の画面のみで変更できます。
※タイトル「フリー」は使用できません
●	ボタンの内容は6件ずつ変更できます。
●	＜止める＞を押すと、その画面の変更内容は反映されず、変更メニューに戻ります。
●	＜続き、登録・次へ＞を押すと、変更内容が記録・反映されます。ボタン定義が更に有れば続きの編集画面が出てきます。
●	ボタンを削除するには、表示欄をクリア（すべての文字を削除）してください。
●	ボタンを追加するには、＜次へ＞を押してゆき、空欄がある画面まで遷移し、空欄に定義を追加してください。
●	欄が足する場合は、空欄を全て埋めて、＜次へ＞を押してください、追加の空欄の画面が表示されます。
（画面ごとのボタン数に上限は有りません）
●	「表示」：ボタンに表示される内容
●	「発音」：ボタンを押した場合に、テキストスピーチエンジンに送られる内容。発音が適切でない場合、ここにひらがなを入れるなど工夫してみてください。
全く異なる内容を入れることも可能です。空欄とした場合は表示の内容が読まれます。
Sound1不と入れると、警告音（チャラリン）、Sound2と入れると、クリック音（カチ）がします。
naと入れると音がしません。
●	「リンク」：ここに数字を入れると（発声し）その番号の画面に遷移します。
urlと入れると、ブラウザーに連携し「発声」に入れたURLを開きます。（発声はしません）

●	「オプション＞」を押す（あるいは左にスライド）と、編集中の画面と各ボタンのオプションの入力、変更画面が表示されます。
●	画面のオプションには col:ボタンの列数 sbh:ボタンの高さまたはrow:ボタンの行数、画面のボタンの並び順をsort:def|cnt|dat （定義順｜頻度順｜使用順）が指定できます
●	ボタンのオプションでは文字と、ボタンの色が「tc:white bc:#ffb3b3」の様に指定可能です。
●	入力が終わりましたら「＜」を押す（あるいは右にスライド）して戻ります。（変更した場合、戻った後登録が必要です）


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
