//@TestUIScript

if ( !LS.Globals.Scripts ){
  LS.Globals.Scripts = {};
}

LS.Globals.Scripts["root/TestUIScript"]  = this;

// Includes 
let CoreScript = LS.Globals.Scripts["root/CoreScript"];
let TablesScript = LS.Globals.Scripts["root/TablesScript"];


let Arpa2to1 = null;


let ccsv_test1 = "file,word,phoneme,time_1third,time_mid,time_2third,time_start,time_end,duration,F0_avg,F1_1third,F1_mid,F1_2third,F2_1third,F2_mid,F2_2third,F3_1third,F3_mid,F3_2third\n\
sound,I,AY1,0.2352985638696667,0.2818594104305,0.3284202569913333,0.142176870748,0.421541950113,0.279365079365,239.3296371986731,998.4284919851535,928.7885197592663,744.3401407914839,1171.708819211405,1785.6421202903334,2141.724186003266,1557.8412421125886,2485.607646023819,2577.9396030684043\n\
sound,SEE,S,0.5113378684803334,0.556235827664,0.6011337868476666,0.421541950113,0.690929705215,0.26938775510199997,261.16497501079743,1025.1174281992373,1026.2741851943783,1078.0661658034653,2092.693391275222,2115.31143568311,2139.7199774997966,3101.502874201657,3032.6729304964797,3038.569145590801\n\
sound,SEE,IY1,0.8272864701433333,0.8954648526075,0.9636432350716667,0.690929705215,1.1,0.4090702947850001,219.55365871364265,279.60077431740376,349.0146246424963,328.3728601627536,1245.0779338080326,1457.073144692101,2516.835555034153,2842.9962188787017,2843.931851255462,2803.8663313596876\n\
sound,FIVE,F,1.3328042328066667,1.339455782315,1.3461073318233332,1.31950113379,1.35941043084,0.0399092970499999,0,1004.7647336460006,1162.0636510359188,1390.9555422456597,2067.858408550074,2034.494441601186,2014.6725126138833,3073.141550234638,2935.8265667305523,2831.7394902775536\n\
sound,FIVE,AY1,1.50574452003,1.5789115646249998,1.65207860922,1.35941043084,1.79841269841,0.43900226757000005,218.57315223145864,965.2666788347843,1021.2403020501249,814.7881445188813,1393.7834746358387,1112.5463572469496,2102.2242285759157,1428.5441663265824,1726.7040183434592,2798.327067624766\n\
sound,FIVE,V,1.83499622071,1.8532879818599999,1.87157974301,1.79841269841,1.90816326531,0.10975056690000007,216.53352417971084,312.61244524038943,239.5160064630185,248.94455077176318,1690.4389039315336,1735.1125744345313,1840.0117877829923,2760.2922768031576,2647.4881243077907,2932.0126658049553\n\
sound,LAMPS,L,2.11768707483,2.14761904762,2.1775510204099997,2.05782312925,2.23741496599,0.1795918367399998,200.3703208315087,398.35456770089957,395.0195302434569,407.6333437118534,1111.0092991661297,1107.7837586932585,1077.4343970041332,3573.6700588086514,3546.2983019860776,3548.6702393346113\n\
sound,LAMPS,AE1,2.30060468632,2.3321995464849996,2.36379440665,2.23741496599,2.42698412698,0.1895691609900001,176.06716371234205,646.3432343120663,769.1088926137911,807.614524407265,1843.5126205003776,1987.961428732555,1892.9071501789965,3019.562344516627,3066.2377357362802,2888.614590171278\n\
sound,LAMPS,M,2.48019652305,2.506802721085,2.5334089191199998,2.42698412698,2.58662131519,0.15963718821000006,147.46915724410275,266.0852817428645,531.964560281891,419.06019225700095,1546.8000134812116,1530.1293529877014,1866.4531199995909,2605.480579654662,2700.8894351307167,2838.8886288373433\n\
sound,LAMPS,P,2.596598639453333,2.601587301585,2.6065759637166668,2.58662131519,2.61655328798,0.02993197279000004,0,691.2458265864213,724.040632407555,801.197597676082,1803.3527598014846,1772.6302034709267,1794.2955286671017,2617.970132186042,2927.046043419025,3035.344174535534\n\
sound,LAMPS,S,2.67641723356,2.70634920635,2.73628117914,2.61655328798,2.79614512472,0.17959183674000023,0,913.4690756777682,1066.2244018336849,875.4417948956661,1901.6794826052665,2044.9400918314054,1868.710558270545,2910.9315747212877,3118.131847928428,2931.618136311723\
";


