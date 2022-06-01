//@CoreScript

if (!LS.Globals.Scripts) {
  LS.Globals.Scripts = {};
}

LS.Globals.Scripts["root/CoreScript"] = this;


// Includes also in onStart
let TablesScript = LS.Globals.Scripts["root/TablesScript"];


// --------------------- UTILS --------------------


function clamp(a, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a));
}
this.clamp = clamp;



// --------------------- LIPSYNC MODULE --------------------

// Switch to https if using this script
/*if (window.location.protocol != "https:")
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
*/

// Globals
if (!LS.Globals)
  LS.Globals = {};

// Audio context
if (!LS.Globals.AContext)
  LS.Globals.AContext = new AudioContext();


// Audio sources
// Microphone
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;


// ------------------------ TEXT TO LIP --------------------------------------------

function Text2LipInterface() {
  let _ = new Text2Lip();

  this.start = _.start.bind( _ );
  this.stop = _.stop.bind( _ );
  this.pause = _.pause.bind( _ );
  this.resume = _.resume.bind( _ );

  this.update = _.update.bind( _ );

  this.setEvent = _.setEvent.bind( _ );
  this.setTables = _.setTables.bind( _ );
  this.setDefaultSpeed = _.setDefaultSpeed.bind( _ );
  this.setDefaultIntensity = _.setDefaultIntensity.bind( _ );
  this.setSourceBSWValues = _.setSourceBSWValues.bind( _ );

  this.getDefaultSpeed = _.getDefaultSpeed.bind( _ );
  this.getDefaultIntensity = _.getDefaultIntensity.bind( _ );
  this.getCurrentIntensity = _.getCurrentIntensity.bind( _ );


  this.getSentenceDuration = _.getSentenceDuration.bind( _ ); // THE ONLY REASON THIS IS NOT STATIC IS BECAUSE IT USES this.DEFAULT_SPEED   
  this.cleanQueueSentences = _.cleanQueueSentences.bind( _ );
  this.pushSentence = _.pushSentence.bind( _ );

  this.getBSW = function () { return _.BSW; }

  this.getCompactState = _.getCompactState.bind( _ );
  this.isWorking = _.isWorking.bind( _ );
  this.isPaused = _.isPaused.bind( _ );
  this.needsSentences = _.needsSentences.bind( _ );
  this.getNumSentences = _.getNumSentences.bind( _ );
  this.getMaxNumSentences = _.getMaxNumSentences.bind( _ );


}


function Text2Lip() {
  this.DEFAULT_SPEED = 8; // phonemes/s
  this.DEFAULT_INTENSITY = 0.5; // [0,1]

  // tables ( references )
  this.lowerBoundVisemes = null;
  this.upperBoundVisemes = null;
  this.coarts = null;
  this.ph2v = null;
  this.numShapes = 0;

  // manages display of a sentence
  this.working = false;
  this.paused = false;
  this.speed = this.DEFAULT_SPEED; // phonemes/s
  this.intensity = this.DEFAULT_INTENSITY; // [0,1]
  this.text = "";
  this.currTargetIdx = 0; // current target character (aka when t=1 during interpolation, this char is shown)
  this.currT = 0; // current time of interpolation
  this.useCoarticulation = true;
  this.delay = 0;

  // variables for managing list of sentences to display
  this.currSent = null;
  this.queueIdx = 0;
  this.queueSize = 0;
  this.sentenceQueue = new Array( Text2Lip.QUEUE_MAX_SIZE );
  this.sentenceIDCount = 1; // when pushing, a 0 will mean failure. Start IDs at 1


  // blendshape weights. User can use this to do mouthing
  this.BSW = new Float32Array( this.numShapes ); this.BSW.fill( 0 );

  // needed because of coarticulation
  this.currV = new Float32Array( this.numShapes ); this.currV.fill( 0 );
  this.targV = new Float32Array( this.numShapes ); this.targV.fill( 0 ); // next visem - target

  // event listeners
  this.onIdle = null;
  this.onSentenceEnd = null; // receives ended sentence
  this.onSentenceStart = null; // receives starting sentence

}

Text2Lip.prototype.setDefaultSpeed = function ( speed ) {
  if ( typeof ( speed ) === 'number' && speed > 0.001 ) {
      this.DEFAULT_SPEED = speed;
      return true;
  }
  return false;
};
Text2Lip.prototype.setDefaultIntensity = function ( intensity ) {
  if ( typeof ( intensity ) === 'number' ) {
      this.DEFAULT_INTENSITY = clamp( intensity, 0.0, 1.0 );
      return true;
  }
  return false;
};

Text2Lip.prototype.setSourceBSWValues = function ( values ) {
  // values is only a number
  if ( typeof ( values ) == "number" ) {
      for ( let i = 0; i < this.currV.length; ++i ) {
          this.currV[ i ] = values;
      }
      return;
  }

  // values is an array
  for ( let i = 0; i < this.BSW.length && i < values.length; ++i ) {
      let value = ( typeof ( values[ i ] ) == "number" ) ? values[ i ] : 0.0;
      this.currV[ i ] = value;
  }
}

