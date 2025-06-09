import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Dimensions, Platform } from 'react-native';
import { defString } from './defaultText';

export default function dummy(){}

export let freeText =[{ key:0, label: '', value: '' }]

export let pgObj = [{ pgTitle:'', 
  btnList:[{moji:'', speak:'', tugi:'', option:'', defSeq:0, usedDt:0, numUsed:0 }], pgOption:'' }];

export let iniObj={
  defaultButtonColor:'#dcdcdc',
  defualtTextColor:'black', 
  controlButtonColor:'#ddff99',
  controlButtonBorder: 'gray',
  freeTextClear: true, 
  addFreeStack: false, 
  btn3col:false, 
  textOnSpeak:false, 
  changeVol:false, 
  modalTextRotate: false,  
  myVol:70,
  clearOnRead: true, 
  replayScrnHold: false,
  defaultSortType: 'def',
  removeButtonHistory: true,
  writeLogFile: false,
  logLevel: 0,
}

export const pgObjPath = FileSystem.documentDirectory + 'SpeakPad4.txt';
export const pgObjPathOld = FileSystem.documentDirectory + 'SpeakPad4Old.txt';
export const freeTextPath = FileSystem.documentDirectory + 'SpeakPad4FreeText.json';
export const iniObjPath = FileSystem.documentDirectory + 'SpeakPad4IniObj.txt';
export const pgObjShare = FileSystem.documentDirectory + 'SpeakPad4Data.txt';
export const logPath = FileSystem.documentDirectory + 'SpeakPad4Log.txt';

export let pgStack = [0]  // history of page move (use for Back button)
export let speakStack:string[] =[]  // history of spaak
export let mojiStack:string[] =[]  // history of spaak
export let dispText:string[] = []  // display text on modal
export let logFile:string = '' // log

export function resetIniObj() {
  writeLog( 0, 'resetIniObj:');
  iniObj = { // 初期化時に反映されるデータ
    defaultButtonColor:'#dcdcdc',
    defualtTextColor:'black', 
    controlButtonColor:'#ddff99',
    controlButtonBorder: 'gray',
    freeTextClear: true, 
    addFreeStack: false, 
    btn3col:false, 
    textOnSpeak:false, 
    changeVol:false, 
    modalTextRotate: false,  
    myVol:70,
    clearOnRead: true, 
    replayScrnHold: false,
    defaultSortType: 'def',
    removeButtonHistory: true,
    writeLogFile: false, 
    logLevel: 0,
  }
}

export function initData(){ //　初期化で呼ばれる処理
  writeLog( 0, 'initData 0:');
  resetIniObj();   // 初期値設定
  pgObj.splice(0) // 全てをクリア
  pgObj.push({ pgTitle:'', btnList:[], pgOption:'' });
  pgStack.splice(0)
  freeText.splice(0)
  storeCSVdata(defString, 0);
  writeLog( 0, 'initData E:' + defString.substring(0,100));
}

export async function readInitialFile() { // 開始時に呼ばれる処理
  writeLog( 0, 'readInitialFile 1:');
  if (Platform.OS === 'web' ) {
    initData();
    storeCSVdata(defString, 0);
    return }
  await readIniObj();  // 設定読込み
  let tmp = await FileSystem.getInfoAsync(pgObjPath); //　頁データ読込み
  if (tmp.exists) {
    try {
      const pgObjTxt = await FileSystem.readAsStringAsync(pgObjPath, {
        encoding: FileSystem.EncodingType.UTF8, 
      });
      // writeLog( 0, 'readInitialFile:' + pgObjTxt.substring(0,100));
      writeLog( 0, 'readInitialFile 2:');
      // writeLog( 0, 'readInitailFile:');
      storeCSVdata(pgObjTxt, 0) // 設定読込み（追加の設定も）
      readFreeText();
    } catch (e) {
      writeLog( 0, e);
      writeLog( 0, 'readInitialFile Error:' + pgObjPath + '\n');
    }
  } else { // if saved data not exist read from default definition
    writeLog( 0, 'readInitialFile 3: file not exist');
    initData();
    storeCSVdata(defString, 0);
    // writeLog( 0, 'readInitialFile 3:' + defString.substring(0,100));
    writeFile();
  }
}