let csv_test2 = "file,word,phoneme,time_1third,time_mid,time_2third,time_start,time_end,duration,F0_avg,F1_1third,F1_mid,F1_2third,F2_1third,F2_mid,F2_2third,F3_1third,F3_mid,F3_2third\n\
sound,FIRST,F,0.10226757369606666,0.11224489795905,0.12222222222203333,0.0823129251701,0.142176870748,0.05986394557790001,291.0159432272836,1429.3429833717241,682.3238995334717,430.2928227432092,2214.64152453537,1806.567107024435,1546.1973473870073,3110.389344939676,2937.315813686177,2632.065204097677\n\
sound,FIRST,ER1,0.18208616780033335,0.2020408163265,0.22199546485266666,0.142176870748,0.261904761905,0.119727891157,287.66566321552614,549.8801692703531,539.3061286734804,520.5241700557693,1574.684688740652,1616.4508911875441,1672.4503983213613,2355.4365890292124,2323.464596810073,2304.1422271429997\n\
sound,FIRST,S,0.3084656084656667,0.33174603174600004,0.35502645502633334,0.261904761905,0.401587301587,0.139682539682,292.4209412501607,293.88254314602193,1612.34770963318,1571.8877126452883,1955.9468333330296,2649.022236103728,3028.623226909181,2968.7442204571284,3267.0109979072345,3344.57838119963\n\
sound,FIRST,T,0.41156462585000003,0.41655328798150004,0.421541950113,0.401587301587,0.431519274376,0.029931972789000005,233.65235656958038,326.3830793521367,289.3843536233771,244.78606789303782,1585.3524788178152,1583.212669823136,1552.4269090192822,2612.1575920776695,2609.455452243344,2617.9959781124276\n\
sound,BASEMENT,B,0.45479969765666667,0.466439909297,0.4780801209373334,0.431519274376,0.501360544218,0.06984126984200001,229.73837176535505,249.42540314449232,254.1842321932103,338.39849547628614,1322.5555617182931,1406.3734631995944,1649.996598407604,2629.3955413471563,2614.891060758427,2757.969268152982\n\
sound,BASEMENT,EY1,0.54126984127,0.561224489796,0.5811791383220001,0.501360544218,0.621088435374,0.11972789115600002,218.80571496517666,441.0268761251991,430.29544648040417,422.7599986749584,2081.919770099154,2138.9083279804186,2295.9045924335205,2769.9422640036955,2781.433649233393,2803.4373554437902\n\
sound,BASEMENT,S,0.651020408163,0.6659863945575,0.6809523809520001,0.621088435374,0.710884353741,0.08979591836699996,200.71674138868738,1743.3628160749581,217.20561236104936,209.53201164827675,2932.0412206528827,1611.0015284674828,1591.5877799715129,4071.0089735055603,2722.476866465159,2700.18030634992\n\
sound,BASEMENT,M,0.727513227513,0.735827664399,0.744142101285,0.710884353741,0.760770975057,0.04988662131599997,216.2388584921144,300.67982972271164,368.09587596315424,451.5033697942324,1465.2973471886198,1501.930425835462,1513.3705205430213,2669.07961329332,2760.8279567359364,2791.6855436813667\n\
sound,BASEMENT,AH0,0.780725623583,0.7907029478459999,0.800680272109,0.760770975057,0.820634920635,0.05986394557800001,199.0935923331678,613.6844712948409,616.6259995635259,605.723337614397,1608.5872699332692,1606.1371141097013,1630.028194518107,2980.5979371187645,2977.32552310617,3090.5508242151436\n\
sound,BASEMENT,N,0.8671957671956667,0.890476190476,0.9137566137563333,0.820634920635,0.960317460317,0.13968253968200006,190.38985436666022,350.08610619712715,354.3279267266433,322.48375125368943,1598.9893059321516,1786.7039322298199,1568.803365178906,2813.3779566946105,2798.097384200506,2741.361072232786\n\
sound,BASEMENT,T,0.9702947845803334,0.975283446712,0.9802721088436667,0.960317460317,0.990249433107,0.029931972789999928,182.23957458247864,316.23785492027974,315.9096279573166,314.5817265242188,1653.9567635789635,1660.863899698858,1654.0683038562365,2820.152727062142,2815.5350491649256,2792.862166403421\n\
sound,LEVEL,L,1.0002267573713333,1.0052154195035001,1.0102040816356668,0.990249433107,1.0201814059,0.029931972793000083,189.2206783965463,305.2106923325332,317.1312574235153,342.90298754553703,1660.670644151545,1677.82087777964,1698.708519688467,2698.3005866302865,2721.8287411921633,2757.028437798906\n\
sound,LEVEL,EH1,1.0534391534433334,1.070068027215,1.0866969009866667,1.0201814059,1.11995464853,0.09977324262999998,189.1831637206835,570.2185776333715,565.0777309443546,547.2743687133445,1909.9003781327726,1906.2551406524933,1876.0003614972768,2884.7931951440405,2867.503013348525,2822.4325064285754\n\
sound,LEVEL,V,1.1465608465633335,1.1598639455800002,1.1731670445966667,1.11995464853,1.19977324263,0.07981859410000003,164.58158786545786,255.37463469551088,288.45769571900416,330.9725641014768,1405.6339267880273,1431.852924479143,1303.7003896282988,2498.4863827943814,2560.8414719437333,2544.5161383590557\n\
sound,LEVEL,AH0,1.2330309901733334,1.249659863945,1.2662887377166667,1.19977324263,1.29954648526,0.09977324262999998,148.5371248701461,419.21466941255056,401.1454376893738,399.2955313542337,1270.2224527872772,1251.2301146757789,1247.4825269335436,2575.893982940929,2539.2161630108385,2569.924694734794\n\
sound,LEVEL,L,1.3261526832966668,1.339455782315,1.3527588813333333,1.29954648526,1.37936507937,0.07981859411000003,146.75770989767733,292.98090364401145,258.92528003737993,224.7401524663744,1425.266228652385,1514.1146270485433,1441.430250629297,2811.0122926556273,2897.6144778792473,2673.9719710078575";

