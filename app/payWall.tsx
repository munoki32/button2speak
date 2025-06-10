import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { writeLog } from './comFunc';
import { styles } from './index';
export let customerInfo:any;

// export let customerInfo:any;
export default function payWall(){

    useEffect(() => {  // only once after 1st rendering
      if (Platform.OS === 'ios') {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }
      if (Platform.OS === 'ios') {
        Purchases.configure({apiKey: 'appl_dcSptaIsDjlXUHVvpyeDSkNXLpA'});
      } else if (Platform.OS === 'android') {
        // Purchases.configure({apiKey: 'appl_dcSptaIsDjlXUHVvpyeDSkNXLpA'});
      } 
      if (Platform.OS === 'ios'){  try {
          customerInfo =  Purchases.getCustomerInfo();
          // access latest customerInfo
          writeLog( 0, 'get cutomer Info:' + customerInfo)
        } catch (e) {
        // Error fetching customer info
          writeLog( 0, 'get cutomerInfo Error' + e )
        }
      }

    }, []);
  
  
	const router = useRouter();
  const { post, from } = useLocalSearchParams();
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog( 0, 'Err: configScrn No post number');
    scnNum = 0;
  };
// Display current offering
return (
   <SafeAreaProvider>
		<Stack.Screen options={{
		title: '応援', 
    headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
    headerLeft:  () => ( 
      <Pressable onPressIn={() => router.back()}>
        <View style={[styles.headerButton, ]}>
          <Text style={{textAlign:'center' }}>＜</Text>
        </View>
      </Pressable> 
    ),      
    headerRight:  () => ( 
      <Pressable onPressIn={() => router.push({ pathname: "/help", params: { post: scnNum } })}>
        <View style={[styles.headerButton, ]}>
          <Text style={{textAlign:'center', fontSize:12 }}>ヘルプ</Text>
        </View>
      </Pressable>
    ),       
		}} />
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall 
          onDismiss={() => {
            // Dismiss the paywall, i.e. remove the view, navigate to another screen, etc.
            // Will be called when the close button is pressed (if enabled) or when a purchase succeeds.
			router.back();
          }}
        />
    </View>
    </SafeAreaProvider>
);
}
