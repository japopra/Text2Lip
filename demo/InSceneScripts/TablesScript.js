//@TablesScript

// Contains tables of visemes, coarticulation values, phoneme to viseme relation, Arpabet translators.

if ( !LS.Globals.Scripts ){
  LS.Globals.Scripts = {};
}

LS.Globals.Scripts["root/TablesScript"]  = this;

// encoding table
this._phonemeEncodings = { 
  none: 0,
  // limited to American English
  ARPABET_1: 1, // 1 letter
  ARPABET_2: 2, // 2 letter
  
  // NOT IMPLEMENTED
  SIL: 3, // can represent all possible phonemes as ASCII
  UTF8: 4, // Irene uses this
  UTF16: 5,
};
  


// visemes
// kiss, upperLipClosed, lowerLipClosed, jawOpen, tongueFrontUp, tongueBackUp, tongueOut

this._visemes = [ 
  [ 0      ,0      ,0      ,0      ,0     ,0    ,0 ], // 0
  [ 0      ,0      ,0      ,0      ,0     ,0    ,0 ], 
  [ 0.1    ,0.15    ,0      ,0.4    ,0     ,0    ,0 ],
  [ 0.0    ,0.13   ,0      ,0.3    ,0.2   ,0    ,0 ],
  [ 0      ,0.08   ,0      ,0.2    ,0.5   ,0.5  ,0 ], // 4
  [ 0.45   ,0.15   ,0.15   ,0.4    ,0     ,0    ,0 ], 
  [ 0.65   ,0.3    ,0.3    ,0.3    ,0     ,0    ,0 ],
  [ 0.3    ,0.15   ,0      ,0.3    ,1     ,0    ,0 ],
  [ 0      ,0.5    ,0.5    ,0.1    ,0     ,0    ,0 ], // 8
  [ 0      ,0.0    ,0.6    ,0.2    ,0     ,0    ,0 ],
  [ 0.3    ,0      ,0      ,0.13   ,0.8   ,0    ,0 ],
  [ 0.0    ,0      ,0      ,0.4    ,0.0   ,0.3    ,0 ],
  [ 0.0    ,0      ,0      ,0.1    ,0.0   ,1    ,0 ], // 12
  [ 0.3    ,0      ,0      ,0.2    ,1     ,0    ,0 ] ,
  [ 0      ,0      ,0.0   ,0.2    ,0.35  ,0    ,0.8 ],
  ];
          