function ensureArpa2to1 ( phoneme ){
    while ( !(phoneme in Arpa2to1) && phoneme.length > 0){
      phoneme = phoneme.slice(0,phoneme.length-1);    
    }
    phoneme = ( phoneme.length > 0 ) ? Arpa2to1[phoneme] : ".";  
		return phoneme;
}

function* yielderCSV ( text ){
  // milawukee forced aligner uses this format
  let parsedCsv = CSV.parse(text);
  if ( parsedCsv.length < 1 ) { return null; }
  
  let phonemeIdx = parsedCsv[0].indexOf('phoneme');
  let phstartIdx = parsedCsv[0].indexOf('time_start');
  let phendIdx = parsedCsv[0].indexOf('time_end');

  if ( phonemeIdx === -1 || phstartIdx === -1 || phendIdx === -1 ) { return null; }

  
  for ( let i = 1; i < parsedCsv.length; ++i ){ 
    let entry = parsedCsv[ i ];
    let timeStart = parseFloat( entry[ phstartIdx ] );
    let timeEnd = parseFloat( entry[ phendIdx ] );
    let phoneme = entry[ phonemeIdx ];
    
    yield { ts: timeStart, te: timeEnd, p: phoneme };
  }
  return null;
}

function* yielderTEXTGRID ( text ){
  // milawukee forced aligner uses this format
  let parsed = TextGrid.TGtoJSON( text );
  if ( !parsed.items || parsed.items.length < 1 ) { return null; }
  
  // find item with phonemes and get its intervals array
  let phonemesArray = null;
  for ( let i = 0; i < parsed.items.length; ++i ){
    let item = parsed.items[ i ]; 
    if (  item.name == "sentence - phones" || item.name == "phones" ){
      phonemesArray = item.intervals;
      break;
    }
  }
  if ( !phonemesArray || phonemesArray.length < 1 ) { return null; }
  
  // yield
  for ( let i = 0; i < phonemesArray.length; ++i ){ 
    let entry = phonemesArray[ i ];
    let timeStart = entry[ "xmin" ];
    let timeEnd = entry[ "xmax" ];
    let phoneme = entry[ "text" ];
    
    yield { ts: timeStart, te: timeEnd, p: phoneme };
  }
  return null;
}


let PARSERS = {
  CSV: 1,
  TEXTGRID: 2
};