export const writeFile = async () => {
  writeLog( 0, 'writeFile:1');
  if (Platform.OS === 'web' ) { return }
  var pgObjTxt = makeCVSdata(false);
  try {
    const tmp = await FileSystem.getInfoAsync(pgObjPath);  //以前のデータ
    if (tmp.exists) {
      const pgObjTxtOld = await FileSystem.readAsStringAsync(pgObjPath, {
        encoding: FileSystem.EncodingType.UTF8, });
      if (compString(pgObjTxt, pgObjTxtOld)) {             // 変更が有ったか？
        writeLog( 0, 'writeFile: data Same');
        writeIniObj();
        return
      }
      await FileSystem.copyAsync({     // 保存ファイルを改名
        from: pgObjPath,
        to:   pgObjPathOld, });
      writeLog( 0, 'writeFile rename:');
    }
    await FileSystem.writeAsStringAsync(pgObjPath, pgObjTxt, {
      encoding: FileSystem.EncodingType.UTF8, });
    writeLog( 0, 'writeFile:2');
    writeIniObj();
  } catch (e) {
    writeLog( 0, e);
    writeLog( 0, 'writeFile Error:' + pgObjPath + '\n');
  }
//  Alert.alert('情報','設定を保存しました')
}

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

export async function writeLog( level:number, text:any ){
  const date = new Date();
  date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  const d = date.toISOString().replace('T', ' ').substring(5,19);
  if (iniObj.writeLogFile) {
    console.log(d.substring(6) + ' ' + text );
    logFile += d + ' ' + text + '\n';
    await FileSystem.writeAsStringAsync(logPath, logFile, {
        encoding: FileSystem.EncodingType.UTF8, });
  } else {
    console.log('>' + d.substring(6) + ' ' + text );
  }
}

export const shareLog = async () => {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) { return;  }
  await Sharing.shareAsync(logPath);  // ファイル共有
};

export function makeCVSdata(removeButtonHistory:boolean) {
  writeLog( 0, 'makeCVSdata:' + removeButtonHistory);
  let csvBuff = "// button2speak config data:"
  if ( iniObj.defaultButtonColor !== '#dcdcdc' ) { csvBuff += ' dbc:' + iniObj.defaultButtonColor }
  if ( iniObj.defualtTextColor !== 'black' ) { csvBuff += ' dtc:' + iniObj.defualtTextColor }
  if ( iniObj.controlButtonColor !== '#ddff99' ) { csvBuff += ' cbc:' + iniObj.controlButtonColor }
  if ( iniObj.controlButtonBorder !== 'gray' ) { csvBuff += ' cbb:' + iniObj.controlButtonBorder }
  // if ( iniObj.defaultSortType !== 'def' ) { csvBuff += ' sort:' + iniObj.defaultSortType }
  csvBuff += '\n'
  const d = new Date();    // Tue Apr 22 2025 23:46:00 GMT+0900 (日本標準時)
  csvBuff += '// saved ' + d + '\n'; // writeLog( 0, 'date:' + d);
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
  // writeLog( 0, csvBuff);
  return csvBuff
}

export async function copyToClipboard(){
  writeLog( 0, 'copyToClipboard:' );
  await Clipboard.setStringAsync(makeCVSdata(iniObj.removeButtonHistory));
  Alert.alert('情報','クリップボードへ書込みました') 
}
  
export const shareFile = async () => {
  writeLog( 0, 'shareFile:' );
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {   // 共有できるかチェック
    Alert.alert('共有できません', 'このデバイスでは共有機能が使えません');
    return;
  }
  await FileSystem.writeAsStringAsync(pgObjShare, makeCVSdata(iniObj.removeButtonHistory), {
    encoding: FileSystem.EncodingType.UTF8, });
  writeLog( 0, 'writeShare:'+ iniObj.removeButtonHistory );
  await Sharing.shareAsync(pgObjShare);  // ファイル共有
};
  
