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
基本画面
---------------------------------------------
発声ボタン（グレー）
押すとボタン定義によって（以下のいずれかの動作）
●	発声、発声＆遷移、遷移
	※遷移の有るボタンはボタンの縁が濃い

上部の（黄色）遷移ボタン
●	＜'<'＞：前画面があれば戻ります
●	＜設定＞：設定メニューに遷移します

下部の（黄色）遷移ボタン
●	＜'<'＞：前画面があれば戻ります
●	＜もう一度＞：ホームからの一連の発声を、もう一度再生し、発生内容を画面上に表示します。
	○	ホームから別の発声をすると以前の内容はクリアされます。
	○	約1秒の「長押し」でクリアできます。
	○	フリーテキストの発声が含まれるかは、設定のスイッチ(b)によります。
●	＜フリー＞：フリーテキスト画面に遷移します。（長押しで旧フリーテキストに遷移）
●	＜ホーム＞：ホーム画面に戻ります

画面のタイトル「ホーム」を長押しすると、画面の設定へ遷移します
画面を「左にスライド」すると次の画面へ移動することが出来ます。「右にスライド」すると前の画面に遷移します
発音ボタンをスクロールし、下部の隙間を長押しすると、ボタンの追加・編集へ遷移します

---------------------------------------------
全体の設定
---------------------------------------------
●	＜定義を前に戻す＞ ボタンの定義をひとつ前に戻します。（長押し）
※実際に定義の変更をした場合に定義情報が保存され、現定義が前定義と成ります
●	＜定義を初期化する＞ ボタンの定義データ、設定などを、初期に戻します。（長押し）
※保存されているデータは削除されます。現在の定義を残したい場合は「クリップボードへコピー」して別のアプリで保存してください
●	＜再起動＞音が出ない等の問題が発生したら、アプリの再起動が出来ます（長押し）

●	＜クリップボードへ定義をコピー＞ボタンの定義データをクリップボードへコピーします、別のアプリで保存や編集してください。
「履歴を含む」を選ぶとデータに定義順、使用順、頻度順の情報を含みます
「基本のみ」とした場合はデータは定義順に出力されますが、定義順、履歴、頻度などの情報は含みません
●	＜クリップボードから定義を読込む＞ボタンの定義データをクリップボードから読込みます。別のアプリで定義データをコピーした後、この機能で読込みます。
※定義は画面ごとに上書きされます。（データにない画面はそのままです）

●	＜定義を保存/シェアする＞ボタンの定義データをスマホのシェア機能でシェアできます。\
シェアされたデータを、クリップボードへコピーし、次の読込み機能で読込んでください。
「履歴を含む」を選ぶとデータに定義順、使用順、頻度順の情報を含みます
「基本のみ」とした場合はデータは定義順に出力されますが、定義順、履歴、頻度などの情報は含みません
●	＜定義を読込む＞スマホのファイルのアクセス画面から、定義ファイルを選択して読込んでください。
●	＜画面の設定へ＞画面の設定へ移ります

a.  「発声時に文字を表示する」ONにすると発声毎にその内容が表示されます。
b.  「文字を反転表示する」ONにすると、「もう一度」や発声毎表示の文字が上下反対に表示され、正面の相手が見やすくなります。
c.  「もう一度を閉じない」ONにすると、もう一度で表示された文字が、「閉じる」を押すまで、閉じません
d.  「音量変更」ONにすると、指定の音量で発声されます。＋－で調整できます、
	その下のスライダーをONにするとスライダーでの調整が可能です

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