this.parseForcedAligner = function ( text, parserType = PARSERS.CSV ){
  
  
  const yielder = ( parserType == PARSERS.CSV ) ? yielderCSV( text ) : yielderTEXTGRID( text );
  
  let lastTime = 0; // integer miliseconds

  let csvText = "";
  let csvTimings = [];
  
  let currEntry = null;
  // check each phoneme in csv 
  while(  currEntry = yielder.next().value ){ 

    let currStart = currEntry[ "ts" ];
    let currEnd = currEntry[ "te" ];
    // ensure phoneme exists or change it to '.'
    let phoneme = ensureArpa2to1( currEntry[ "p" ] );



    if ( isNaN( currStart ) || isNaN( currEnd ) ) { continue; }

    // convert to miliseconds and integers. 
    // More precision than 1 milisecond is pointless
    currStart = Math.trunc( currStart * 1000 );
    currEnd = Math.trunc( currEnd * 1000 );

    if ( currStart < lastTime ){ currStart = lastTime; }
    if ( currEnd < currStart ){ continue; }

    // time at which space-phoneme is transformed into a full-stop-phoneme
    let phFullStopTimeCt = 3* Math.trunc( 1000.0/8.0 );

    // add space or full stop before this phoneme if necessary
    let spaceTime = currStart - lastTime;
    if ( spaceTime > 0 ){ 	
      if ( spaceTime >= phFullStopTimeCt ){
        csvText += ".";
        csvText += ".";
        csvTimings.push( phFullStopTimeCt / 1000.0 );
        csvTimings.push( ( spaceTime - phFullStopTimeCt ) / 1000.0 );
      }
      else {
         csvText += " "; 
         csvTimings.push( spaceTime / 1000.0 );
      } 

    }


    // if phoneme lasts too much make a short intro and then keep static phoneme
    let duration = currEnd-currStart;
    let phRepetitionTimeCt = 3* Math.trunc( 1000.0/8.0 );
    if ( duration > phRepetitionTimeCt ){
        csvText += phoneme;
        csvTimings.push( phRepetitionTimeCt / 1000.0 ); 
        duration -= phRepetitionTimeCt;
    }
    
    // add phoneme to list
    csvText += phoneme;
    csvTimings.push( duration / 1000.0 );
    lastTime = currEnd;  


  }
  return { text : csvText, timings: csvTimings };
} // end of parseForcedAligner
let parseForcedAligner = this.parseForcedAligner;



let TESTCASES = [];

function createTestCase_T2L ( obj ){
//  if ( !obj.text ) { return false; } 
  if ( ! ( obj.times instanceof Float32Array ) ) { obj.times = null; }  
  if ( typeof( obj.audio ) !== 'string' ) { obj.audio = null; }  
  obj.coart = !!obj.coart;  
  if ( typeof( obj.title ) !== 'string' ) { obj.title = "TEST"; } 
  if ( typeof( obj.sentenceTime ) !== 'number' ) { obj.sentenceTime = null; }
  if ( typeof( obj.speed ) !== 'number' ) { obj.speed = null; }
  if ( typeof( obj.delay ) !== 'number' ) { obj.delay = null; }
   
  if ( typeof( obj.textLink ) == 'string' ) {
    obj.text = null;
    let parserType = obj.textLink.slice( obj.textLink.lastIndexOf(".") );
    if (parserType == ".csv"){ parserType = PARSERS.CSV; }
    else{ parserType = PARSERS.TEXTGRID; }
    
    let thatObj = obj;
    fetch( thatObj.textLink )
    .then( response => response.text() )
    .then( function( text ){
      let results = parseForcedAligner( text, parserType );
      thatObj.text = results.text;
      thatObj.times = new Float32Array( results.timings );
      thatObj.outro = true;
    });
  
  }
  else if ( !obj.text ) { return false; }
  
  TESTCASES.push( obj );
  let button = CoreScript.GUI.createButton( obj.title, function(){ CoreScript.lipsyncModule.start(CoreScript.LIPSYNCMODES.TEXT2LIP, TESTCASES[this.testId]); }, "rgba(207,209,134,1)", "rgba(207,209,134,0.5"); //'#CFD186', '#CFD1867F' );
	button.testId = TESTCASES.length-1;
  return true;
};


function createTestCase_A2L ( obj ){
  if ( typeof( obj.title ) !== 'string' ) { obj.title = "TEST"; } 
  if ( typeof( obj.audio ) !== 'string' ) { obj.audio = null; }  

  TESTCASES.push( obj );
  let button = CoreScript.GUI.createButton( obj.title, function(){ CoreScript.lipsyncModule.start(CoreScript.LIPSYNCMODES.AUDIO2LIP, TESTCASES[this.testId]); }, "rgba(135,195,143,1)","rgba(135,195,143,0.5)");//'#87C38F', '#87C38F7F' );
	button.testId = TESTCASES.length-1;
  return true; 
}


