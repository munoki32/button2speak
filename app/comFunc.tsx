import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Dimensions, Platform } from 'react-native';
import { defString } from './defaultText';

export default function dummy(){}

export let pgObj = [  // 初画面分は静的な定義が必要
  { pgTitle:'', btnList:[{moji:'', speak:'', tugi:'', option:'', defSeq:0, usedDt:0, numUsed:0 }], pgOption:'' },
];

export let iniObj={  // 設定の初期値
  defaultButtonColor:'#dcdcdc',
  defualtTextColor:'black', 
  controlButtonColor:'#ddff99',
  controlButtonBorder: 'gray',
  freeTextClear: true, 
  textOnSpeak:false, 
  changeVol:false, 
  modalTextRotate: false,  
  myVol:70,
  replayScrnHold: false,
  logLevel:10,
  homeScrn:0,
}

export const pgObjPath = FileSystem.documentDirectory + 'SpeakPad4.txt';
export const pgObjPathOld = FileSystem.documentDirectory + 'SpeakPad4Old.txt';
export const iniObjPath = FileSystem.documentDirectory + 'SpeakPad4IniObj.txt';
export const pgObjShare = FileSystem.documentDirectory + 'SpeakPad4Data.txt';
export const logPath = FileSystem.documentDirectory + 'SpeakPad4Log.txt';

export let pgStack = [0]  // history of page move (use for Back button)
export let speakStack:string[] =[]  // history of spaak
export let mojiStack:string[] =[]  // history of spaak
export let dispText:string[] = []  // display text on modal
export let logFile:string = '' // log

export async function readInitialFile() { // 開始時に呼ばれる処理
  writeLog(20, 'readInitialFile:start');
  if (Platform.OS === 'web' ) {
    initData();
    storeCSVdata(defString);
    return }
  // await readIniObj();  // 設定読込み
  let tmp = await FileSystem.getInfoAsync(pgObjPath); //　頁データ読込み
  if (tmp.exists) {
    try {
      const pgObjTxt = await FileSystem.readAsStringAsync(pgObjPath, {
        encoding: FileSystem.EncodingType.UTF8, 
      });
      writeLog(10, 'readInitialFile:data:' + pgObjTxt.substring(0,100));
      writeLog(20, 'readInitialFile:end');
      storeCSVdata(pgObjTxt) // 設定読込み（追加の設定も）
    } catch (e) {
      writeLog(40, e);
      writeLog(40, 'readInitialFile Error:' + pgObjPath + '\n');
    }
  } else { // if saved data not exist read from default definition
    writeLog(20, 'readInitialFile: file not exist');
    initData();
    storeCSVdata(defString);
    writeLog(10, 'readInitialFile:data:' + defString.substring(0,100));
    writeFile();
  }
}

export async function readIniObj() {  //設定読込み
  writeLog(20, 'readIniObj:start' )
  if (Platform.OS === 'web' ) { return null }
  let tmp = await FileSystem.getInfoAsync(iniObjPath);
  if (tmp.exists) {
    try {
      const readText = await FileSystem.readAsStringAsync(iniObjPath, {
        encoding: FileSystem.EncodingType.UTF8, });
      const lineData = readText.split(/\n/);
      for (let i=0; i < lineData.length; i++){
        scanIniText(lineData[i])
      }
      writeLog(0 , 'readIniObj:data\n' + readText);
      writeLog(20, 'readIniObj:read end');
      return
      } catch (e) {
      writeLog(40, e);
      writeLog(40, 'readIniObj Error:' + iniObjPath + '\n');
    }
  } else {
    writeLog(20, 'readIniObj:not exist');
  }
}

export function initData(){ //　初期化で呼ばれる処理
  writeLog(20, 'initData:start');
  pgObj.splice(0) // 全てをクリア
  pgObj.push({ pgTitle:'', btnList:[], pgOption:'' });
  pgStack.splice(0)
  storeCSVdata(defString);
  writeLog(20, 'initData:end:' + defString.substring(0,100));
}

