// parses csv and textgrid into a simplified json that the Text2Lip module understands
// it is based on a base function (parseForcedAligner) that uses yielders to get each phoneme in a file.

import * as TextGrid from "textGridParser.js"

// Arpabet 1-2-3 letter to 1
let Arpa2to1 = {
    "AA": "a",
    "AE": "@",
    "AH": "A",
    "AO": "c",
    "AW": "W",
    "AX": "x",
    "AXR": "x", // invented
    "AY": "Y",
    "EH": "E",
    "ER": "R",
    "EY": "e",
    "IH": "I",
    "IX": "X",
    "IY": "i",
    "OW": "o",
    "OY": "O",
    "UH": "U",
    "UW": "u",
    "UX": "u", // invented

    "B": "b",
    "CH": "C",
    "D": "d",
    "DH": "D",
    "DX": "F",
    "EL": "L",
    "EM": "M",
    "EN": "N",
    "F": "f",
    "G": "g",
    "HH": "h",// separated
    "H": "h",// separated
    "JH": "J",
    "K": "k",
    "L": "l",
    "M": "m",
    "N": "n",
    "NG": "G",// reduced
    "NX": "n",// invented
    "P": "p",
    "Q": "Q",
    "R": "r",
    "S": "s",
    "SH": "S",
    "T": "t",
    "TH": "T",
    "V": "v",
    "W": "w",
    "WH": "H",
    "Y": "y",
    "Z": "z",
    "ZH": "Z",

};

function ensureArpa2to1 ( phoneme ){
    while ( !(phoneme in Arpa2to1) && phoneme.length > 0){
      phoneme = phoneme.slice(0,phoneme.length-1);    
    }
    phoneme = ( phoneme.length > 0 ) ? Arpa2to1[phoneme] : ".";  
		return phoneme;
}

function* yielderCSV ( text ){
  // milawukee forced aligner uses this format


  // using external CSV library
/*  let parsedCsv = CSV.parse(text);
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
  }*/
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

function parseForcedAligner ( text, parserType = PARSERS.CSV ){
  
  
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