function clamp( value, min = 0.0, max = 1.0 ) {
    if ( value < min ) { return min; }
    if ( value > max ) { return max; }
    return value;
}
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

    // default setup
    this.setTables( T2LTABLES.PhonemeToViseme, T2LTABLES.Coarticulations, T2LTABLES.LowerBound, T2LTABLES.UpperBound );
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
		  
		if ( this.useCoarticulation ){
			let lastPhonemeNext = ( lastPhonemeIndex == ( this.text.length - 1 ) ) ? null : ( this.text[ lastPhonemeIndex + 1 ] );
			this.getCoarticulatedViseme( lastPhoneme, lastPhonemeNext, this.currV );
		}
		else{
			this.getViseme( lastPhoneme, this.currV );
		}

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
 * @param {object} options object containing any of the optional string of phonemes to display.
 * @param {Float32Array} phT (Optional) timing for each phoneme. Overrides sentT, speed and default speed.
 * @param {Number} sentT (Optional): Number, timing (in seconds) of whole string. Overrides default speed and speed argument. Delay not included. Defaults to null.
 * @param {Number} speed (Optional) phonemes/s of whole string. Overrides default speed. Delay not included.
 * @param {Float32Array} phInt (Optional) intensity for each phoneme. Overrides sentInt and default intensity.
 * @param {Number} sentInt (Optional) intensity of whole string. Overrides default intensity. Delay not included.
 * @param {Boolean} useCoart (Optional) use coarticulation. Default to true.
 * @param {Number} delay (Optional) delay to start playing this string. Delay starts at the end of the sentence it is being played now. If none, delay starts immediately.
 * @param {Boolean} copyArrays (Optional) Whether to create new arrays and copy values or directly use the reference sent as argument. Defaults to false (only reference is used).
 * @param {Boolean} outro (Optional) Whether to automatically include a final "." into the string to end in neutral pose. Defaults to false.
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


// TABLES ------------------------------

//[ "kiss", "upperLipClosed", "lowerLipClosed", "jawOpen", "tongueFrontUp", "tongueBackUp", "tongueOut" ],
let lowerBound = [
    [ 0,     0,     0,     0,     0,     0,     0   ], // 0
    [ 0,     0,     0,     0,     0,     0,     0   ],
    [ 0.1,   0.15,  0,     0.2,   0,     0,     0   ],
    [ 0.0,   0.13,  0,     0.2,   0.2,   0,     0   ],
    [ 0,     0.08,  0,     0.1,   0.5,   0.5,   0   ], // 4
    [ 0.25,  0.15,  0.15,  0.2,   0,     0,     0   ],
    [ 0.35,  0.15,  0.15,  0.2,   0,     0,     0   ],
    [ 0.0,   0.15,  0,     0.1,   1,     0,     0   ],
    [ 0,     0.5,   0.2,   0.1,   0,     0,     0   ], // 8
    [ 0,     0.0,   0.2,   0.1,   0,     0,     0   ],
    [ 0.3,   0,     0,     0.13,  0.8,   0,     0   ],
    [ 0.0,   0,     0,     0.2,   0.0,   0.3,   0   ],
    [ 0.0,   0,     0,     0.1,   0.0,   1,     0   ], // 12
    [ 0.3,   0,     0,     0.1,   1,     0,     0   ],
    [ 0,     0,     0.0,   0.1,   0.35,  0,     0.3 ],
];

let upperBound = [
    [ 0,     0,     0,     0,     0,     0,     0   ], // 0
    [ 0,     0,     0,     0,     0,     0,     0   ], 
    [ 0.1,   0.15,  0,     0.6,   0,     0,     0   ],
    [ 0.0,   0.13,  0,     0.3,   0.2,   0,     0   ],
    [ 0,     0.08,  0,     0.2,   0.6,   0.6,   0.2 ], // 4
    [ 0.45,  0.15,  0.15,  0.6,   0,     0,     0   ],
    [ 0.65,  0.3,   0.3,   0.3,   0,     0,     0   ],
    [ 0.0,   0.15,  0,     0.4,   1,     0,     0.5 ],
    [ 0,     1,     1,     0.4,   0,     0,     0   ], // 8
    [ 0,     0.0,   1,     0.4,   0,     0,     0   ],
    [ 0.3,   0,     0,     0.13,  0.8,   0,     0   ],
    [ 0.0,   0,     0,     0.4,   0.0,   0.3,   0   ],
    [ 0.1,   0,     0,     0.2,   0.0,   1,     0   ], // 12
    [ 0.3,   0,     0,     0.22,  1,     0,     0   ],
    [ 0,     0,     0.0,   0.4,   0.55,  0,     0.8 ],
];