export const writeFile = async () => {
  writeLog(20, 'writeFile:start');
  if (Platform.OS === 'web' ) { return }
  var pgObjTxt = makeCVSdata(false);
  try {
    const tmp = await FileSystem.getInfoAsync(pgObjPath);  //以前のデータ
    if (tmp.exists) {
      const pgObjTxtOld = await FileSystem.readAsStringAsync(pgObjPath, {
        encoding: FileSystem.EncodingType.UTF8, });
      if (compString(pgObjTxt, pgObjTxtOld)) {             // 変更が有ったか？
        writeLog(20, 'writeFile:no update');
        // writeIniObj();
        return
      }
      await FileSystem.copyAsync({     // 保存ファイルを改名
        from: pgObjPath,
        to:   pgObjPathOld, });
      writeLog(20, 'writeFile rename:');
    }
    await FileSystem.writeAsStringAsync(pgObjPath, pgObjTxt, {
      encoding: FileSystem.EncodingType.UTF8, });
    writeLog(20, 'writeFile:end');
    // writeIniObj();
  } catch (e) {
    writeLog(40, e);
    writeLog(40, 'writeFile Error:' + pgObjPath + '\n');
  }
//  Alert.alert('情報','設定を保存しました')

  function compString(str1:string, str2:string){
    if (str1.length !== str2.length) return false;
    const lineData1 = str1.split(/\n/);
    const lineData2 = str2.split(/\n/);
    if (lineData1.length !== lineData2.length) return false;
    for ( let i = 0; i < lineData1.length; i ++) {
      if (lineData1[i].indexOf("// saved") === 0) continue;
      if (lineData1[i] !== lineData2[i]) return false;
    }
    return true;
  }
}

export async function writeLog( level:number, text:any ){
  if (level < iniObj.logLevel) {return;}
  const date = new Date();
  date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  const d = date.toISOString().replace('T', ' ').substring(5,19);
  console.log(d.substring(6) + ' ' + text );
  logFile += d + ' ' + text + '\n';
  await FileSystem.writeAsStringAsync(logPath, logFile, {
      encoding: FileSystem.EncodingType.UTF8, });
}

export function makeCVSdata(removeButtonHistory:boolean) {
  writeLog(20, 'makeCVSdata:remove:' + removeButtonHistory);
  let csvBuff = "// button2speak config data:\n"
  if ( iniObj.defaultButtonColor !== '#dcdcdc' ) { csvBuff += '// opt:dbc:' + iniObj.defaultButtonColor +'\n' }
  if ( iniObj.defualtTextColor !== 'black' ) { csvBuff += '// opt:dtc:' + iniObj.defualtTextColor +'\n' }
  if ( iniObj.controlButtonColor !== '#ddff99' ) { csvBuff += '// opt:cbc:' + iniObj.controlButtonColor +'\n' }
  if ( iniObj.controlButtonBorder !== 'gray' ) { csvBuff += '// opt:cbb:' + iniObj.controlButtonBorder +'\n' }
  if ( iniObj.freeTextClear !== true )  csvBuff +=  '// opt:ftc:' + iniObj.freeTextClear.toString() + ' 入力自動クリア\n'
  if ( iniObj.textOnSpeak !== false )  csvBuff +=   '// opt:tos:' + iniObj.textOnSpeak.toString() + ' 発生時に表示\n'
  if ( iniObj.changeVol !== false )  csvBuff +=  '// opt:chv:' + iniObj.changeVol.toString() + ' ボリュームを制御する\n'
  if ( iniObj.modalTextRotate !== false )  csvBuff +=  '// opt:mtr:' + iniObj.modalTextRotate.toString() + ' 表示を反転\n'
  if ( iniObj.myVol !== 70 )  csvBuff +=  '// opt:myv:' + iniObj.myVol.toString() + ' ボリュームの値\n'
  if ( iniObj.replayScrnHold !== false )  csvBuff +=  '// opt:rsh:' + iniObj.replayScrnHold.toString() + ' もう一度を自動で閉じない\n'
  if ( iniObj.logLevel !== 10 )  csvBuff +=  '// opt:llv:' + iniObj.logLevel.toString() + ' ログレベル\n'
  if ( iniObj.homeScrn !== 0 )  csvBuff +=  '// opt:hsc:' + iniObj.homeScrn.toString() + ' ホーム画面\n'
  const d = new Date();    // Tue Apr 22 2025 23:46:00 GMT+0900 (日本標準時)
  csvBuff += '// saved ' + d + '\n'; writeLog(0, 'date:' + d);
  for (let i = 0 ; i < pgObj.length ; i++){
    if ((pgObj[i].pgTitle === '' ) && (pgObj[i].btnList.length <= 0)) { continue } // skip if blank page
    csvBuff += "//-----------------------------------------------(" + i.toString() + ")\n";
    csvBuff += '>>,' + i.toString() + ',' + pgObj[i].pgTitle + "," + pgObj[i].pgOption + "\n";
    pgObj[i].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1);
    for (let j = 0; j < pgObj[i].btnList.length ; j++) {
      if (pgObj[i].btnList[j].moji != '') {
        if (removeButtonHistory) {
            csvBuff +=  pgObj[i].btnList[j].moji 
              + "," + pgObj[i].btnList[j].speak 
              + "," + pgObj[i].btnList[j].tugi
              + "," + pgObj[i].btnList[j].option       
              + "\n";
        } else {
          csvBuff +=  pgObj[i].btnList[j].moji 
              + "," + pgObj[i].btnList[j].speak 
              + "," + pgObj[i].btnList[j].tugi
              + "," + pgObj[i].btnList[j].option       
              + "," + pgObj[i].btnList[j].defSeq.toString() 
              + "," + pgObj[i].btnList[j].usedDt.toString() 
              + "," + pgObj[i].btnList[j].numUsed.toString()
              + "\n";
        }
      } 
    }
  }
  csvBuff += "//-------------- End of Data ------------------------------\n";
  writeLog(0, csvBuff);
  return csvBuff
}

