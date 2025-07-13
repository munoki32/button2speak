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
全体の設定
---------------------------------------------
●	＜定義を前に戻す＞ ボタンの定義をひとつ前に戻します。（長押し）
※実際に定義の変更をした場合に定義情報が保存され、現定義が前定義と成ります
●	＜定義を初期化する＞ ボタンの定義データ、設定などを、初期に戻します。（長押し）
※保存されているデータは削除されます。現在の定義を残したい場合は「クリップボードへコピー」して別のアプリで保存してください
●	＜再起動＞音が出ない等の問題が発生したら、アプリの再起動が出来ます（長押し）
●	＜応援＞アプリ開発への応援です。(iOSのみ)

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
e.  「ログレベル」”無”以外ではログが作成されます。ログの細かさが指定できます。”全て”が最も細かくなります
    （パフォーマンスに影響します）ログは＜定義を保存/シェアする＞の長押しで出力できます。

---------------------------------------------
クリップボード・定義ファイルのデータについて
---------------------------------------------
●	定義データは行「// button2speak config data:」で始まっている必要が有ります。
	:の後ろに「R」を指定すると、既存のデータを削除してからロードします。「// button2speak config data:R」
	:の後ろにオプションが指定できます
	ボタンのデフォルトの色指定、色指定は色指定はCSS Color Module Level 3に準じます。（参考: https://www.w3.org/TR/css-color-3/#svg-color )
	例）#DCDCDC brack など16進数か色名での指定（複数指定する場合は半角スペースで区切ります）
	ボタンの色　dbc:色指定、ボタンの文字の色　dtc:色指定
	各画面のデフォルトのボタンの表示順を　sort:def|cnt|dat （定義順｜頻度順｜使用順）

●	画面の定義行は「>>,画面番号,画面のタイトル,画面オプション」です。番号は半角数字、文字には半角の「,」は使えません。
	「>>R,画面番号,画面のタイトル,画面オプション」とすると、画面単位で削除後ロードされます。（通常は同じボタン表示は上書きされ、それ以外は残ります、R場合ロードされたボタンだけに成ります）
●	画面オプションはcol:ボタンの列数(1から5) sbh:ボタンの高さ(標準は80)またはrow:ボタンの行数（高さを計算します）、この画面の表示順 sort:def|cnt|dat （定義順｜頻度順｜使用順）
	
●	画面の定義行につづいて、その画面のボタン定義です。（次の画面定義行まで）
●	各行は「表示,発声,リンク,オプション」です、「表示」以外は省略できます、文字には半角の「,」は使えません。（各項目の区切り文字です）
●	定義ファイルは画面単位のデータを利用できます、既存の画面は同じボタンは更新、新規では追加されます。（画面タイトルは常に置換です）
●	オプション定義は文字と、ボタンの色が指定可能です、指定がない場合はデフォルト色（上記dtc, dbcまたは文字は黒、ボタンはうすい灰色）です
	ボタンの文字の色　tc:色指定、ボタンの色　bc:色指定　

---------------------------------------------
※画面の追加方法するには　いずれかの方法で
---------------------------------------------
a)	どこかの画面のボタンのリンクに未使用の画面番号を入れてください。そしてこのボタンを押して、新画面へ遷移し、変更＞編集で新画面のボタンを設定してください。（画面数に上限は有りません）
b)	＜定義を読込＞を利用して、新しい画面定義を作成できます
例）15番の画面を追加（既存に15番画面が有ればタイトルは置換、ボタンはマージされます）
// button2speak config data:sort:def
>>,15,飲み物メニュー,col:3 row:5 sort:dat
エナジードリンク
紅茶
日本茶,,,bc:#7fff00 tc:black
コーヒー
．．．
※注意：この画面を呼び出すリンクをどこかの画面に設定してください。
c) 基本画面で「左にスライド」し次の画面を表示していき、空の画面までスライドすると、新画面が自動的に出来ますので、ここに定義してください。
d) フリーの画面から設定を呼び、画面の編集でタイトルを「フリー」以外に変更してください、その後、再起動すると、フリーのボタンは通常の画面と成ります
※フリーの画面は自動的に追加されます
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