Text2Lip.prototype.setEvent = function ( eventType, fun ) {
  if ( typeof ( fun ) !== 'function' ) { return false; }
  switch ( eventType ) {
      case "onIdle": this.onIdle = fun; break;
      case "onSentenceEnd": this.onSentenceEnd = fun; break;
      case "onSentenceStart": this.onSentenceStart = fun; break;
      default: return false;
  }
  return true;
}

Text2Lip.prototype.setTables = function ( phonemeToViseme, coarts, lowerBoundVisemes, upperBoundVisemes = null ) {
  this.lowerBoundVisemes = lowerBoundVisemes;
  this.upperBoundVisemes = ( upperBoundVisemes && upperBoundVisemes.length > 0 ) ? upperBoundVisemes : lowerBoundVisemes;
  this.coarts = coarts;
  this.ph2v = phonemeToViseme;

  this.numShapes = 0
  if ( lowerBoundVisemes && lowerBoundVisemes.length > 0 ) {
      this.numShapes = lowerBoundVisemes[ 0 ].length;
  }


  this.BSW = new Float32Array( this.numShapes ); this.BSW.fill( 0 );
  this.currV = new Float32Array( this.numShapes ); this.currV.fill( 0 );
  this.targV = new Float32Array( this.numShapes ); this.targV.fill( 0 ); // next visem - target

}



Text2Lip.prototype.getDefaultSpeed = function () { return this.DEFAULT_SPEED; }
Text2Lip.prototype.getDefaultIntensity = function () { return this.DEFAULT_INTENSITY; }
Text2Lip.prototype.getCurrentIntensity = function () { return this.getIntensityAtIndex( this.currTargetIdx ); }


Text2Lip.prototype.getIntensityAtIndex = function ( index ) {
  if ( this.currSent ) {
      if ( index >= 0 && index < this.currSent.text.length ) {

          let phInt = this.currSent.phInt;
          if ( phInt && index < phInt.length ) { return phInt[ index ]; }
          else if ( this.currSent.sentInt !== null ) { return this.currSent.sentInt; }
      }

  }
  return this.DEFAULT_INTENSITY;
}

/**
* 
* @param {*} phoneme 
* @param {Array} outResult if not null, result will be written to this array. Otherwise a new array is generated with the resulting values and returned 
* @returns returns outResult or a new Float32Array
*/
Text2Lip.prototype.getViseme = function ( phoneme, outResult = null, ) {
  // this handles properly undefined and nulls.
  if ( !( phoneme in this.ph2v ) ) { return this.lowerBoundVisemes[ 0 ]; } // assuming there are visemes
  let visIdx = this.ph2v[ phoneme ];
  if ( visIdx < 0 || visIdx >= this.lowerBoundVisemes.length ) { return this.lowerBoundVisemes[ 0 ]; } // assuming there are visemes

  let lower = this.lowerBoundVisemes[ visIdx ];
  let upper = this.upperBoundVisemes[ visIdx ];

  let result = ( outResult ) ? outResult : ( new Float32Array( this.numShapes ) );
  let intensity = this.intensity;
  for ( let i = 0; i < this.numShapes; i++ ) {
      result[ i ] = lower[ i ] * ( 1 - intensity ) + upper[ i ] * intensity;
  }
  return result;

}

/**
* 
* @param {*} phoneme 
* @returns returns a reference to the coart entry
*/
Text2Lip.prototype.getCoarts = function ( phoneme ) {
  // this handles properly undefined and nulls.
  if ( !( phoneme in this.ph2v ) ) { return this.coarts[ 0 ]; } // assuming there are coarts
  let visIdx = this.ph2v[ phoneme ];
  if ( visIdx < 0 || visIdx >= this.coarts.length ) { return this.coarts[ 0 ]; } // assuming there are visemes
  return this.coarts[ visIdx ];
}

/**
* 
* @param {*} phoneme 
* @param {*} phonemeAfter 
* @param {*} outResult  if not null, result will be written to this array. Otherwise a new array is generated with the resulting values and returned 
* @returns returns outResult or a new Float32Array
*/
Text2Lip.prototype.getCoarticulatedViseme = function ( phoneme, phonemeAfter, outResult = null ) {
  let rawTarget = this.getViseme( phoneme );
  let coartsW = this.getCoarts( phoneme ); // coarticulation weights of target phoneme

  //let visemePrev = this.currV; // phoneme before target
  let visemeAfter = this.getViseme( phonemeAfter ); // phoneme after target

  let result = ( outResult ) ? outResult : ( new Float32Array( this.numShapes ) );

  for ( let i = 0; i < this.numShapes; ++i ) {
      result[ i ] = ( 1.0 - coartsW[ i ] ) * rawTarget[ i ] + coartsW[ i ] * visemeAfter[ i ]//(0.2 * visemePrev[i] + 0.8 * visemeAfter[i]);
  }

  return result;
}

// constant
Text2Lip.QUEUE_MAX_SIZE = 32;

Text2Lip.prototype.start = function () {
  this.stop( false );
  this.working = true;
  this.paused = false;

  this.changeCurrentSentence( false );

}
Text2Lip.prototype.pause = function () { this.paused = this.working; } // can only be paused if working
Text2Lip.prototype.resume = function () { this.paused = false; }