export function storeCSVdata(csvBuff:string){ // 頁毎に置換
  writeLog(20, 'storeCSVdata:read screen:' );
  let lineCount = 0;
  const lineData = csvBuff.split(/\n/);
  for ( let i = 0; i < lineData.length ; i++) { //Header Process
    lineData[i].trim();
    if (lineData[i] !== '') {  //　最初の空行はOK
      // if (lineData[i].indexOf("// button2speak config data:") !== 0 )
      if (!(/^\/\/.*(button2speak|speakpad) config data:($|.*$)/).test(lineData[i]))
        { Alert.alert('中止','このデータは読込めません:' + lineData[i]);
          writeLog(40, 'storeCSV error:not data.'+lineData[i]);
          return; }
      lineCount = i + 1;
      break; //見つけたら終了
    }  // 
  }
  if (lineCount < 1) {  
    Alert.alert('中止','このデータが有りません:');
    writeLog(40, 'storeCSV error:no data.'+lineData[0]);
    return };
// 
  let curPgNum = 0
  for (let i = 0 ; i < lineData.length ; i++) {  // process body 
    writeLog(0, 'line data:' + lineData[i]);
    if (lineData[i].length < 1) { lineCount++; continue }
    if (lineData[i] === '') {lineCount++; continue}
    if (lineData[i].indexOf('//') === 0 ) { // の中の文字処理（最初の行を含む）
      writeLog(0, 'read data:' + lineData[i]);
      if ((/^\/\/.*(opt:|button2speak config data:|speakpad config data:)(.*)/).test(lineData[i])) {
        scanIniText(lineData[i]);
        writeLog(20, 'storeCSVdata:' + i +' '+ lineData[i]);
      } 
      continue; // 次の行へ
    }
    const colData = lineData[i].split(',');
      writeLog(0, 'colData:' + i.toString() + ':' + colData[1] + colData[2]+'\n')
      if ((/^ *>>.*/).test(colData[0])) {      //   画面行のアイコン >>の後ろにコメントを入れられる
        // 画面行の処理
        writeLog(0, 'storeCSVdata screen:' + colData[0]);
        if (colData.length <= 1){Alert.alert('スキップ','data err:1: title data '+ i.toString()); continue}
        colData[1].trim()
        var regStr = new RegExp(/([0-9])+/) // 　'Scrn1-Scrn20'
        if(!regStr.test(colData[1])){Alert.alert('スキップ','data err:2: title data '+ i.toString()+lineData[i]); continue}
        colData[1].replace(regStr, '$1')
        curPgNum = parseInt(colData[1]); //   画面番号GET
        if (pgObj[curPgNum] === undefined ) {  // 未定義画面なら、そこまで空のデータ配列を作る
          for ( let k = pgObj.length ; k <= curPgNum; k++ ) {
            pgObj.push({ pgTitle:'', btnList:[], pgOption:'' })
          }
        }
        pgObj[curPgNum].btnList.splice(0)  //　ボタンデータを画面単位でクリア
        if((/^ *>>R.*/).test(colData[0])) { 
          writeLog(0, 'storeCSVdata Screen Replace:' + colData[0]);
          pgObj[curPgNum].btnList.splice(0) } //　>>R　で　ボタンデータを画面単位でクリア
        if (colData.length >= 3 ) {
          pgObj[curPgNum].pgTitle = colData[2].trim()
          writeLog(0, 'pg:' + curPgNum.toString() + ':' + pgObj[curPgNum].pgTitle);
          lineCount++ } //    画面タイトルセット
          if (colData.length >= 4 ) {
            pgObj[curPgNum].pgOption = colData[3].trim()} //画面オプションセット
      } else { //button データ
        // ボタン行の処理
        let regStr = new RegExp(/^[0-9]+$/)             // ボタン番号が有ったらスキップ （互換性維持）
        if( regStr.test(colData[0])){ colData.shift() } // ボタン番号が有ったらスキップ （互換性維持）
        if (colData.length < 1) { colData[0] = '' }
        if (colData.length < 2) { colData[1] = '' }
        if (colData.length < 3) { colData[2] = '' }  
        let regStr2 = new RegExp(/^Scrn([0-9]+)$/)   // linkが　Scrn# の時は　#に置換
        if (regStr2.test(colData[2])) { colData[2] = colData[2].replace(regStr2, '$1')}  // +（互換性維持）
        if (colData[1] === 'url') { colData[1] = colData[2]; colData[2] = 'url'}         // +（互換性維持）
        if (colData.length < 4) { colData[3] = '' }
        let defSeq = pgObj[curPgNum].btnList.length*10+10;
        if (colData.length > 4) { defSeq = parseInt(colData[4])}
        let usedDt = 0;
        if (colData.length > 5) { usedDt = parseInt(colData[5])} 
        if (usedDt === 0) {usedDt = 999 - defSeq}
        let numUsed = 0;
        if (colData.length > 6) { numUsed = parseInt(colData[6])}
        if (numUsed === 0) {usedDt = 999 - defSeq}
        writeLog(0, colData);
        pgObj[curPgNum].btnList.push({moji: colData[0].trim(), speak: colData[1].trim(),
          tugi: colData[2].trim(), option: colData[3].trim(), defSeq: defSeq, usedDt:usedDt, numUsed: numUsed})
        lineCount++
      }
  }
  for (let i = 0 ; i < pgObj.length; i++){
    removeDup(i) //画面ごとのボタンの重複、空欄を削除
  }
  lineCount--
//  Alert.alert('情報', lineCount.toString() +'件読込みました')
  return 
}
 
