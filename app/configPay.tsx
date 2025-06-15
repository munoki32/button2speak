import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Purchases, {
  CustomerInfo, PurchasesOffering, PurchasesPackage
} from 'react-native-purchases';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { iniObj, writeLog } from './comFunc';
import { styles } from './index';

export let custProd:string[] = ['','','']
export let custID:String = ''

export default function configPay(){

  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [purchasesPackage, setPurchasesPackage] = useState<PurchasesPackage>();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>();

    useEffect(() => {  // only once after 1st rendering
      if (Platform.OS === 'ios') {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }
      if (Platform.OS === 'ios') {
        Purchases.configure({apiKey: 'appl_jdpXVGjdWJBVuRGkicsZOXBmPXv' });
      } else if (Platform.OS === 'android') {
        // Purchases.configure({apiKey: 'appl_dcSptaIsDjlXUHVvpyeDSkNXLpA'});
      } 
      writeLog(0, 'Purchase cnfigured:' + iniObj.userId)
      const init = async () => { 
        if (iniObj.userId !== '') { 
          const { customerInfo } = await Purchases.logIn(iniObj.userId); 
          writeLog(0, 'configPay login:' + iniObj.userId)
          writeLog(0, 'Login customer:' + customerInfo.originalAppUserId)
          // writeLog(0, 'getCustomer:' + customerInfo.allPurchasedProductIdentifiers)
        }
        const info = (await Purchases.getCustomerInfo());
        // writeLog(0, 'getCustomer:' + JSON.stringify(Info))
        writeLog(0, 'getCustomer:' + info.originalAppUserId)
        writeLog(0, 'getCustomer:' + info.allPurchasedProductIdentifiers)
        custProd = info.allPurchasedProductIdentifiers
        custID = info.originalAppUserId
        setCustomerInfo(info)

        const offerings = await Purchases.getOfferings();
        writeLog(0, 'getOfferings:' + offerings.current?.availablePackages.map((item,i) => item.product.identifier ));
        // writeLog(0, 'getOfferings:' + JSON.stringify(offerings.current?.availablePackages) );
        setCurrentOffering(offerings.current);
      }
      init();
    }, []);

  const [changeScrn, setChangeScrn] = useState(true)
  
	const router = useRouter();
  const { post, from } = useLocalSearchParams();
  let scnNum = 0;
  if (post) {
    scnNum = Number(post);
  } else {
    writeLog( 0, 'Err: configScrn No post number');
    scnNum = 0;
  };

  const onPressPurchase = async (item: PurchasesPackage) => {
    try {
      // ここで購入しています
        writeLog(0, 'purchase:' + JSON.stringify(item.product))
        const { customerInfo: _customerInfo, productIdentifier } = await Purchases.purchasePackage(item)
    } catch (e: any) {
      // if (!e.userCancelled) {
      //   console.log(e);
      // } 
      writeLog(0, 'purchase:' + e);
    } 
  };

  const onPressRestore = async () => {
    const customerInfo = await Purchases.restorePurchases();
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
    <ScrollView>
    <View style={[stylPayConf.container]}>
      <Text style={{fontSize:22, marginTop:10}}>応援をお願いします</Text>
      <Text style={{fontSize:18}}>
        {`この度はアプリのご利用ありがとうございます、このアプリは無償で全ての機能がご利用いただけます。
なお、開発者はアプリの公開には、無料のアプリであっても、Apple Developer Programメンバーシップの登録料（12,800円）が毎年必要です。
もし、アプリ公開にご賛同、ご協力いただきましたら、応援をお願いします。
どうぞよろしくお願いいたします。
        `}
      </Text>
      {currentOffering && currentOffering.availablePackages.map((item,i) => 
      <TouchableHighlight key={i} onPress={()=> onPressPurchase(item)} disabled={custProd.includes(item.product.identifier)}>
        <View key={i} style={[stylPayConf.button, {width: Dimensions.get('window').width} ]}>
          <Text style={[stylPayConf.text,{color:custProd.includes(item.product.identifier)?'gray':'black'}]}>
            {item.product.title + '：' + item.product.price.toFixed(2) + '円'}</Text>
            <Text style={[stylPayConf.text,{color:'black'}]}>
            {custProd.includes(item.product.identifier)?'「'+item.product.title + '」をありがとうございます':''} </Text>
        </View>
      </TouchableHighlight>      
      )}
    </View>
    </ScrollView>
    <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
      <TouchableHighlight onPress={ ()  => { onPressRestore() }} >
        <View style={[stylPayConf.bottomButton,{height: stylPayConf.button.height, width:Dimensions.get('window').width/2-7}]}>
          <Text style={[stylPayConf.text, {fontSize:18}]}>復元</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight onPress={ ()  => { router.back() }} >
        <View style={[stylPayConf.bottomButton,{height: stylPayConf.button.height, width:Dimensions.get('window').width/2-7}]}>
        <Text style={[stylPayConf.text, {fontSize:18}]}>戻る</Text>
        </View>
      </TouchableHighlight>
    </View>
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
      width: Dimensions.get('window').width,
      height: 80,
      borderRadius: 15,
      borderColor:styles.buttonBottom.borderColor,
      borderWidth:styles.buttonBottom.borderWidth,
      },
  text: {
    fontSize: 18,
    color: styles.text.color,
    textAlign: 'center',
  },
});