export function storeCSVdata(csvBuff:string, scnNum:number){ // 頁毎に置換
  writeLog( 0, 'storeCSVdata:' + scnNum);
  let lineCount = 0;
  iniObj.defaultButtonColor = '#dcdcdc'
  iniObj.defualtTextColor = 'black' 
  iniObj.controlButtonColor = '#ddff99'
  iniObj.controlButtonBorder = 'gray'
//  writeLog( 0, 'storeCVSdata start ----------------------');
  const lineData = csvBuff.split(/\n/);
  for ( let i = 0; i < lineData.length ; i++) { //Header Process
    lineData[i].trim();
    if (lineData[i] !== '') {  //　最初の空行はOK
      // if (lineData[i].indexOf("// button2speak config data:") !== 0 )
      if (!(/^\/\/.*(button2speak|speakpad) config data:($|.*$)/).test(lineData[i]))
        { Alert.alert('中止','このデータは読込めません:' + lineData[i]); return }
      // if (lineData[i].indexOf("// button2speak config data:R") === 0 ) {  //　リプレイス指定
      //   if (scnNum !== 0) { Alert.alert('中止','全件リプレイスはホーム画面から実行してください' + lineData[i]); return }
      //   pgObj.splice(0); 
      //   pgObj.push({ pgTitle:'', btnList:[], pgOption:'' });
      // }
      lineCount = i + 1;
      break; //見つけたら終了
    }  // end of config data label
  }
  if (lineCount < 1) {  Alert.alert('中止','このデータが有りません:'); return };
// 
  let curPgNum = 0
  for (let i = 0 ; i < lineData.length ; i++) {  // process body 
//    writeLog( 0, 'line data:' + lineData[i]);
    if (lineData[i].length < 1) { lineCount++; continue }
    if (lineData[i] === '') {lineCount++; continue}
    if (lineData[i].indexOf('//') === 0 ) { // の中の文字処理（最初の行を含む）
      //      writeLog( 0, 'read data' + lineData[i]);
      if ((/^\/\/.*(opt:|button2speak config data:|speakpad config data:)(.*)/).test(lineData[i])) {
        scanIniText(lineData[i]);
        // writeLog( 0, 'storeCSVdata lineData:' +i+' '+ lineData[i]);
      }
      continue;
    }
    const colData = lineData[i].split(',');
//    writeLog( 0, 'colData:' + i.toString() + ':' + colData[1] + colData[2]+'\n')
      if ((/^ *>>.*/).test(colData[0])) {      //   画面行のアイコン >>の後ろにコメントを入れられる
        // 画面行の処理
//        writeLog( 0, 'storeCSVdata screen:' + colData[0]);
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
//        pgObj[curPgNum].pgTitle = '' //   既存ならタイトルそのまま　>>,12 の場合
        if( iniObj.clearOnRead ) { pgObj[curPgNum].btnList.splice(0) } //　ボタンデータを画面単位でクリア
        if((/^ *>>R.*/).test(colData[0])) { 
          // writeLog( 0, 'storeCSVdata Screen Replace:' + colData[0]);
          pgObj[curPgNum].btnList.splice(0) } //　>>R　で　ボタンデータを画面単位でクリア
        if (colData.length >= 3 ) {
          pgObj[curPgNum].pgTitle = colData[2].trim()
  //        writeLog( 0, 'pg:' + curPgNum.toString() + ':' + pgObj[curPgNum].pgTitle);
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
        let defSeq = pgObj[curPgNum].btnList.length*10;
        if (colData.length > 4) { defSeq = parseInt(colData[4])}
        let usedDt = 0;
        if (colData.length > 5) { usedDt = parseInt(colData[5])} 
        if (usedDt === 0) {usedDt = 999 - defSeq}
        let numUsed = 0;
        if (colData.length > 6) { numUsed = parseInt(colData[6])}
        if (numUsed === 0) {usedDt = 999 - defSeq}
  //      writeLog( 0, colData);
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

export function makeLink(scnNum:number){ // make link to unliked page
  writeLog( 0, 'makeLink:' );
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
  for (let i = 1 ; i < pgObj.length; i++){ //画面ごとにチェック（ホーム以外）
    if (pgObj[i].pgTitle === 'フリー') { continue; }
    let j = 0
    for ( j = 0; j < linkList.length; j++ ){
      if ( i === linkList[j].linkNo ) { break } // j = 0 - len-1
    }
    if ( j >= linkList.length) {  // not break リストにこの画面なし
      const lastSeq = Math.max(...pgObj[scnNum].btnList.map(item => item.defSeq),0)+10;
      if(pgObj[i].pgTitle !== '' ) {
        pgObj[scnNum].btnList.push({ moji:pgObj[i].pgTitle , speak:'na', 
          tugi: i.toString(), option:'', defSeq:lastSeq, usedDt:999-lastSeq, numUsed:999-lastSeq });
        // writeLog( 0, 'makeLInk: added ' + i);
        linkCount++;
      } else if( pgObj[i].btnList.length > 0 ) {
        pgObj[scnNum].btnList.push({ moji:'画面' + i.toString() , speak:'na', 
          tugi: i.toString(), option:'', defSeq:lastSeq, usedDt:999-lastSeq, numUsed:999-lastSeq });
        linkCount++;     
      }
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
  writeLog( 1, 'removeDup:' + scnNum );
  // remove blank if exist
  let regStr = new RegExp(/^[0-9]+$/)
  for (let i = 0 ; i < pgObj[scnNum].btnList.length; i++){
    //        writeLog( 0, 'texts:' + i.toString() + ';' +pgObj[scnNum].btnList.length);
    if (pgObj[scnNum].btnList[i] === undefined) { 
      writeLog( 0, 'removeDup: reduce error'); }
    if (pgObj[scnNum].btnList[i].moji === '') { 
      pgObj[scnNum].btnList.splice(i,1)
      i--
    }
  } 
  const uniqueData = pgObj[scnNum].btnList.filter((item, index, self) => // remove duplicate 
    index === self.findIndex((t) => t.moji === item.moji && t.speak === item.speak && t.tugi === item.tugi ) );
  //pgObj[scnNum].btnList = {...uniqueData}
  //writeLog( 0, JSON.stringify(uniqueData));
  pgObj[scnNum].btnList = JSON.parse(JSON.stringify(uniqueData));
}

export async function readIniObj() {  //設定読込み
  writeLog( 0, 'readIniObj:' )
  resetIniObj();  // 初期値を設定
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
      // writeLog( 1, 'readIniObj:\n' + readText);
      writeLog( 0, 'readIniObj:');
      return
      } catch (e) {
      writeLog( 0, e);
      writeLog( 0, 'readIniObj Error:' + iniObjPath + '\n');
    }
  } else {
    writeLog( 1, 'readIniObj: not exist');
  }
}

function scanIniText(inText:string){
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
  matchText = inText.match(/.*(afs):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.addFreeStack = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(b3c):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.btn3col = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(tos):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.textOnSpeak = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(chv):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.changeVol = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(mtr):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.modalTextRotate = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(myv):(\d+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.myVol = parseInt(matchText[2]) }  
  matchText = inText.match(/.*(cor):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.clearOnRead = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(rsh):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.replayScrnHold = (matchText[2]==='true')? true : false }
  matchText = inText.match(/.*(sort):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.defaultSortType = matchText[2] }
  matchText = inText.match(/.*(rbh):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.removeButtonHistory = (matchText[2]==='true')? true : false }  
  matchText = inText.match(/.*(wlf):(.+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.writeLogFile = (matchText[2]==='true')? true : false }  
  matchText = inText.match(/.*(llv):(\d+?)(\s+.*|$)/)
  if (matchText !== null && matchText[2] !== '') { iniObj.logLevel = parseInt(matchText[2]) }}

export const writeIniObj = async () => {
  writeLog( 0, 'writeIniObj:' )
  if (Platform.OS === 'web' ) { return }
  try{
    let writeText = ''
    // + 'dbc:' + iniObj.defaultButtonColor + '\n'
    // + 'dtc:' + iniObj.defualtTextColor +  '\n'
    // + 'cbc:' + iniObj.controlButtonColor +  '\n'
    // + 'cbb:' + iniObj.controlButtonBorder + '\n'
    + 'ftc:' + iniObj.freeTextClear.toString() + '\n'
    + 'afs:' + iniObj.addFreeStack.toString() + '\n'
    + 'b3c:' + iniObj.btn3col.toString() + '\n'
    + 'tos:' + iniObj.textOnSpeak.toString() + '\n'
    + 'chv:' + iniObj.changeVol.toString() + '\n'
    + 'mtr:' + iniObj.modalTextRotate.toString() + '\n'
    + 'myv:' + iniObj.myVol.toString() + '\n'
    + 'cor:' + iniObj.clearOnRead.toString() + '\n'
    + 'rsh:' + iniObj.replayScrnHold.toString() + '\n'
    + 'sort:' + iniObj.defaultSortType + '\n'
    + 'rbh:' + iniObj.removeButtonHistory.toString() + '\n'
    + 'wlf:' + iniObj.writeLogFile.toString() + '\n'
    + 'llv:' + iniObj.logLevel.toString() + '\n'
    await FileSystem.writeAsStringAsync(iniObjPath, writeText, {
      encoding: FileSystem.EncodingType.UTF8, });
    // writeLog( 0, 'writeIniObj:\n' + writeText );
  } catch (e) {
    writeLog( 0, e);
    writeLog( 0, 'writeIniObj Error:' + iniObjPath );
  }
}

export const writeFreeText = async () => {
  writeLog( 0, 'writeFreeText:' )
  if (Platform.OS === 'web' ) { return }
  try{
    const writeText = JSON.stringify(freeText)
    await FileSystem.writeAsStringAsync(freeTextPath, writeText, {
      encoding: FileSystem.EncodingType.UTF8, });
      writeLog( 1, 'writeFreeText 2:' );
  } catch (e) {
    writeLog( 0, e);
    writeLog( 0, 'writeFreeText Error:' + freeTextPath + '\n');
  }
}

export async function readFreeText() {
  writeLog( 0, 'readFreeText:' )
  if (Platform.OS === 'web' ) { return null }
  let tmp = await FileSystem.getInfoAsync(freeTextPath);
  if (tmp.exists) {
    try {
      const readText = await FileSystem.readAsStringAsync(freeTextPath, {
        encoding: FileSystem.EncodingType.UTF8, });
      freeText = JSON.parse(readText);
      writeLog( 1, 'readFreeText 2:');
      return
      } catch (e) {
      writeLog( 0, e);
      writeLog( 0, 'readFreeText Error:' + freeTextPath + '\n');
    }
  } else {
    // writeLog( 0, 'readFreeText: not exist');
  }
}

export function findButtonWidth(scrn:number){
  let cols = 2
  let matchText = pgObj[scrn].pgOption.match(/.*(\d)col|col:(\d)(\s.*|$)/)
  // writeLog( 0, 'match:' + matchText);
  if (matchText !== null) {
    if (matchText[1] !== undefined && matchText[1] !== null) {
     cols = parseInt(matchText[1])
    } else if (matchText[2] !== undefined && matchText[2] !== null) {
      cols = parseInt(matchText[2])
    }
  }
  // writeLog( 0, 'cols:' + cols);
  if (cols < 1) cols = 2;
  if (cols > 5) cols = 5;
  const width = Dimensions.get('window').width / cols - 5 ;
  // writeLog( 0, ('width:' + width));
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
      let numRow = parseInt(matchText[2]);
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
  // writeLog( 0, 'match:' + matchText);
  if (matchText !== null && matchText[2] !== undefined && matchText[2] !== null) {
      fontSize = parseInt(matchText[2])
  } else {
      fontSize =  Dimensions.get('window').width / 16;
  }
  if (leng > findButtonWidth(scrn)/15 ) fontSize -= 6;
  if (fontSize < 16) fontSize = 16
  if (fontSize > 50) fontSize = 50
  // writeLog( 0, 'Font:' + fontSize);
  return fontSize
}

export  function buttonSort(scnNum:number){
    // writeLog( 0, 'buttonSort:'+pgObj[scnNum].pgOption);
    if  ((/.*sort:dat.*/).test(pgObj[scnNum].pgOption) ){
      pgObj[scnNum].btnList.sort((a,b) => (a.usedDt < b.usedDt)? 1: -1);    //使用日時順
    } else if  ((/.*sort:cnt.*/).test(pgObj[scnNum].pgOption) ){
      // writeLog( 0, 'sort:cnt');
      pgObj[scnNum].btnList.sort((a,b) => (a.numUsed-a.defSeq < b.numUsed-b.defSeq)? 1: -1); //頻度順
    } else if ((/.*sort:def.*/).test(pgObj[scnNum].pgOption) || iniObj.defaultSortType === 'def'){
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1);  //定義順
    } else if (iniObj.defaultSortType === 'dat') {
      pgObj[scnNum].btnList.sort((a,b) => (a.usedDt < b.usedDt)? 1: -1);    //使用日時順
    } else if (iniObj.defaultSortType === 'cnt') {
      pgObj[scnNum].btnList.sort((a,b) => (a.numUsed-a.defSeq < b.numUsed-b.defSeq)? 1: -1); //頻度順
    } else { // not defined or non, def
      pgObj[scnNum].btnList.sort((a,b) => (a.defSeq > b.defSeq)? 1: -1);  //定義順
    }
    return <view> </view> ;
  }