/**
* stops update. No sentence is modified. However some variables are reseted, meaning the sentence being displayed currently will start from the beginning 
* if a start is called
* To completely clean the queue, call cleanQueueSentences or pass true as argument
* @param {Bool} cleanQueue if true, all pending sentences are cleared and will not be displayed. 
*/
Text2Lip.prototype.stop = function ( cleanQueue = false ) {
  this.working = false;
  this.paused = false;
  this.currTargetIdx = 0; // for a smooth intro
  this.currT = 0;

  this.BSW.fill( 0 );
  this.currV.fill( 0 );
  this.targV.fill( 0 );

  if ( !!cleanQueue ) // force to be boolean
      this.cleanQueueSentences();
}

/**
* returns a number 
* Bit 0: set when module is not working ( stopped )
* Bit 1: set when module is working but paused
* Bit 2: set when module does not have more sentences to compute. If working, it is idle, waiting for some push
* if the entire value is 0, the module is actively working
* @returns 
*/
Text2Lip.prototype.getCompactState = function () {
  let result = !this.working;
  result |= this.paused << 1;
  result |= ( !this.queueSize ) << 2;
  return result;
}


Text2Lip.prototype.isWorking = function () { return this.working; }
Text2Lip.prototype.isPaused = function () { return this.paused; }
Text2Lip.prototype.needsSentences = function () { return !this.queueSize; }
Text2Lip.prototype.getNumSentences = function () { return this.queueSize; }
Text2Lip.prototype.getMaxNumSentences = function () { return Text2Lip.QUEUE_MAX_SIZE; }

Text2Lip.prototype.update = function ( dt ) {
  if ( !this.working || this.paused || !this.currSent ) { return; }

  // check for sentence delay
  if ( this.delay > 0.001 ) {
      this.delay -= dt;

      if ( this.delay >= 0.0 ) {
          return;
      }
      dt = -this.delay;
      this.delay = 0;
      if ( dt < 0.001 ) return;
  }
  let durations = this.currSent.phT;

  let invSpeed = 1.0 / this.speed; // seconds / phoneme
  this.currT += dt;

  let p = 0;
  let t = 0;
  let useGeneralSpeed = true; // when durations array ends, it should continue with general speed
  // use specific phoneme durations
  if ( durations && this.currTargetIdx < durations.length ) {
      useGeneralSpeed = false;
      let durationIdx = this.currTargetIdx;
      while ( durationIdx < durations.length && durations[ durationIdx ] < this.currT ) {
          this.currT -= Math.max( 0.001, durations[ durationIdx ] );
          durationIdx++;
          p++;
      }
      useGeneralSpeed = durationIdx >= durations.length; // durations array has ended. Check general speed
      this.currT = Math.max( 0, this.currT ); // just in case
      t = ( durationIdx < durations.length ) ? ( this.currT / durations[ durationIdx ] ) : clamp( this.currT * this.speed ); // after phoneme ease-in, t will be clamped to 1 until phoneme change
      this.currTargetIdx = durationIdx;
  }

  // no more specific phoneme durations and there is enough time to check 
  if ( useGeneralSpeed ) {
      // use temporal p variable to avoid overwriting durations array result
      let general_p = Math.floor( this.currT * this.speed ); // complete phonemes 
      t = ( this.currT * this.speed ) - general_p;  // remaining piece of phoneme, used on interpolation
      this.currT -= general_p * invSpeed;
      this.currTargetIdx += general_p;
      p += general_p;
  }


  // t function modifier;
  //t = 0.5* Math.sin( t * Math.PI - Math.PI * 0.5 ) +0.5; // weird on slow phonemes

  // phoneme changed
  if ( p > 0 ) {

      // copy target values to source Viseme. Several phonemes may have passed during this frame. Take the last real target phoneme
      let lastPhonemeIndex = clamp( this.currTargetIdx - 1, 0, this.text.length - 1 ); // currTargetIdx here is always > 0. text.length here is always > 0
      this.intensity = this.getIntensityAtIndex( lastPhonemeIndex ); // get last real target viseme with correct intensity, in case more than 1 phoneme change in the same frame

      let lastPhoneme = this.text[ lastPhonemeIndex ];
      let lastPhonemeNext = ( lastPhonemeIndex == ( this.text.length - 1 ) ) ? null : ( this.text[ lastPhonemeIndex + 1 ] );
      this.getCoarticulatedViseme( lastPhoneme, lastPhonemeNext, this.currV );


      // end of sentence reached
      if ( this.currTargetIdx >= this.text.length ) {
          for ( let i = 0; i < this.numShapes; ++i ) { this.BSW[ i ] = this.currV[ i ]; } // currV holds the last real target phoneme
          this.changeCurrentSentence();
          return;
      }

      this.intensity = this.getIntensityAtIndex( this.currTargetIdx ); // get intensity for next target

      // compute target viseme, using coarticulation 
      // outro
      //        if (this.currTargetIdx === this.text.length - 1) {
      //            for (let i = 0; i < this.numShapes; ++i) { this.targV[i] = 0; }
      //        }
      if ( !this.useCoarticulation ) {
          this.getViseme( this.text[ this.currTargetIdx ], this.targV );
      }
      else {
          let targetPhoneme = this.text[ this.currTargetIdx ];
          let targetPhonemeNext = ( this.currTargetIdx == ( this.text.length - 1 ) ) ? null : this.text[ this.currTargetIdx + 1 ];
          this.getCoarticulatedViseme( targetPhoneme, targetPhonemeNext, this.targV );
      }
  }

  // final interpolation
  let BSW_0 = this.currV;
  let BSW_1 = this.targV;

  for ( let i = 0; i < this.numShapes; ++i ) {
      this.BSW[ i ] = ( 1.0 - t ) * BSW_0[ i ] + t * BSW_1[ i ];
  }
}