function createTestsUI (){
    let ui = document.getElementById("TestManagementUI");
    if (ui){
      document.getElementsByTagName('body')[0].removeChild(ui);
    }
  
  // Parent div of all Test creation/deletion-----------------------------------------
  let TestManagementUI = document.createElement("div");
  TestManagementUI.id = "TestManagementUI";
  TestManagementUI.style.zIndex = 10;
  TestManagementUI.style.position ="absolute";
  TestManagementUI.style.backgroundColor = "#8AA8A1";//"#CBCBD4";
  TestManagementUI.style.width = "75%";
  TestManagementUI.style.height = "75%";
  TestManagementUI.style.top = "12%";
  TestManagementUI.style.left = "12%";
  TestManagementUI.style.borderRadius = "35px";
  TestManagementUI.style.overflow = "hidden";
  TestManagementUI.style.fontSize = "large";
	TestManagementUI.addEventListener('click', function(e){ e.stopPropagation(); });
  TestManagementUI.makeVisible = function ( b ){
   if ( b ) TestManagementUI.style.display = '';
    else TestManagementUI.style.display = 'none';
  }
  TestManagementUI.makeVisible(false);
  
  let close = document.createElement("button");
  close.style.position ="absolute";
  close.style.backgroundColor = "#C00000";
  close.style.color = "#FFFFFF";
  close.style.right = "1%";
  close.style.top = "1%";
  close.style.margin = "3%";
  close.innerText = "X";
  close.id = "close";
  close.addEventListener('click', function (evt){ TestManagementUI.makeVisible(false); });
  TestManagementUI.appendChild(close);

  
  let styledHR = document.createElement("hr");
  styledHR.style.width = "94%";
  styledHR.style.margin = "3%";

  // Test creation UI -------------------------------------------------------------------
  let TestAddUI = document.createElement("div");
  TestAddUI.id = "CreateTestUI";
  TestAddUI.style.backgroundColor = "rgba(0,0,0,0)";
  TestAddUI.style.width = "98%";
  TestAddUI.style.height = "94%";
  TestAddUI.style.margin = "3%";
  TestAddUI.style.overflow = "auto";
  TestAddUI.style.fontSize = "large";
  TestManagementUI.appendChild(TestAddUI);

  // textareas
  function createTextArea( placeholder, DomToAttach ){
    let area = document.createElement("textarea");
    DomToAttach.appendChild( area );
    area.style.marginLeft = "3%";
    area.style.marginTop = "1%";
    area.style.width= "94%";
    area.rows="5";
    area.cols="40";
    area.style.display = 'block';
    area.placeholder= placeholder;
    return area;
  };
  
  
 
  // uploads to textareas
  function createFileUploader ( destTextArea, DomToAttach ){
    let fileUploader = document.createElement("input");
    fileUploader.type = "file";
    fileUploader.style.display = "block";
    fileUploader.style.margin = "3%";
    fileUploader.addEventListener('change', function(e){ 
      if ( !fileUploader.files || fileUploader.files.length <= 0 ) { return; }
      let file = fileUploader.files[0];

      if ( destTextArea.audioURL ){ URL.revokeObjectURL( destTextArea.audioURL ); destTextArea.audioURL = null; } // audio file changed before submiting

      if ( file.type.match('audio.*') ){  // audio file
        destTextArea.audioURL = URL.createObjectURL(file);
        destTextArea.value = destTextArea.audioURL;
      }
      else{                               // text file
        file.text().then( function (txt) { destTextArea.value = txt; });
      }
    });  
    DomToAttach.appendChild(fileUploader);
    return fileUploader;
  }
  
  function createInputNumber ( textId, labelText, DomToAttach  ){
    let input = document.createElement("input");
    input.type ="number";
    input.id = textId;
    input.style.margin = "1em";
    input.value = 0;
    
    DomToAttach.appendChild(document.createElement("br") );
    let label = createLabel( input, labelText, DomToAttach );
    label.style.margin = "3%";
    DomToAttach.appendChild(input);
    
    function getValue() { let value = parseFloat(this.node.value); if ( isNaN(value) || value < 0 ){ return 0; } return value; };
    function setValue( value ) { if ( typeof(value) === 'number' && value > 0 ){ this.node.value = value } else { this.node.value = 0; }}
    function makeVisible ( b ) { let state = "none"; if ( b ){ state=""; } this.node.style.display = state; this.label.style.display = state; }
    return { node: input, label: label, getValue: getValue, setValue: setValue, makeVisible: makeVisible };
  }
    
  function createLabel ( DomToLabel, text, DomToAttach ){
      let label = document.createElement("label");
      label.htmlFor = DomToLabel.id;
      label.id = "LabelFor"+DomToLabel.id;
      label.style.color = "black";
      label.appendChild(document.createTextNode(text));
  		DomToAttach.appendChild( label );
      return label;
  }
  
  function createInputCheckbox ( id, labelText, defaultValue, DomToAttach ){
    let checkbox = document.createElement("input");  
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = !!defaultValue;
    checkbox.style.marginLeft = "3%";
    checkbox.style.marginTop = "3%";
    checkbox.style.width = "1.5em";
    checkbox.style.height = "1.5em";
    DomToAttach.appendChild( checkbox );
    let label = createLabel( checkbox, labelText, DomToAttach ); 
    return { node: checkbox, label: label };
  }
  
  function createSelector ( id, labelText, optionsArray, defaultSelection, DomToAttach ) {
    let selector = document.createElement( "select" );
    selector.id = id;
    selector.style.marginLeft = "3%";
    selector.style.marginTop = "3%";
    let label = createLabel( selector, labelText, DomToAttach ); 
    label.style.marginLeft = "3%";
    label.style.marginTop = "3%";

    for ( let i = 0; i < optionsArray.length; ++i ){
      let opt = document.createElement('option');
      opt.value = i;
      opt.innerText = optionsArray[i];
      selector.appendChild(opt);
    }
    defaultSelection = CoreScript.clamp( defaultSelection, 0, optionsArray.length );
    selector.selectedIndex = defaultSelection;
    DomToAttach.appendChild(selector);
    function makeVisible ( b ) { let state = "none"; if ( b ){ state=""; } this.node.style.display = state; this.label.style.display = state; }
    return { node: selector, label: label, makeVisible: makeVisible };
  } 
  
  function createParagraph ( text, DomToAttach ){
    let node = document.createElement("p"); 
    node.style.color = "black";
    node.style.fontSize = "large";
    node.style.margin = "3%";
    node.innerHTML = "<p>" + text + "</p>";
    DomToAttach.appendChild( node );
    return node;
  }
  
  // Test creation UI --> checkbox of CSV vs Manual entry +++++++++++
  let modeSelector = createSelector( "modeSelector", "Input Modes", [ "Manual", "CSV", "TextGrid" ], "Manual", TestAddUI);
  
  // Test creation UI --> text and Timings explanations ++++++++++++++++++++++++++++
  let textTimingExplanation = createParagraph( "Manually write all phonemes. They must be written in \
<a style=\"color:blue\" href=\"https://en.wikipedia.org/wiki/ARPABET\">ARPABET</a> \
consonant or vowal format separated by comas. Spaces \" \" and full stops \".\" are allowed<br><br>\
Arpabet 1-letter format:   <i>Bird --> bRd</i> <br><br>\
Arpabet 2-letter format:   <i>Bird --> B,ER,D</i> <br><br>\
Optionally you can specify (from high to low precedence): <br><br>\
--- Duration (seconds) of each phoneme as:   <i>0.2,1.2,0.5</i><br><br>\
--- Sentence duration (seconds) as:  <i>3.2</i><br><br>\
--- Mouthing Speed (phonemes per second) as:<i>8.7</i>", TestAddUI );
  
  let csvExplanation = createParagraph( "Load from a CSV file or manually in csv format. <br><br>\
If you have an audio file and its plain text transcription, use the  \
<a style=\"color:blue\" href=\"https://web.uwm.edu/forced-aligner/form\">Online Forced Aligner from the University of Wisconsin</a> \
to phonetically transcript it. Load the resulting CSV file. <br><br>\
If manually writing CSV, there are 3 MANDATORY COLUMNS that must appear: <i>phoneme , time_start , time_end</i><br><br>\
Phonemes must be written in \
<a style=\"color:blue\" href=\"https://en.wikipedia.org/wiki/ARPABET\">ARPABET</a> \
2-letter consonant or vowal format separated by comas. Spaces \" \" and full stops \".\" are allowed<br>\
Example:   <i>Bird --> B,ER,D</i> <br>\
time_start and time_end must be written as:  <i>0.2</i>", TestAddUI );

    let textGridExplanation = createParagraph( "Load from a TextGrid file or manually in .TextGrid format. <br><br>\
If you have an audio file and its plain text transcription, use the  \
<a style=\"color:blue\" href=\"http://darla.dartmouth.edu/uploadtxt\">Online Forced Aligner from the  Neukom Institute for Computational Science</a> \
to phonetically transcript it. Load the resulting .TextGrid file.", TestAddUI );

  
  // which arpabet system to use (only for manual inputs) ++++++++++++++++++++++++++++
//  let checkboxArpa_1 = createCheckbox( "  Use ARPABET 1 letter system", TestAddUI, false );
//  let checkboxArpa_2 = createCheckbox( "  Use ARPABET 2 letter system", TestAddUI, true  );

  // select phoneme dictionary (arpabet1 arpabet2, etc) +++++++++++++++
  let encodingSelector = createSelector ( "dictionarySelect", "Phoneme enconding:", ["Arpabet 1-letter","Arpabet 2-letter"], 1, TestAddUI );

  
  // Test creation UI --> text and Timings ++++++++++++++++++++++++++++  
  let textareaText = createTextArea( "Write here using Arpabet", TestAddUI );
  let textareaTimings = createTextArea( "timing to reach each phoneme", TestAddUI );
  let textareaCSV = createTextArea( "Paste/Write here the csv", TestAddUI );
  let textareaTEXTGRID = createTextArea("", TestAddUI );
  let uploaderCSV = createFileUploader ( textareaCSV, TestAddUI );
  let uploaderTEXTGRID = createFileUploader ( textareaTEXTGRID, TestAddUI );
  let inputSentenceTime = createInputNumber( "sentenceTime", "Sentence duration (seconds): ", TestAddUI );
  let inputSpeed  = createInputNumber( "phonemeSpeed", "Mouthing speed (phonemes per second): ", TestAddUI );
  let inputDelay  = createInputNumber( "sentenceDelay", "Sentence Delay (seconds): ", TestAddUI );
  
  TestAddUI.appendChild( document.createElement("br") );
  let coartCheckbox = createInputCheckbox ( "coartCheckbox", "Use coarticulation", true, TestAddUI );

  
  function swapTextareas (){
    // everything hidden
      // manual
    textareaText.style.display = "none";
    textareaTimings.style.display = "none";
    textTimingExplanation.style.display = "none";
    encodingSelector.makeVisible(false);
    inputSentenceTime.makeVisible(false);
    inputSpeed.makeVisible(false);
    inputDelay.makeVisible(false);
      
      //csv
    textareaCSV.style.display = "none";
    uploaderCSV.style.display = "none";
    csvExplanation.style.display = "none";
      
      // Text Grid
    textGridExplanation.style.display = "none";
    textareaTEXTGRID.style.display = "none";
    uploaderTEXTGRID.style.display = "none";
    
    // now should only what is needed
    switch( modeSelector.node.selectedIndex ){
      case PARSERS.CSV:
        textareaCSV.style.display = "";
        uploaderCSV.style.display = "";
        csvExplanation.style.display = "";
        break;
      
      case PARSERS.TEXTGRID:
        textGridExplanation.style.display = "";
        textareaTEXTGRID.style.display = "";
        uploaderTEXTGRID.style.display = "";

        break;
      
      default:
        textareaText.style.display = "";
        textareaTimings.style.display = "";
        textTimingExplanation.style.display = "";
        encodingSelector.makeVisible(true);
        inputSentenceTime.makeVisible(true);
        inputSpeed.makeVisible(true);
        inputDelay.makeVisible(true);
        break;
        
    }
  };
	swapTextareas();
  modeSelector.node.addEventListener("change", swapTextareas );
  
  
  TestAddUI.appendChild( styledHR.cloneNode() );
  
  // Test creation UI --> audio +++++++++++++++++++++++++++++++++++++++++++
  
  createParagraph( "(Optional) Paste the URL of an audio or upload an audio file. This audio will be played while performing the mouthing. <strong>Warning!</strong> It is just aesthetics. It does <strong>NOT produce mouthing</strong> from this audio.", TestAddUI );
  let textareaURL = createTextArea( "(Optional) URL of audio", TestAddUI );
  createFileUploader ( textareaURL, TestAddUI );

  TestAddUI.appendChild( styledHR.cloneNode() );

  // Test creation UI --> button name ++++++++++++++++++++++++++++++++++++++
  createParagraph( "(Optional) The button of this Use Case will have the title specified below.", TestAddUI );
  let textareaTitle = createTextArea( "(Optional) Title", TestAddUI );
  
  
	// Test creation UI --> create test +++++++++++++++++++++++++++++++++++++++
  let confirm = document.createElement("button");
  confirm.style.margin = "3%";
  confirm.style.padding = "1em";
  confirm.style.borderRadius = "7px";
  confirm.innerText = "Create Test";
  confirm.id = "confirm";
  confirm.addEventListener('click', function (evt){
    let csvResults = null;
    
    switch( modeSelector.node.selectedIndex ){
      case PARSERS.CSV:
        csvResults = parseForcedAligner(textareaCSV.value, PARSERS.CSV);
        csvResults.timings = new Float32Array( csvResults.timings );
        break;
      
      case PARSERS.TEXTGRID:
        csvResults = parseForcedAligner(textareaTEXTGRID.value, PARSERS.TEXTGRID);
        csvResults.timings = new Float32Array( csvResults.timings );
        break;
      
      default: // manual
        csvResults = {};
        if ( (encodingSelector.node.selectedIndex+1) == TablesScript._phonemeEncodings.ARPABET_2 ){ 
          csvResults.text = textareaText.value.split(","); 
          for ( let i = 0; i < csvResults.text.length; ++i ){
           csvResults.text[i] = ensureArpa2to1( csvResults.text[i] );
          }
        }
        else { csvResults.text = textareaText.value.slice( 0, textareaText.value.length ); } // make copy

        let timings = textareaTimings.value.split(",");
        csvResults.sentenceTime = inputSentenceTime.getValue();
        csvResults.speed = inputSpeed.getValue();
        csvResults.delay = inputDelay.getValue();

        // to acknowledge timings, the first thing in textarea must be a number
        if ( timings.length > 0 && isNaN(parseFloat(timings[0])) === false ){
          for ( let i = 0; i < timings.length; ++i ){
            let value = parseFloat( timings[i] );
            if ( isNaN( parseFloat( value ) ) ) { value = 1.0/8.0; }
            timings[i] = value;
          }
          if ( timings.length > 0 ){ csvResults.timings = new Float32Array( timings ); } 
          else { csvResults.timings = null; }
        }

        break;
    }
    
    
    let audio =  textareaURL.value;
    textareaURL.audioURL = null; // avoid revoking audio when creating new test
    if ( !csvResults ) { return; }
    createTestCase_T2L (     
        {      
            text  : csvResults.text,
            times : csvResults.timings,
            audio : audio,
            sentenceTime : csvResults.sentenceTime,
            speed : csvResults.speed,
            coart : coartCheckbox.node.checked,
            delay : csvResults.delay,
            title : textareaTitle.value.length ? textareaTitle.value : "TEST",
        }
    );
 

  }); // end of confirm
	TestAddUI.appendChild(confirm);
	
  
  return TestManagementUI;

};