this._lowerBound = [ 
  [ 0      ,0      ,0      ,0      ,0     ,0    ,0 ], // 0
  [ 0      ,0      ,0      ,0      ,0     ,0    ,0 ], 
  [ 0.1    ,0.15    ,0      ,0.2    ,0     ,0    ,0 ],
  [ 0.0    ,0.13   ,0      ,0.2    ,0.2   ,0    ,0 ],
  [ 0      ,0.08   ,0      ,0.1    ,0.5   ,0.5  ,0 ], // 4
  [ 0.25   ,0.15   ,0.15   ,0.2    ,0     ,0    ,0 ], 
  [ 0.35   ,0.15   ,0.15  ,0.2    ,0     ,0    ,0 ],
  [ 0.3    ,0.15   ,0      ,0.1    ,1     ,0    ,0 ],
  [ 0      ,0.5    ,0.2    ,0.1    ,0     ,0    ,0 ], // 8
  [ 0      ,0.0    ,0.2    ,0.1    ,0     ,0    ,0 ],
  [ 0.3    ,0      ,0      ,0.13   ,0.8   ,0    ,0 ],
  [ 0.0    ,0      ,0      ,0.2    ,0.0   ,0.3    ,0 ],
  [ 0.0    ,0      ,0      ,0.1    ,0.0   ,1    ,0 ], // 12
  [ 0.3    ,0      ,0      ,0.1    ,1     ,0    ,0 ] ,
  [ 0      ,0      ,0.0   ,0.1    ,0.35  ,0    ,0.3 ],
  ];    
   
  this._upperBound = [ 
    [ 0      ,0      ,0      ,0      ,0     ,0    ,0 ], // 0
    [ 0      ,0      ,0      ,0      ,0     ,0    ,0 ], 
    [ 0.1    ,0.15    ,0      ,0.6    ,0     ,0    ,0 ],
    [ 0.0    ,0.13   ,0      ,0.3    ,0.2   ,0    ,0 ],
    [ 0      ,0.08   ,0      ,0.2    ,0.6   ,0.6  ,0.2 ], // 4
    [ 0.45   ,0.15   ,0.15   ,0.6    ,0     ,0    ,0 ], 
    [ 0.65   ,0.3    ,0.3    ,0.3    ,0     ,0    ,0 ],
    [ 0.3    ,0.15   ,0      ,0.4    ,1     ,0    ,0.5 ],
    [ 0      ,1    ,1        ,0.4    ,0     ,0    ,0 ], // 8
    [ 0      ,0.0    ,1    ,0.4    ,0     ,0    ,0 ],
    [ 0.3    ,0      ,0      ,0.13   ,0.8   ,0    ,0 ],
    [ 0.0    ,0      ,0      ,0.4    ,0.0   ,0.3    ,0 ],
    [ 0.1    ,0      ,0      ,0.2    ,0.0   ,1    ,0 ], // 12
    [ 0.3    ,0      ,0      ,0.22    ,1     ,0    ,0 ] ,
    [ 0      ,0      ,0.0   ,0.4    ,0.55  ,0    ,0.8 ],
    ];
  
  // coarticulation weights for each phoneme. 0= no modification to phoneme, 1=use phonemes arround to build viseme
  this._coarts = [
  [0  	  ,0      ,0      ,0      ,0     ,0     ,0.0 ], // 0
  [0.6    ,0.6    ,0.6    ,0.6    ,0.6   ,0.6     ,0.6 ], 
  [0.2    ,0.3    ,0.3    ,0.3    ,0.1   ,0.3     ,0.5 ],
  [0.0    ,0.3    ,0.3    ,0.3    ,0.1   ,0.3     ,0.5 ],
  [0.1    ,0.3    ,0.3    ,0.3    ,0     ,0     ,0.5 ], // 4
  [0.2    ,0.3    ,0.3    ,0.3    ,0.3   ,0.3     ,0.5 ],
  [0.2    ,0.3    ,0.3    ,0.3    ,0.3   ,0.3     ,0.5 ],
  [1      ,0.4    ,0.4    ,0.9    ,0     ,0.5     ,0.5 ], 
  [1      ,0      ,0      ,0.2    ,1     ,0.8     ,0.5 ], //8 
  [1      ,0      ,0      ,0.2    ,1     ,0.5     ,0.5 ], 
  [1      ,0.6    ,0.6    ,0.6    ,0     ,0.5     ,0.5 ],     
  [1      ,1      ,1      ,0.7    ,0.5   ,0.5     ,0.5 ],
  [0.7    ,0.5    ,0.5    ,0.9    ,0.6   ,0     ,0.5 ], //12
  [1      ,1      ,1      ,0.5    ,0     ,0     ,0.5 ], 
  [1      ,0.3   ,0.3     ,0.3    ,0      ,0.6     ,0 ],
  ];
    
    


let ph2v_old = {
    ".":0, "_":1, " ":1, 
    a:2, e:3, i:4, o:5, u:6, 	// vowels
    l:7, r:7, n:7,     			// alveolar (non fricative)
    p:8, b:8, m:8,              // bilabial
    f:9, v:9,                   // labiodental
    s:10,                       // alveolar (frivative)
    h:11,                       // glotal
    k:12, g:12,                 // velar
	  t:13, d:13,					// alveolar 
}; // should be an array of ascii to viseme

