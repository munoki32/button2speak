import * as Application from 'expo-application';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './index';

export default function about(){
  const router = useRouter();
    return (
	<SafeAreaProvider>
		<SafeAreaView style={stylesHelp.container} edges={['top']}>
			<Stack.Screen options={{
				title: 'button2speakについて',
				headerTitleAlign: 'center',
				headerBackButtonDisplayMode:  'minimal' ,
				headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
				headerLeft:  () => ( 
					<Pressable onPress={() => router.back()}>
					<View style={[styles.headerButton,]}>
						<Text style={{textAlign:'center' }}>＜</Text>
					</View>
					</Pressable> ),               
			}} />
			<View  style={[stylesHelp.container, {height:300 }]}>
				<Text style={{ textAlign: 'center', fontSize:18}}>
					Version:{Application.nativeApplicationVersion}
					　Build:{Application.nativeBuildVersion}
					　Size:{Dimensions.get('window').width.toFixed(0)}
							x{Dimensions.get('window').height.toFixed(0)}
				</Text>
			<ScrollView >
                <Text style={stylesHelp.text}>
						{`
本ソフトウェアの使用に際しては、バグや問題によりソフトウエアが動作しなかったり、意図した動作をしないため、コミュニケーションが出来ず、\
結果としてユーザーの生命に危険が及ぶ可能性があることに留意してください。ユーザーおよび介護者は、\
本ソフトウェア以外の手段でコミュニケーションが取れるよう常に準備し、対応してください。

[Button2Speak] Copyright (c) 2025 UNOKI, Masayuki All Rights Reserved.

Special thanks to "TAKAHASHI, Makoto" for contribution of  product design and default data.

本ソフトウェアは「現状有姿」で提供され、商品性、特定目的への適合性、および権利の非侵害性に関する保証を含むがこれらに限定されず、\
明示的であるか黙示的であるかを問わず、いかなる種類の保証も行われません。著作者または著作権者は、契約、不法行為、またはその他の行為であるかを問わず、\
ソフトウェアまたはソフトウェアの使用もしくはその他に取り扱いに起因または関連して生じるいかなる請求、損害賠償、その他の責任について、一切の責任を負いません。

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS \
IN THE SOFTWARE.	

[OPEN SOURCE SOFTWARE LICENSE]

1) This product includes open source software programs according to the license terms of each open source software program.
2) The open source software programs are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. \
Please read the license agreements of each open source software program for more details, which are described below.

The MIT License (MIT) 

[React Native] Copyright (c) Meta Platforms, Inc. and affiliates.
[expo] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[expo-av] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[expo-speeech] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[expo-file-system] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[expo-clippboard] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[expo-application] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[expo-document-picker] Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
[react-native-picker] Copyright (c) 2015-present, Facebook, Inc.
[react-native-swipe-gestures] Copyright (c) 2014 Goran Lepur
[react-native-volume-manager] Copyright (c) 2021 Hirbod Mirjavadi
[react-native-community/slider] Copyright (c) 2019 react-native-community

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.	

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
