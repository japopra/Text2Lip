import subprocess;
from textgrid import TextGrid;
import pandas as pd;
import json;
import os;
import numpy as np;
import math as Math;
import sys;


def clamp ( val, minVal = 0, maxVal = 1 ): 
  return max( minVal, min( val, maxVal ) );

def isNumber ( val ):
  return isinstance( val, int ) or isinstance( val, float );


# Arpabet Translators

#Arpabet 1-2-3 letter to 1
Arpa2to1 = {
    "AA": "a",
    "AE": "@",
    "AH": "A",
    "AO": "c",
    "AW": "W",
    "AX": "x",
    "AXR": "x", 
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
    "UX": "u",

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
    "HH": "h",
    "H": "h",
    "JH": "J",
    "K": "k",
    "L": "l",
    "M": "m",
    "N": "n",
    "NG": "G",
    "NX": "n",
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




# -------------------------------------------------------------------- TEXT PARSERS -----------------------------------------------------------------

def ensureArpa2to1 ( phoneme ):
  while ( (not (phoneme in Arpa2to1)) and len(phoneme) > 0):
    phoneme = phoneme[0: len(phoneme)-1];
  phoneme = Arpa2to1[phoneme] if ( len(phoneme) > 0 ) else ".";  
  return phoneme;

def yielderCSV ( path ):
  parsedCsv = pd.read_csv( path );
  isValid = ('phoneme' in parsedCsv) and ('time_start' in parsedCsv) and ('time_end' in parsedCsv);
  if ( not isValid ):
    yield None
  
  phonemeCol = parsedCsv['phoneme'];    
  phstartCol = parsedCsv['time_start'];
  phendCol = parsedCsv['time_end'];

  amountEntries = len(phonemeCol);
  for i in range(amountEntries):
    timeStart = phstartCol[ i ];
    timeEnd = phendCol[ i ];
    phoneme = phonemeCol[ i ];
    yield { 'ts': timeStart, 'te': timeEnd, 'p': phoneme };
  
  yield None;

def yielderTEXTGRID ( path ):
  tg = TextGrid.fromFile( path );
  # first item are phonemes
  print( tg, len(tg));
  phonemesArray = None;
  for i in range( len(tg) ):
    name = tg[i].name;
    if ( 'phones' in name ):
      phonemesArray = tg[i];
      break;
  
  if phonemesArray is None: 
    yield None;


  for entry in phonemesArray:
    timeStart = entry.minTime;
    timeEnd = entry.maxTime;
    phoneme = entry.mark;
    yield { 'ts': timeStart, 'te': timeEnd, 'p': phoneme };

  yield None;
    


def parseForcedAligner ( filePath ):
  extension = filePath[ filePath.rfind(".") : ];
  yielder = None;
  if( extension == '.csv' ):
    yielder = yielderCSV( filePath );
  else:
    yielder = yielderTEXTGRID( filePath );
  
  lastTime = 0; # integer miliseconds
  text = "";
  timings = [];

  currEntry = next( yielder );
  # check each phoneme in csv 
  while currEntry:
    currStart = currEntry['ts'];
    currEnd = currEntry['te'];
    currPhoneme = ensureArpa2to1( currEntry['p'] );
    currEntry = next( yielder );

    if (not isNumber( currEnd )) or (not isNumber( currStart ) ):
      continue;

    # convert to miliseconds and integers. 
    # More precision than 1 milisecond is pointless
    currStart = Math.trunc( currStart * 1000 );
    currEnd = Math.trunc( currEnd * 1000 );

    if ( currStart < lastTime ):
      currStart = lastTime;
    if ( currEnd < currStart ):
      continue;
    # time at which space-phoneme is transformed into a full-stop-phoneme
    phFullStopTimeCt = 3 * Math.trunc( 1000.0/8.0 );
    
    # add space or full stop before this phoneme if necessary
    spaceTime = currStart - lastTime;
    if ( spaceTime > 0 ): 
      if ( spaceTime >= phFullStopTimeCt ):
        text += ".";
        text += ".";
        timings.append( phFullStopTimeCt / 1000.0 );
        timings.append( ( spaceTime - phFullStopTimeCt ) / 1000.0 );
      else:
        text += " ";  
        timings.append( spaceTime / 1000.0 );
    
    # if phoneme lasts too much make a short intro and then keep static phoneme
    duration = currEnd - currStart;
    phRepetitionTimeCt = 3* Math.trunc( 1000.0/8.0 );
    if ( duration > phRepetitionTimeCt ):
        text += currPhoneme;
        timings.append( phRepetitionTimeCt / 1000.0 ); 
        duration -= phRepetitionTimeCt;
    # add phoneme to list
    text += currPhoneme;
    timings.append( duration / 1000.0 );
    lastTime = currEnd;  
  # end of for
  return { "text" : text, "phT": timings };

# end of parseForcedAligner



def ensureFolderExists( path ):
    if ( not os.path.isdir( path ) ): # create folder if non-existent
        os.mkdir( path );


def simplifyMFAOutput ( inputPath, outputFolder, avoidFirstFolder = False ):
    basename = os.path.basename( os.path.normpath( inputPath ) );
    outputFolder = os.path.normpath( outputFolder ) + "/";
    inputPath = os.path.normpath( inputPath );

    if ( os.path.isfile( inputPath ) ):
        basenameWithoutExtension = basename[ 0 : basename.rfind(".") ];
        parsedJson = parseForcedAligner ( inputPath );
        stringJson = json.dumps( parsedJson );
        with open( outputFolder + basenameWithoutExtension + ".json", "w" ) as f:
            f.write( stringJson );
    
    else:
      if avoidFirstFolder:
        avoidFirstFolder = False;
      else:
        outputFolder += basename;
        ensureFolderExists( outputFolder );

      for p in os.listdir( inputPath ):
        simplifyMFAOutput( inputPath + "/" + p, outputFolder, avoidFirstFolder );


#output = subprocess.run(['mfa', 'align', '--clean', 'ToAlign', 'english_us_arpa', 'english_us_arpa', 'Aligned'], text=True, capture_output=True, check=True);

simplifyMFAOutput( "Aligned", "SimplifiedAligned", avoidFirstFolder = True );