this._ph2v ={
".":0, "_":1, " ":1, 
"a" : 2  ,//"AA"	 
"@" : 2  ,//"AE"	 
"A" : 2  ,//"AH"	 
"c" : 5  ,//"AO"	 
"W" : 2  ,//"AW"	 
"x" : 2  ,//"AX"	 
"Y" : 2  ,//"AY"	 
"E" : 3  ,//"EH"	 
"R" : 3  ,//"ER"	 
"e" : 3  ,//"EY"	 
"I" : 4  ,//"IH"	 
"X" : 4  ,//"IX"	 
"i" : 4  ,//"IY"	 
"o" : 5  ,//"OW"	 
"O" : 5  ,//"OY"	 
"U" : 6  ,//"UH"	 
"u" : 6  ,//"UW"	 
		
"b" : 8  ,//"B"	
"C" : 10  ,//"CH"	 // ------------------------ Really needs a new viseme - 'SH'
"d" : 13 ,//"D"	
"D" : 13 ,//"DH"	
"F" : 13 ,//"DX"	
"L" : 7  ,//"EL"	
"M" : 8  ,//"EM"	
"N" : 7  ,//"EN"	
"f" : 9  ,//"F"	
"g" : 12 ,//"G"	
"h" : 11 ,//"H"	// reduced
"J" : 10  ,//"JH"	 // ------------------------- Really needs a new viseme 'ZH'
"k" : 12 ,//"K"	
"l" : 7  ,//"L"	
"m" : 8  ,//"M"	
"n" : 7  ,//"N"	
"G" : 12 ,//"NG"	// reduced
"p" : 8  ,//"P"	
"Q" : 2  ,//"Q"	 // -------------------------- What is this?
"r" : 7  ,//"R"	
"s" : 10 ,//"S"	
"S" : 10  ,//"SH"	 // ------------------------ Really needs a new viseme - 'CH'
"t" : 13 ,//"T"	
"T" : 14 ,//"TH"	
"v" : 9  ,//"V"	
"w" : 6  ,//"W"	
"H" : 6  ,//"WH"	
"y" : 4  ,//"Y"	
"z" : 10 ,//"Z"	
"Z" : 10  ,//"ZH"	 // ------------------------- Really needs a new viseme 'JH'

};








// Arpabet Translators

// Arpabet 1-2-3 letter to 1
this._Arpa2to1 = {
"AA"  : "a" , 
"AE"  : "@" , 
"AH"  : "A" , 
"AO"  : "c" , 
"AW"  : "W" , 
"AX"  : "x" , 
"AXR" : "x" , // invented
"AY"  : "Y" , 
"EH"  : "E" , 
"ER"  : "R" , 
"EY"  : "e" , 
"IH"  : "I" , 
"IX"  : "X" , 
"IY"  : "i" , 
"OW"  : "o" , 
"OY"  : "O" , 
"UH"  : "U" , 
"UW"  : "u" , 
"UX"  : "u" , // invented

"B"	 : "b" ,
"CH" : "C" ,
"D"	 : "d" ,
"DH" : "D" ,
"DX" : "F" ,
"EL" : "L" ,
"EM" : "M" ,
"EN" : "N" ,
"F"	 : "f" ,
"G"	 : "g" ,
"HH" : "h" ,// separated
"H"	 : "h" ,// separated
"JH" : "J" ,
"K"	 : "k" ,
"L"	 : "l" ,
"M"	 : "m" ,
"N"	 : "n" ,
"NG" : "G" ,// reduced
"NX" : "n" ,// invented
"P"	 : "p" ,
"Q"	 : "Q" ,
"R"	 : "r" ,
"S"	 : "s" ,
"SH" : "S" ,
"T"	 : "t" ,
"TH" : "T" ,
"V"	 : "v" ,
"W"	 : "w" ,
"WH" : "H" ,
"Y"	 : "y" ,
"Z"	 : "z" ,
"ZH" : "Z" ,

};


// Arpabet 1 letter to 1-2-3-letter
this._Arpa1to2 ={
"a" : "AA"	, 
"@" : "AE"	, 
"A" : "AH"	, 
"c" : "AO"	, 
"W" : "AW"	, 
"x" : "AX"	, 
"Y" : "AY"	, 
"E" : "EH"	, 
"R" : "ER"	, 
"e" : "EY"	, 
"I" : "IH"	, 
"X" : "IX"	, 
"i" : "IY"	, 
"o" : "OW"	, 
"O" : "OY"	, 
"U" : "UH"	, 
"u" : "UW"	, 

"b" : "B"   ,
"C" : "CH"  ,
"d" : "D"   ,
"D" : "DH"  ,
"F" : "DX"  ,
"L" : "EL"  ,
"M" : "EM"  ,
"N" : "EN"  ,
"f" : "F"   ,
"g" : "G"   ,
"h" : "H"   ,// reduced
"J" : "JH"  ,
"k" : "K"   ,
"l" : "L"   ,
"m" : "M"   ,
"n" : "N"   ,
"G" : "NG"  ,// reduced
"p" : "P"   ,
"Q" : "Q"   ,
"r" : "R"   ,
"s" : "S"   ,
"S" : "SH"  ,
"t" : "T"   ,
"T" : "TH"  ,
"v" : "V"   ,
"w" : "W"   ,
"H" : "WH"  ,
"y" : "Y"   ,
"z" : "Z"   ,
"Z" : "ZH"  ,

};