Text2Lip.prototype.cleanQueueSentences = function () {
  this.queueIdx = 0;
  this.currSent = null;
  this.queueSize = 0;
  this.sentenceQueue.fill( null );
}

/**
* sets all necessary parameters for the sentence indicated by queueIdx (if any).  
* @param {Bool} advanceIndex before setting paramters, index of sentence is incremented and amoun of sentences reduced, discarding the previous sentence
* @returns 
*/
Text2Lip.prototype.changeCurrentSentence = function ( advanceIndex = true ) {

  if ( advanceIndex ) { // when executing start(), do not advance 
      --this.queueSize;
      this.sentenceQueue[ this.queueIdx ] = null; // dereference obj
      this.queueIdx = ( this.queueIdx + 1 ) % Text2Lip.QUEUE_MAX_SIZE;

      // end events
      if ( this.currSent && this.onSentenceEnd ) { this.onSentenceEnd( this.currSent ); }
      if ( this.currSent.onEndEvent ) { this.currSent.onEndEvent(); }
  }

  if ( this.queueSize <= 0 ) {
      this.currT = 0;
      this.cleanQueueSentences();
      if ( this.onIdle ) { this.onIdle(); }
      return;
  }

  // parameters setup
  this.currSent = this.sentenceQueue[ this.queueIdx ];

  this.text = this.currSent.text;
  this.speed = this.currSent.speed;
  this.delay = this.currSent.delay;
  this.useCoarticulation = this.currSent.useCoart;

  this.currTargetIdx = 0;
  if ( !advanceIndex ) { this.currT = 0; } // reset timer only if called from start. Otherwise keep remaining time from previous sentence

  // target first phoneme
  this.intensity = this.getIntensityAtIndex( this.currTargetIdx ); // get target viseme with correct intensity

  if ( this.useCoarticulation ) {
      let targetPhoneme = this.text[ 0 ];
      let targetPhonemeNext = ( this.text.length > 1 ) ? this.text[ 1 ] : null;
      this.getCoarticulatedViseme( targetPhoneme, targetPhonemeNext, this.targV );
  }
  else {
      this.getViseme( this.text[ 0 ], this.targV );
  }

  // Start events
  if ( this.onSentenceStart ) { this.onSentenceStart( this.currSent ); } // generic start event
  if ( this.currSent.onStartEvent ) { this.currSent.onStartEvent(); }     // sentence specifici start event
}

/**
* Adds sentence to the queue.
WARNING!!!
Each sentence will have a smooth intro and outro. (from neutral to phoneme and from phoneme to neutral pose)
   - Intro time DOES NOT have to be accounted for on any timing
   - Outro time HAVE to be accounted for timings. If not included in sentT, the system will use default phoneme speed to transition to neutral. sentT should take it into account
Any value below 0.001 will be ignored.
* @param {string/array} text string of phonemes to display 
* @param {object} options object containing any of the optional string of phonemes to display 
* @param {Float32Array} phT (Optional) timing for each phoneme. Overrides sentT, speed and defaultSpeed
* @param {Number} sentT (Optional): Number, timing (in seconds) of whole string. Overrides defaultSpeed and speed argument. Delay not included. Defaults to null.
* @param {Number} speed (Optional) phonemes/s of whole string. Overrides generalSpeed. Delay not included
* @param {Boolean} useCoart (Optional) use coarticulation. Default to true.
* @param {Number} delay (Optional) delay to start playing this string. Delay starts at the end of the sentence it is being played now. If none, delay starts immediately.
* @param {Boolean} copyArrays (Optional) Whether to create new arrays and copy values or directly use the reference sent as argument. Defaults to false (only reference is used).
* @param {Function} onStartEvent (Optional) when sentence starts, this event is called after the generic onSentenceStart event.
* @param {Function} onEndEvent (Optional) when sentence ends, this event is called after the generic onSentenceEnd event.
* @returns the id number of the sentence if successful. 0 otherwise.
*/
Text2Lip.prototype.pushSentence = function ( text, options = {} ) {
  let phT = options.phT;
  let sentT = options.sentT;
  let speed = options.speed;
  let phInt = options.phInt;
  let sentInt = options.sentInt;
  let delay = options.delay;
  let outro = options.outro;
  let useCoart = options.useCoart;
  let copyArrays = options.copyArrays;
  let onEndEvent = options.onEndEvent;
  let onStartEvent = options.onStartEvent;

  if ( this.queueSize === Text2Lip.QUEUE_MAX_SIZE ) { return null; }
  if ( !text || !text.length ) { return null; }

  // clean input
  if ( !( phT instanceof Float32Array ) ) phT = null;
  if ( !( phInt instanceof Float32Array ) ) phInt = null;

  if ( copyArrays ) {
      text = Array.from( text ); // create new array from
      if ( phT ) {
          let temp = new Float32Array( phT.length );
          temp.set( phT );
          phT = temp;
      }
      if ( phInt ) {
          let temp = new Float32Array( phInt.length );
          temp.set( phInt );
          phInt = temp;
      }
  }

  // put outro 
  if ( !!outro ) {
      if ( typeof ( text ) === 'string' ) { text = text + "."; }
      else { text.push( "." ); }
  }
  if ( text.length < 0 ) { return null; }


  let sentenceSpeed = this.DEFAULT_SPEED;
  if ( typeof ( speed ) === 'number' && !isNaN( speed ) && speed >= 0.001 ) { sentenceSpeed = speed; }
  if ( typeof ( sentT ) === 'number' && !isNaN( sentT ) && sentT >= 0.001 ) { sentenceSpeed = text.length / sentT; }
  if ( typeof ( delay ) !== 'number' || isNaN( delay ) || delay < 0 ) { delay = 0; }
  if ( typeof ( useCoart ) === 'undefined' ) { useCoart = true; } useCoart = !!useCoart;
  if ( !( onEndEvent instanceof Function ) ) { onEndEvent = null; }
  if ( !( onStartEvent instanceof Function ) ) { onStartEvent = null; }


  if ( typeof ( sentInt ) !== 'number' || isNaN( sentInt ) ) { sentInt = null; } // this allows for changing intensity while mouthing through setDefaulIntensity
  else { sentInt = clamp( sentInt, 0.0, 1.0 ); }


  let id = this.sentenceIDCount++;
  let totalTime = this.getSentenceDuration( text, options ); // doing work twice, though...
  let sentenceObj = {
      id: id,
      totalTime: totalTime,
      text: text,
      phT: phT,
      speed: sentenceSpeed,
      phInt: phInt,
      sentInt: sentInt,
      useCoart: useCoart,
      delay: delay,
      onStartEvent: onStartEvent,
      onEndEvent: onEndEvent,
  }

  let indexPos = ( this.queueIdx + this.queueSize ) % Text2Lip.QUEUE_MAX_SIZE;
  this.sentenceQueue[ indexPos ] = sentenceObj; // only reference is copied
  this.queueSize++;

  // when working but idle because of no sentences, automatically play this new sentence
  if ( this.working && this.queueSize == 1 ) {
      this.changeCurrentSentence( false );
  }
  return { id: id, totalTime: totalTime };
};