this.onStart = function () {
  CoreScript = LS.Globals.Scripts["root/CoreScript"];
  TablesScript = LS.Globals.Scripts["root/TablesScript"];
  Arpa2to1 = TablesScript._Arpa2to1;

  let TestsUI = createTestsUI();
  
  let prevUI = document.getElementById("TestManagementUI");
  if (prevUI) { document.getElementsByTagName('body')[0].removeChild(prevUI); }
  prevUI = null;
  
  TESTCASES = [];


  document.getElementsByTagName('body')[0].appendChild(TestsUI);
  
  CoreScript.GUI.createButton( "Add new Test", function(){ TestsUI.makeVisible(true); }, "rgba(255,255,255,1)", "rgba(255,255,255,0.5)");//FFFFFF","FFFFFF7F" );

  createTestCase_T2L ( 
      {      
          text  : " aisii faiv lamps",
          times : new Float32Array([0.15,   0.16,0.17,   0.23,0.1,0.29,  0.08,   0.23,0.18,0.18,0.19,  0.09,  0.19,0.17,0.13,0.11,0.19 ]),
          audio : "https://webglstudio.org/latest/fileserver/files//gerard/audios/i-see-five-lamps-f.wav",
          coart : true,
          title : "5 lamps (audio)",
      }
  );

  createTestCase_T2L (
      {              
          text  : "_aihav_foor_arpleins",
          times : null,
          audio : "https://webglstudio.org/latest/fileserver/files//gerard/audios/i-have-four-airplanes-m.wav",
          coart : true,
          title : "4 planes (audio)",
      }
  );

  createTestCase_T2L (
      {      
          text  : "  helou  from di iupief.",
          times : null,
          audio : null,
          speed : 10,
          coart : true,
          title : "Hello from the UPF",
      }
  );
  
  createTestCase_T2L (
      {      
          text  : "  TRtiin.",
          times : null,
          audio : null,
          speed : 10,
          coart : true,
          title : "Thirteen",
      }
  );

  createTestCase_T2L (
      {      
        textLink: "https://webglstudio.org/latest/fileserver/files//jaumep/resources/2_men_north____plead.TextGrid",
          audio : "https://webglstudio.org/latest/fileserver/files//jaumep/resources/2_men_north____plead.wav",
          coart : true,
          title : "Men of the north",
      }
  );

  
    createTestCase_T2L (
      {      
        textLink: "https://webglstudio.org/latest/fileserver/files//jaumep/resources/Charlie_Chaplin_-_Final_Speech_from_The_Great_Dictator.TextGrid",
          audio : "https://webglstudio.org/latest/fileserver/files//jaumep/resources/Charlie_Chaplin_-_Final_Speech_from_The_Great_Dictator.wav",
          coart : true,
          title : "The Dictator speech",
      }
  );
  
  
}

this.onFinish = function (){
  

}