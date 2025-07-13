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
					<Pressable onPress={() => router.push('/help')}>
					<View style={[styles.headerButton, ]}>
						<Text style={{textAlign:'center' }}>ヘルプ</Text>
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
{`  この度はアプリのご利用ありがとうございます、このアプリは無償で全ての機能がご利用いただけます。
    なお、iOSでは、アプリの公開には、無料のアプリであっても、Apple Developer Programメンバーシップの登録料（12,800円）が毎年必要です。
    よろしければ、アプリの開発、維持、公開にご賛同、ご協力いただき、応援をお願いします。
    どうぞよろしくお願いいたします。
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