/**
* Send the same info you would send to pushSentence.
* @param {string/array} text 
* @param {object} options 
* @returns in seconds
*/
Text2Lip.prototype.getSentenceDuration = function ( text, options ) {
  // THE ONLY REASON THIS IS NOT STAIC IS BECAUSE IT USES this.DEFAULT_SPEED   
  let phT = options.phT;
  let sentT = options.sentT;
  let speed = options.speed;
  let delay = options.delay;
  let outro = options.outro;

  if ( !text || !text.length ) { return 0; }
  if ( !( phT instanceof Float32Array ) ) phT = null;

  let textLength = text.length;
  if ( !!outro ) { textLength++; }
  let sentenceSpeed = this.DEFAULT_SPEED;
  if ( typeof ( speed ) === 'number' && !isNaN( speed ) && speed >= 0.001 ) sentenceSpeed = speed;
  if ( typeof ( sentT ) === 'number' && !isNaN( sentT ) && sentT >= 0.001 ) sentenceSpeed = textLength / sentT;

  if ( typeof ( delay ) !== 'number' || isNaN( delay ) || delay < 0 ) delay = 0;


  let totalTime = 0;
  totalTime += delay;

  if ( phT ) {
      let validEntries = ( phT.length >= textLength ) ? textLength : phT.length;
      for ( let i = 0; i < validEntries; ++i ) { totalTime += Math.max( phT[ i ], 0.001 ); }

      textLength -= validEntries;
  }

  // use sentence speed to compute time of phonemes with no phT
  totalTime += textLength * ( 1.0 / sentenceSpeed );

  return totalTime;
}

// ------------------------ LIPSYNC -------------------------------------

// Constructor
function Lipsync( ph2v, coarts, lowerBoundVisemes, upperBoundVisemes = null ) {

  // Text to lip things ----
  this.t2lip = new Text2LipInterface();
  this.t2lip.setTables( ph2v, coarts, lowerBoundVisemes, upperBoundVisemes );
  let that = this;
  this.t2lip.setEvent("onIdle", function () { that.stop(); });


  // Initialize sound buffers ----
  this.init();

  this.working = false;
  this.mode = Lipsync.MODES.NONE;
  this.BSW = Float32Array.from( this.t2lip.getBSW() );

}


Lipsync.MODES = {
  NONE: 0,
  FREE: 1, // for sliders
  TEXT2LIP: 2,
  AUDIO2LIP: 3,
  AUDIO2LIP_USERMEDIA: 4,
  AUDIO2LIP_DISPLAYMEDIA: 5,
}
this.LIPSYNCMODES = Lipsync.MODES;