// coarticulation weights for each phoneme. 0= no modification to phoneme, 1=use phonemes arround to build viseme
let coarts = [
    [ 0,     0,     0,     0,     0,     0,     0   ], // 0
    [ 0.6,   0.6,   0.6,   0.6,   0.6,   0.6,   0.6 ],
    [ 0.2,   0.3,   0.3,   0.3,   0.1,   0.3,   0.5 ],
    [ 0.0,   0.3,   0.3,   0.3,   0.1,   0.3,   0.5 ],
    [ 0.1,   0.3,   0.3,   0.3,   0,     0,     0.5 ], // 4
    [ 0.2,   0.3,   0.3,   0.3,   0.3,   0.3,   0.5 ],
    [ 0.2,   0.3,   0.3,   0.3,   0.3,   0.3,   0.5 ],
    [ 1,     0.4,   0.4,   0.9,   0,     0.5,   0.5 ],
    [ 1,     0,     0,     0.2,   1,     0.8,   0.5 ], //8 
    [ 1,     0,     0,     0.2,   1,     0.5,   0.5 ],
    [ 1,     0.6,   0.6,   0.6,   0,     0.5,   0.5 ],
    [ 1,     1,     1,     0.7,   0.5,   0.5,   0.5 ],
    [ 0.7,   0.5,   0.5,   0.9,   0.6,   0,     0.5 ], //12
    [ 1,     1,     1,     0.5,   0,     0,     0.5 ],
    [ 1,     0.3,   0.3,   0.3,   0,     0.6,   0   ], 
];


let ph2v = {
    ".": 0, "_": 1, " ": 1,
    "a": 2,//"AA"	 
    "@": 2,//"AE"	 
    "A": 2,//"AH"	 
    "c": 5,//"AO"	 
    "W": 2,//"AW"	 
    "x": 2,//"AX"	 
    "Y": 2,//"AY"	 
    "E": 3,//"EH"	 
    "R": 3,//"ER"	 
    "e": 3,//"EY"	 
    "I": 4,//"IH"	 
    "X": 4,//"IX"	 
    "i": 4,//"IY"	 
    "o": 5,//"OW"	 
    "O": 5,//"OY"	 
    "U": 6,//"UH"	 
    "u": 6,//"UW"	 

    "b": 8,//"B"	
    "C": 10,//"CH"	 // ------------------------ Really needs a new viseme - 'SH'
    "d": 13,//"D"	
    "D": 13,//"DH"	
    "F": 13,//"DX"	
    "L": 7,//"EL"	
    "M": 8,//"EM"	
    "N": 7,//"EN"	
    "f": 9,//"F"	
    "g": 12,//"G"	
    "h": 11,//"H"	// reduced
    "J": 10,//"JH"	 // ------------------------- Really needs a new viseme 'ZH'
    "k": 12,//"K"	
    "l": 7,//"L"	
    "m": 8,//"M"	
    "n": 7,//"N"	
    "G": 12,//"NG"	// reduced
    "p": 8,//"P"	
    "Q": 2,//"Q"	 // -------------------------- What is this?
    "r": 7,//"R"	
    "s": 10,//"S"	
    "S": 10,//"SH"	 // ------------------------ Really needs a new viseme - 'CH'
    "t": 13,//"T"	
    "T": 14,//"TH"	
    "v": 9,//"V"	
    "w": 6,//"W"	
    "H": 6,//"WH"	
    "y": 4,//"Y"	
    "z": 10,//"Z"	
    "Z": 10,//"ZH"	 // ------------------------- Really needs a new viseme 'JH'

};



// Arpabet Translators

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


// Arpabet 1 letter to 1-2-3-letter
let Arpa1to2 = {
    "a": "AA",
    "@": "AE",
    "A": "AH",
    "c": "AO",
    "W": "AW",
    "x": "AX",
    "Y": "AY",
    "E": "EH",
    "R": "ER",
    "e": "EY",
    "I": "IH",
    "X": "IX",
    "i": "IY",
    "o": "OW",
    "O": "OY",
    "U": "UH",
    "u": "UW",

    "b": "B",
    "C": "CH",
    "d": "D",
    "D": "DH",
    "F": "DX",
    "L": "EL",
    "M": "EM",
    "N": "EN",
    "f": "F",
    "g": "G",
    "h": "H",// reduced
    "J": "JH",
    "k": "K",
    "l": "L",
    "m": "M",
    "n": "N",
    "G": "NG",// reduced
    "p": "P",
    "Q": "Q",
    "r": "R",
    "s": "S",
    "S": "SH",
    "t": "T",
    "T": "TH",
    "v": "V",
    "w": "W",
    "H": "WH",
    "y": "Y",
    "z": "Z",
    "Z": "ZH",

};


let T2LTABLES = {
    BlendshapeMapping : { kiss : 0, upperLipClosed : 1, lowerLipClosed : 2, jawOpen : 3, tongueFrontUp : 4, tongueBackUp : 5, tongueOut : 6 },
    LowerBound : lowerBound,
    UpperBound : upperBound,
    Coarticulations: coarts,
    PhonemeToViseme : ph2v, 
    Arpa1to2 : Arpa1to2,
    Arpa2to1 : Arpa2to1,
}




export { Text2LipInterface, T2LTABLES };
