import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, } from 'react';
import {
  Dimensions, Platform, Pressable,
  SafeAreaView,
  ScrollView, StyleSheet, Text,
  TouchableHighlight, View
} from 'react-native';
import Purchases, {
  CustomerInfo, PurchasesOffering, PurchasesPackage
} from 'react-native-purchases';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { iniObj, writeLog } from './comFunc';
import { styles } from './index';
 
export let custProd:string[] = ['','','']
export let custID:String = ''

export default function paySupport(){

  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [purchasesPackage, setPurchasesPackage] = useState<PurchasesPackage>();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>();

    useEffect(() => {  // only once after 1st rendering
      if (Platform.OS === 'ios') {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }
      if (Platform.OS === 'ios') {
        Purchases.configure({apiKey: 'appl_iPWljtfdLheKhgOumltEKQcWosf' });
      } else if (Platform.OS === 'android') {
        // Purchases.configure({apiKey: 'appl_dcSptaIsDjlXUHVvpyeDSkNXLpA'});
      } 
      writeLog(20, 'Purchase configured:' + iniObj.userId)
      try{
        const init = async () => { 
          if (iniObj.userId !== '') { 
            const { customerInfo } = await Purchases.logIn(iniObj.userId); 
            writeLog(20, 'configPay login:' + iniObj.userId)
            writeLog(20, 'Login customer:' + customerInfo.originalAppUserId)
            // writeLog(10, 'getCustomer:' + customerInfo.allPurchasedProductIdentifiers)
          }
          const info = (await Purchases.getCustomerInfo());
          // writeLog(10, 'getCustomer:' + JSON.stringify(Info))
          writeLog(20, 'getCustomer:' + info.originalAppUserId)
          writeLog(20, 'getCustomer:' + info.allPurchasedProductIdentifiers)
          custProd = info.allPurchasedProductIdentifiers
          custID = info.originalAppUserId
          setCustomerInfo(info)

          const offerings = await Purchases.getOfferings();
          writeLog(20, 'getOfferings:' + offerings.current?.availablePackages.map((item,i) => item.product.identifier ));
          // writeLog(10, 'getOfferings:' + JSON.stringify(offerings.current?.availablePackages) );
          setCurrentOffering(offerings.current);
        }
        init();
      } catch (e) {
            writeLog(20, 'Revenue cat error:' + e);
      }
    }, []);

  const [changeScrn, setChangeScrn] = useState(true)
  
	const router = useRouter();
  const { post, from } = useLocalSearchParams();
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog(20, 'Err: configScrn No post number');
    scnNum = 0;
  };

  const onPressPurchase = async (item: PurchasesPackage) => {
    try {
      // ここで購入しています
        writeLog(20, 'purchase:' + JSON.stringify(item.product))
        const { customerInfo: _customerInfo, productIdentifier } = await Purchases.purchasePackage(item)
    } catch (e: any) {
      // if (!e.userCancelled) {
      //   console.log(e);
      // } 
      writeLog(20, 'purchase:' + e);
    } 
  };

  const onPressRestore = async () => {
    const customerInfo = await Purchases.restorePurchases();
  };

// Display current offering
return (
  <SafeAreaProvider>
    <Stack.Screen options={{
    headerTitleAlign: 'center',
    title: '応援', 
    headerStyle: { backgroundColor: styles.containerBottom.backgroundColor },
    headerLeft:  () => ( 
      <Pressable onPress={() => router.back()}>
        <View style={[styles.headerButton, ]}>
          <Text style={{textAlign:'center' }}>＜</Text>
        </View>
      </Pressable> 
    ),      
    headerRight:  () => ( 
      <Pressable onPress={() => router.push({ pathname: "/helpPaySupport", params: { post: scnNum, from:'paySupport' } })}>
        <View style={[styles.headerButton, ]}>
          <Text style={{textAlign:'center', fontSize:12 }}>ヘルプ</Text>
        </View>
      </Pressable>
    ),       
    }} />
    <ScrollView>
      <SafeAreaView style={stylPayConf.container} >
        <View style={[stylPayConf.container]}>
          <Text style={[stylPayConf.text, {marginTop:10, width:Dimensions.get('window').width}]}>応援をお願いします</Text>
          <Text style={[stylPayConf.text, {textAlign:'left'}]}> 
{`この度は本アプリのご利用ありがとうございます、このアプリは無償で全ての機能がご利用いただけます。
アプリの開発、維持、公開にご賛同、ご協力いただき、応援をお願いします。
どうぞよろしくお願いいたします。
            `} 
          </Text>
          {currentOffering && currentOffering.availablePackages.map((item,i) => 
          <TouchableHighlight key={i} onPress={()=> onPressPurchase(item)} disabled={custProd.includes(item.product.identifier)}>
            <View key={i} style={[stylPayConf.button, {width: Dimensions.get('window').width} ]}>
              <Text style={[stylPayConf.text,{color:custProd.includes(item.product.identifier)?'gray':'black'}]}>
                {item.product.title + '：' + item.product.price.toFixed(2) + '円'}</Text>
                <Text style={[stylPayConf.text,{color:'black'}]}>
                {custProd.includes(item.product.identifier)?'「'+item.product.title + '」をありがとうございました':''} </Text>
            </View>
          </TouchableHighlight>      
          )}
          <View style={{height:100}}></View>
        </View>
      </SafeAreaView>
    </ScrollView>
    <SafeAreaView  style={[styles.containerBottom]}>
      <TouchableHighlight onPress={ ()  => { router.back() }} >
        <View style={[stylPayConf.bottomButton,{height: stylPayConf.button.height, width:Dimensions.get('window').width/2-7}]}>
        <Text style={[stylPayConf.text, {fontSize:18}]}>＜</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight onPress={ ()  => { onPressRestore() }} >
        <View style={[stylPayConf.bottomButton,{height: stylPayConf.button.height, width:Dimensions.get('window').width/2-7}]}>
          <Text style={[stylPayConf.text, {fontSize:18}]}>復元</Text>
        </View>
      </TouchableHighlight>
    </SafeAreaView>
  </SafeAreaProvider>
);
}

export const stylPayConf = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
//    paddingHorizontal: 5,
    paddingVertical:5, //エリアの上の空白
    width: Dimensions.get('window').width,
//    height: 400,
    backgroundColor:styles.container.backgroundColor,
  },
  button: {
//    alignItems: 'center',
    backgroundColor: '#dcdcdc' ,
    justifyContent: 'center',  //上下位置
    paddingHorizontal: 5, 
//    paddingRight: 70,
    width: Dimensions.get('window').width/2-5,
    height: styles.button.height*0.7,
    borderRadius: 15,
    borderColor:styles.buttonBottom.borderColor,
    borderWidth:styles.button.borderWidth,
  },
  bottomButton: {
      backgroundColor:'#ddff99' ,
      justifyContent: 'center',  //上下位置
      paddingHorizontal: 5, 
      paddingRight:0,
      width: Dimensions.get('window').width/2-5,
      height: 80,
      borderRadius: 15,
      borderColor:styles.buttonBottom.borderColor,
      borderWidth:styles.buttonBottom.borderWidth,
      },
  text: {
    fontSize: Dimensions.get('window').width < 1000 ? 18 : 36,
    color: styles.text.color,
    textAlign: 'center',
  },
});