// Start mic input
Lipsync.prototype.start = function (mode = Lipsync.MODES.FREE, test = null) {
  // Restart
  this.stop();

  let thatLip = this;
  let MODES = Lipsync.MODES;
  switch (mode) {
    case MODES.FREE:  // slider mode
      this.mode = MODES.FREE;
      this.working = true;
      break;
    case MODES.TEXT2LIP:
      if ( !test ) { return; } 
      this.mode = MODES.TEXT2LIP;
      this.working = true;
      this.t2lip.pushSentence( test.text
        ,{ 
           phT : test.times,
           sentT : test.sentenceTime,
           speed : test.speed,
           useCoart : test.coart, 
           delay : test.delay 
        } );

      if ( test.audio ){ this.loadSample( test.audio ); }
      else{ this.t2lip.start(); }
      break;

    default: 
      this.mode = MODES.NONE;
      break;  
  }
}

Lipsync.prototype.loadSample = function(inURL){
  let URL = LS.RM.getFullURL (inURL);
  let request = new XMLHttpRequest();
  request.open('GET', URL, true);
  request.responseType = 'arraybuffer';

  let that = this;
  request.onload = function(){
    that.context.decodeAudioData(request.response)
    .then( function(buffer){
      that.stopSample();
      that.sample = LS.Globals.AContext.createBufferSource();
      that.sample.buffer = buffer;
      console.log("Audio loaded");
      that.playSample();
    })
    .catch(function(e){ this.sample = null; console.log("Failed to load audio"); })
    .finally( function(){           
      // independently of audio load outcome, start mouthing
      let MODES =  Lipsync.MODES;
      switch( that.mode ){
        case MODES.TEXT2LIP:
          that.t2lip.start();
          break;
        default: break;
      }
    });
    
  };
	request.send();
}



Lipsync.prototype.playSample = function () {

  // Sample to Gain
  this.sample.connect(this.gainNode);

  // Gain to Hardware
  this.gainNode.connect(this.context.destination);

  // Volume
  this.gainNode.gain.value = 1;
  console.log("Sample rate: ", this.context.sampleRate);
  that = this;
  this.working = true;

  this.sample.onended = function () {    
    if (that.mode == Lipsync.MODES.AUDIO2LIP) {
      that.stop();
    }
  };
  // start
  this.sample.start(0);
}


// Update lipsync weights
Lipsync.prototype.update = function (dt) {

  if (!this.working)
    return;

  let MODES = Lipsync.MODES;
  switch (this.mode) {

    case MODES.TEXT2LIP:
      if (!this.t2lip.getCompactState()) {
        this.t2lip.update(dt);
        let BSW = this.t2lip.getBSW();
        for (let i = 0; i < numShapes; ++i) {
          this.BSW[i] = BSW[i];
        }
        if (this.t2lip.getCompactState()) { this.stop(); }
      }
      return;
      break;

    default: return; break;
  }
}

Lipsync.prototype.stop = function (dt) {
  // Immediate stop
  if (dt === undefined) {
    // Stop mic input
    this.stopSample();
    this.t2lip.stop(true);
    this.working = false;
  }
  // Delayed stop
  else {
    thatLip = this;
    setTimeout(thatLip.stop.bind(thatLip), dt * 1000);
  }
}

// Audio buffers and analysers
Lipsync.prototype.init = function () {

  let context = this.context = LS.Globals.AContext;
 
  // Sound source
  this.sample = context.createBufferSource();
  // Gain Node
  this.gainNode = context.createGain();

}

// Stops mic input
Lipsync.prototype.stopSample = function () {
  // If AudioBufferSourceNode has started
  if (this.sample){
    this.sample.disconnect();
    if (this.sample.buffer){
      this.sample.stop(0);
    }
  }
  this.sample = null;

}


// --------------------- GUI LIPSYNC --------------------

//@GUI Lipsync
if (!LS.Globals)
  LS.Globals = {};



// URLs
this.URL = [];
// Voiced female - I see five lamps/I have four airplanes
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/i-see-five-lamps-f.wav");
// Voice male
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/i-have-four-airplanes-m.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/i-see-five-lamps-m.wav");

// Other characters
// Mufasa
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/mufasa.mp3");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/mufasa_roar.mp3");

// Proverbs
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/englishProverbs.mp3");

this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/testamento.mp3");

// German
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/originalmale.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/originalfemale.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/modifiedmale.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/modifiedfemale.wav");

this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/aaa.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/eee.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/iii.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/ooo.wav");
this.URL.push("https://webglstudio.org/latest/fileserver/files//gerard/audios/uuu.wav");



let sliderYOffset = 100;


this.onMouseDown = function (e) {
   this.GUI.mouseDown( e );
}

let cameraController = node.getComponent(LS.Components.CameraController);
let pressedC = false;
// to (not) orbit camera. action=0 nothing. action=1 orbit 
this.onKeyDown = function (e) {
  if (e.keyCode == 67) { // KeyC
    cameraController.left_button_action = !cameraController.left_button_action;
    pressedC = !pressedC;
  }
}