function scanIniText(inText:string){
  writeLog(0, 'scanIniText:start' )
  let matchText = inText.match(/.*(defaultButtonColor|dbc):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.defaultButtonColor = matchText[2] }
  matchText = inText.match(/.*(defualtTextColor|dtc):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.defualtTextColor = matchText[2] }
  matchText = inText.match(/.*(controlButtonColor|cbc):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.controlButtonColor = matchText[2]; }
  matchText = inText.match(/.*(controlBUttonBorder|cbb):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.controlButtonBorder = matchText[2]; }
  matchText = inText.match(/.*(ftc):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.freeTextClear = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(tos):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.textOnSpeak = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(chv):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.changeVol = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(mtr):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.modalTextRotate = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(myv):(\d+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.myVol = parseInt(matchText[2]) }  
  matchText = inText.match(/.*(rsh):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.replayScrnHold = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(llv):(\d+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.logLevel = parseInt(matchText[2]) }
  matchText = inText.match(/.*(hsc):(\d+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.homeScrn = parseInt(matchText[2]) }
}

export const shareLog = async () => {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) { return;  }
  await Sharing.shareAsync(logPath);  // ファイル共有
};

export const shareFile = async (removeButtonHistory:boolean) => {
  writeLog(20, 'shareFile:' );
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {   // 共有できるかチェック
    Alert.alert('共有できません', 'このデバイスでは共有機能が使えません');
    return;
  }
  await FileSystem.writeAsStringAsync(pgObjShare, makeCVSdata(removeButtonHistory), {
    encoding: FileSystem.EncodingType.UTF8, });
  writeLog(20, 'writeShare:'+ removeButtonHistory );
  await Sharing.shareAsync(pgObjShare);  // ファイル共有
};

export function makeLink(scnNum:number){ // make link to unliked page
  writeLog(20, 'makeLink:' );
  let linkCount = 0
  let linkList = [{linkNo:0, linkName:''}]
  linkList.splice(0)
  for (let scn = 0; scn < pgObj.length ; scn++) {  //リンク先一覧の作成
    for (let i = 0; i < pgObj[scn].btnList.length; i ++) {
      if (/([0-9])+/.test(pgObj[scn].btnList[i].tugi )) {
        linkList.push({ linkNo:parseInt(pgObj[scn].btnList[i].tugi),
          linkName:pgObj[scn].btnList[i].moji } ) }
    }
  }
  for (let i = 0 ; i < pgObj.length; i++){ //画面ごとにチェック（ホーム以外）
    if (i === iniObj.homeScrn) { continue; }
    if (pgObj[i].pgTitle === 'フリー') { continue; }
    let j = 0
    for ( j = 0; j < linkList.length; j++ ){
      if ( i === linkList[j].linkNo ) { break } // j = 0 - len-1
    }
    if ( j >= linkList.length) {  // not break リストにこの画面なし
      if(pgObj[i].pgTitle !== '' ) {
        pgObj[scnNum].btnList.push({ moji:pgObj[i].pgTitle , speak:'na', 
          tugi: i.toString(), option:'', defSeq:-999, usedDt:Date.now(), numUsed:1000 });
        writeLog(0, 'makeLInk: added ' + i);
      } else if( pgObj[i].btnList.length > 0 ) {
        pgObj[scnNum].btnList.push({ moji:'画面' + i.toString() , speak:'na', 
          tugi: i.toString(), option:'', defSeq:-999, usedDt:Date.now(), numUsed:1000 });
        writeLog(0, 'makeLInk: newScrn ' + i);
      }
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1).map((item,i)=> item.defSeq = i*10+10)
      linkCount++;   
    }
  }
  writeFile();
  if (linkCount > 0) {
    Alert.alert('リンクを作成しました') 
  } else {
    Alert.alert('リンクされない画面は有りません') 
  }
}

export function removeDup(scnNum:number){
  writeLog(0, 'removeDup:' + scnNum );
  // remove blank if exist
  let regStr = new RegExp(/^[0-9]+$/)
  for (let i = 0 ; i < pgObj[scnNum].btnList.length; i++){
    writeLog(0, 'texts:' + i.toString() + ';' +pgObj[scnNum].btnList.length);
    if (pgObj[scnNum].btnList[i] === undefined) { 
      writeLog(40, 'removeDup: reduce error'); }
    if (pgObj[scnNum].btnList[i].moji === '') { 
      pgObj[scnNum].btnList.splice(i,1)
      i--
    }
  } 
  const uniqueData = pgObj[scnNum].btnList.filter((item, index, self) => // remove duplicate 
    index === self.findIndex((t) => t.moji === item.moji && t.speak === item.speak && t.tugi === item.tugi ) );
  //pgObj[scnNum].btnList = {...uniqueData}
  writeLog(0, JSON.stringify(uniqueData));
  pgObj[scnNum].btnList = JSON.parse(JSON.stringify(uniqueData));
}

export function findButtonWidth(scrn:number){
  let cols = 2
  let matchText = pgObj[scrn].pgOption.match(/.*(\d)col|col:(\d)(\s.*|$)/)
  writeLog(0, 'match:' + matchText);
  if (matchText !== null) {
    if (matchText[1] !== undefined && matchText[1] !== null) {
     cols = parseInt(matchText[1])
    } else if (matchText[2] !== undefined && matchText[2] !== null) {
      cols = parseInt(matchText[2])
    }
  }
  writeLog(0, 'cols:' + cols);
  if (cols < 1) cols = 2;
  if (cols > 5) cols = 5;
  const width = Dimensions.get('window').width / cols - 5 ;
  writeLog(0, ('width:' + width));
  // buttonWidth = width;
  return width;
}

export function findButtonHeight(scrn:number){
  let buttonHeight:number;
  let numRow = 5;   // デフォルト値
  const windwHight = Dimensions.get('window').height;
  let matchText2 = pgObj[scrn].pgOption.match(/.*(sbh):(.+?)(\s+.*|$)/);
  if (matchText2 !== null && matchText2[2] !== undefined && matchText2[2] !== null) {
      buttonHeight = parseInt(matchText2[2]);  // sbh指定（高さ値）の場合
  } else {
    let matchText = pgObj[scrn].pgOption.match(/.*(row):(.+?)(\s+.*|$)/)
    if (matchText !== null && matchText[2] !== undefined && matchText[2] !== null) {
      numRow = parseInt(matchText[2]);
      if (numRow < 1) {numRow = 1}    
    }
    buttonHeight =(windwHight - 60)/ (numRow + 1) - 8; // row指定の場合の高さ
  }
  if (buttonHeight < 40) buttonHeight = 40
  if (buttonHeight > windwHight-100 ) buttonHeight = windwHight-100
  return buttonHeight
}

export function findBottmHeight(scrn:number){
  return Dimensions.get('window').height/8;
}

export function findFontSize(scrn:number, leng:number){ // scrn: current screen number, leng:文字の長さ
  let fontSize = 25;
  let matchText = pgObj[scrn].pgOption.match(/.*(sfs):(.+?)(\s+.*|$)/)
  writeLog(0, 'match:' + matchText);
  if (matchText !== null && matchText[2] !== undefined && matchText[2] !== null) {
      fontSize = parseInt(matchText[2])
  } else {
      fontSize =  Dimensions.get('window').width / 16;
  }
  if (leng > findButtonWidth(scrn)/15 ) fontSize -= 6;
  if (fontSize < 16) fontSize = 16
  if (fontSize > 50) fontSize = 50
  writeLog(0, 'Font:' + fontSize);
  return fontSize
}

export  function buttonSort(scnNum:number){
    writeLog(0, 'buttonSort:'+scnNum+':'+pgObj[scnNum].pgOption);
    if  ((/.*sort:dat.*/).test(pgObj[scnNum].pgOption) ){
      pgObj[scnNum].btnList.sort((a,b) => (a.usedDt < b.usedDt)? 1: -1);    //使用日時順
    } else if  ((/.*sort:cnt.*/).test(pgObj[scnNum].pgOption) ){
      writeLog(0, 'sort:cnt');
      pgObj[scnNum].btnList.sort((a,b) => (a.numUsed-a.defSeq < b.numUsed-b.defSeq)? 1: -1); //頻度順
    } else if ((/.*sort:def.*/).test(pgObj[scnNum].pgOption) ){
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1);  //定義順
    } else if ((/.*sort:dfr.*/).test(pgObj[scnNum].pgOption) ){
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? -1: 1);  //逆定義順
      writeLog(0, 'buttonSort:sort:dfr');
    } else { // not defined or non, def
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1);  //定義順
    }
    return <view></view> ;
  }