this.onRenderGUI = function () {
  if (!this.lipsyncModule)
    return;


  let width = gl.viewport_data[2];
  let height = gl.viewport_data[3];

  gl.start2D();

  gl.font = '15px arial';
  

  let size = ( width < height ) ? width : height;
  size *= 0.25;
  this._emotionIntensitySlider.x = width - size - 50;
  this._emotionIntensitySlider.y = height - 135 - size - 50;
  this._emotionIntensitySlider.w =  size;
  this._emotionIntensitySlider.h = size;
  this.GUI.render();



  // Helper
  let helper = { x: width - 380, y: height - 135, w: 370, h: 125 };
  gl.fillStyle = "rgba(255,255,255,1)";
  gl.fillRect(helper.x, helper.y, helper.w, helper.h);

  gl.fillStyle = "rgba(0,0,0,0.9)";
  gl.fillText("Mouse Left Click    Click upper screen buttons\n" +
    "Mouse Left Drag    Camera orbit / Move sliders\n" +
    "Mouse Right Drag   Camera pan\n" +
    "Mouse Wheel      	Zoom\n" +
    "C                 Disable/Enable camera orbit\n"
    , helper.x + 20, helper.y + 20);


  gl.font = '900 15px arial';
  if (cameraController.left_button_action) {
    gl.fillStyle = "rgba(100,0,100,1)";
    gl.fillText("Camera Orbit Enabled", helper.x + 20, helper.y + 110);
  } else {
    gl.fillStyle = "rgba(255,0,0,1)";
    gl.fillText("Camera Orbit Disabled", helper.x + 20, helper.y + 110);
  }


  gl.finish2D();

}

// --------------------- FACIAL LIPSYNC --------------------

// Globals
if (!LS.Globals)
  LS.Globals = {};

this.headNodeName = "Body";


// Lip-sync blend shapes factor
this.LipKissFactor = 1;
this.LipLipsClosedFactor = 1;
this.LipJawFactor = 1;
this.LipTongueFactor = 1;
this.LipSmileFactor = 1;
this.LowerLipFactor = 1;

this._blendshapes = null;


// Lipsync
// Energy bins
// kiss, upperLipClosed, lowerLipClosed, jaw, tongue, smile
this._lipsyncBSW = null; 
let numShapes = 0;
this._emotionIntensity = new Float32Array(2); this._emotionIntensity.fill(0.5); 
this._emotionIntensitySlider = null; 



this.onStart = function () {
  this.GUI = GUI2DLib.createGUI( gl );
  
  TablesScript = LS.Globals.Scripts["root/TablesScript"];
  let LBVisemes = TablesScript._lowerBound;
  let UBVisemes = TablesScript._upperBound;
  let coarts = TablesScript._coarts;
  let ph2v = TablesScript._ph2v;


  numShapes = LBVisemes[0].length;
  this._lipsyncBSW = new Array(numShapes); this._lipsyncBSW.fill(0);
  this.lipsyncModule = new Lipsync( ph2v, coarts, LBVisemes, UBVisemes );



  let that = this;
  this.GUI.createButton("SLIDERS", function () { that.lipsyncModule.start(Lipsync.MODES.FREE); });

  // sliders for Blendshape weights
  function BSWslidersUpdate(index, newV, oldV) {
    newV[1] = 0;
    if (that.lipsyncModule.working && that.lipsyncModule.mode == Lipsync.MODES.FREE) {
      that.lipsyncModule.BSW[index] = newV[0];
    }
    else{ newV[0] = that.lipsyncModule.BSW[index]; }
  }
  
  function BSWslidersRender() {
    if (that.lipsyncModule.working && that.lipsyncModule.mode == Lipsync.MODES.FREE) { return true; }
    return false;
  }

  this.GUI.createSlider1D("KISS", 200, sliderYOffset + 25, 100, 50, 0, BSWslidersUpdate.bind(this, 0), BSWslidersRender.bind(this));
  this.GUI.createSlider1D("UPPER LIP", 200, sliderYOffset + 100, 100, 50, 0, BSWslidersUpdate.bind(this, 1), BSWslidersRender.bind(this));
  this.GUI.createSlider1D("LOWER LIP", 200, sliderYOffset + 175, 100, 50, 0, BSWslidersUpdate.bind(this, 2), BSWslidersRender.bind(this));
  this.GUI.createSlider1D("JAW", 200, sliderYOffset + 250, 100, 50, 0, BSWslidersUpdate.bind(this, 3), BSWslidersRender.bind(this));
  this.GUI.createSlider1D("TONGUE FRONT", 200, sliderYOffset + 325, 100, 50, 0, BSWslidersUpdate.bind(this, 4), BSWslidersRender.bind(this));
  this.GUI.createSlider1D("TONGUE BACK", 200, sliderYOffset + 400, 100, 50, 0, BSWslidersUpdate.bind(this, 5), BSWslidersRender.bind(this));
  this.GUI.createSlider1D("TONGUE OUT", 200, sliderYOffset + 475, 100, 50, 0, BSWslidersUpdate.bind(this, 6), BSWslidersRender.bind(this));

  
  this._emotionIntensitySlider = this.GUI.createSlider2D("", "Angry <---> Happy", "Tired <---> Energetic", 0, 0, 250, 250, this._emotionIntensity, function(newV,oldV){ that._emotionIntensity.set(newV); that.lipsyncModule.t2lip.setDefaultIntensity( newV[1] ); });

  // Get head node
  let head = node.scene.getNodeByName(this.headNodeName);
  if (!head) {
    console.log("Head node not found");
    return;
  }

  // blink
  let eyeLashes = node.scene.getNodeByName("Eyelashes");
  eyeLashesMorph = eyeLashes.getComponent(LS.Components.MorphDeformer).morph_targets;


  // Get morph targets
  let morphTargets = head.getComponent(LS.Components.MorphDeformer);

  if (!morphTargets) {
    console.log("Morph deformer not found in: ", head.name);
    return;
  }
  morphTargets = morphTargets.morph_targets;
  this._blendshapes = morphTargets;

}


let eyeLashesMorph = null; // morphTargets node from eyelashes node
let blink = 0;  // blink blendshape value
let timeNextBlink = 1; // timeout, wait between blinks
let blinkT = 0; // blink time accumulator - blink animation
let blinkTmax = 0.2;  // max blink time animation


this.onUpdate = function (dt) {
  this.GUI.update(dt);

  // blinking ---------------------
  if (blinkT >= blinkTmax) { // blink finished. Set new timeout
    timeNextBlink = Math.random() * 4 + 2;
    blinkTmax = Math.random() * 0.3 + 0.2;
    blinkT = 0;
  }
  if (timeNextBlink > 0) { // waiting for timeout
    timeNextBlink -= dt;
  }
  else {  // blink animation
    blinkT += dt;
    blink = clamp(Math.sin((blinkT / blinkTmax) * Math.PI));
  }
  // blink
  this._blendshapes[0].weight = blink;    // eye Left
  this._blendshapes[1].weight = blink;    // eye Right
  eyeLashesMorph[0].weight = blink;       // eyelashes Left
  eyeLashesMorph[1].weight = blink;       // eyelashes Right



  // Lipsync update ------------------------
  this.lipsyncModule.update(dt);
  //if (!this.lipsyncModule.working)
  //return;

  // Copy Blend Shape Weights array
  this._lipsyncBSW = this.lipsyncModule.BSW;


  // Update blendshapes ----------------------
  if (!this._blendshapes) {
    console.log("Blend shapes not found");
    return;
  }

  // Modify lip blend shapes
  this.updateFace();

  // node.scene.refresh();
}


this.onFinish = function () {

  if (this.lipsyncModule) {
    this.lipsyncModule.stop();
    if (this.lipsyncModule.tfModel) {
      this.lipsyncModule.tfModel.deinit();
    }
  }
}



this.updateFace = function () {
  // Modify facial blendshapes
  // kiss
  this._blendshapes[30].weight = this._lipsyncBSW[0] * 0.4 * this.LipKissFactor;
  this._blendshapes[31].weight = this._lipsyncBSW[0] * 0.4 * this.LipKissFactor;
  this._blendshapes[33].weight = this._lipsyncBSW[0] * this.LipKissFactor;
  this._blendshapes[34].weight = this._lipsyncBSW[0] * this.LipKissFactor;

  // lipsClosed
  this._blendshapes[32].weight = 0.1 + this._lipsyncBSW[1] * 0.4 * this.LipLipsClosedFactor; // lips down (moves mouth skin a bit down for more dramatism)

  this._blendshapes[49].weight = clamp(this._lipsyncBSW[1] * (-1.5) * this.LipLipsClosedFactor, -1, 0); // upper lip in
  this._blendshapes[50].weight = this._lipsyncBSW[1] * (-0.3) * this.LipLipsClosedFactor; // upper lip left
  this._blendshapes[51].weight = this._lipsyncBSW[1] * (-0.3) * this.LipLipsClosedFactor; // upper lip right

  this._blendshapes[26].weight = this._lipsyncBSW[2] * (-0.8) * this.LipLipsClosedFactor; // lowerLip left
  this._blendshapes[27].weight = this._lipsyncBSW[2] * (-0.8) * this.LipLipsClosedFactor; // lowerLip right
  this._blendshapes[28].weight = this._lipsyncBSW[2] * this.LipLipsClosedFactor; // lower lip in

  // mouthOpen
  this._blendshapes[35].weight = (this._lipsyncBSW[3]) * this.LipJawFactor;// + this._lipsyncBSW[1] * (-0.15) ) * this.LipJawFactor ; // mouth open

  // tongue
  this._blendshapes[45].weight = this._lipsyncBSW[4] * this.LipTongueFactor; // frontUp
  this._blendshapes[46].weight = this._lipsyncBSW[5] * this.LipTongueFactor; // backUp
  this._blendshapes[47].weight = this._lipsyncBSW[6] * this.LipTongueFactor; // out


  let happy = clamp( this._emotionIntensity[0] * 2.0 - 1.0, 0, 1);
  let angry = clamp( this._emotionIntensity[0] * 2.0 - 1.0, -1, 0) * (-1);

  this._blendshapes[41].weight = happy * 0.5; //smile left
  this._blendshapes[42].weight = happy * 0.5; // smile right
  this._blendshapes[8].weight = happy * 0.2; // brows up l
  this._blendshapes[9].weight = happy * 0.2; // brows up r

  
  this._blendshapes[2].weight = angry * 0.7; //brows down left
  this._blendshapes[3].weight = angry * 0.7; // brows down right
  this._blendshapes[4].weight = angry * 1.0; // brows in l
  this._blendshapes[5].weight = angry * 1.0; // brows in r
  this._blendshapes[39].weight = angry * 0.4; //nose left
  this._blendshapes[40].weight = angry * 0.4; // nose right
}