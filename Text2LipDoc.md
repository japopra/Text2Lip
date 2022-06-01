# Text2Lip Doc

Currently this script is a module. If the class is to be incrusted somewhere for some reason, just:
 * Remove the export line
 * (optionally) Delete the this.setTables line from the Text2Lip constructor (not interface)
 ```
 function Text2Lip() {
    [...]
    // default setup
    this.setTables( T2LTABLES.PhonemeToViseme, T2LTABLES.Coarticulations, T2LTABLES.LowerBound, T2LTABLES.UpperBound );
    [...]
}
 ```
 * (optionally) Remove the clamp function
 * (optionally) Remove all undesired tables

 ---

## Examples
```
import { Text2LipInterface, T2LTABLES } from Text2Lip.js

T2L = new Text2LipInterface ();
T2L.pushSentence( "ai sii faiv lamps", { phT: [ 0.1,0.1,   0.1,   0.1,0.1,0.1,   0.1,   0.1,0.1,0.1,0.1,   0.1,   0.1,0.1,0.1,0.1,0.1 ], 
                                         delay: 2.3,
                                         sentInt: 0.9,
                                         outro: true,
                                         onEndEvent: function(){ console.log( "I see five lamps. has finished" ); } });
T2L.start();
                                         
                                         

MainLoop ( deltaTime ) {
    // [...]
    T2L.update( deltaTime );
    // [...]
}

MainRender ( ) {
    
    // [...]
    let BSW = T2L.getBSW();

    // if using default visemes table    
    Mesh.morphTarget[ KissBlendshape ] = BSW[0]; 
    Mesh.morphTarget[ UpperLipClosedBlendshape ] = BSW[1]; 
    Mesh.morphTarget[ LowerLipClosedBlendshape ] = BSW[2]; 
    Mesh.morphTarget[ MouthOpenBlendshape ] = BSW[3]; 
    Mesh.morphTarget[ TongueFrontUpBlendshape ] = BSW[4]; 
    Mesh.morphTarget[ TongueBackUpBlendshape ] = BSW[5];     
    Mesh.morphTarget[ TongueOutBlendshape ] = BSW[6]; 

    // [...]

}

```
---
## Viseme, Coarticulation and Translation Tables

* T2LTABLES.BlendshapeNames  
Meaning for each of the entries in the BSW  
[ "kiss", "upperLipClosed", "lowerLipClosed", "jawOpen", "tongueFrontUp", "tongueBackUp", "tongueOut" ]  
When upperLipClosed and lowerLipClosed are fully set, the lips should be mouthing a /p/.

* LowerBound  
2D table with the blendshape weights of each viseme for a low intensity expression   

* UpperBound  
2D table with the blendshape weights of each viseme for a high intensity expression  

* Coarticulations  
2D table with the coarticulation weights of each blendshape for each viseme  

* PhonemeToViseme  
Translates phoneme character (Arpabet1) to its viseme index,
Three special characters exist:  
    * space `` `` and underscore ``_``.  Both mean a non-fullstop pause.  
    * full stop ``.``  

    
* Arpa1to2 
table that translate from Arpabet 1-letter to Arpabet 2-letter

* Arpa2to1  
Table that translate from Arpabet 2-letter to Arpabet 1-letter


---
## Text2LipInterface API Summary
```

Text2LipInterface ()

start ( )
stop ( cleanQueue = false )
pause ( )
resume ( )
update ( dt )

setEvent ( eventType, fun )
setTables  ( phonemeToViseme, coarticulations, lowerBoundVisemes, upperBoundVisemes = null )
setDefaultSpeed ( speed )
setDefaultIntensity ( value )
setSourceBSWValues ( values )

getDefaultSpeed ( )
getDefaultIntensity ( )
getCurrentIntensity ( )

getSentenceDuration ( text, options )
cleanQueueSentences ( )
pushSentence ( text, options )

getBSW ( )

getCompactState ( )
isWorking ( ) 
isPaused ( ) 
needsSentences ( )
getNumSentences ( )
getMaxNumSentences ( )


```

---  

### Text2LipInterface
```
Text2LipInterface ()
```
constructor  
During construction, a set of default tables are automatically set.  
Default tables have support for:  
* Arpabet 1-letter encoding   
* space `` `` and underscore ``_``.  Both mean a non-fullstop pause.  
* full stop ``.``  

---

### start

```
start ( )
```
Begins playing the queued sentences. If none, the module is kept in idle mode. If the module was active when start was called, the current sentence will start from the beginning again. To change the state of the module to ‘not working’, call stop 

---

### stop 
```
stop ( cleanQueue = false )
    - cleanQueue: [Optional] Boolean - default to False
```
Sets the module to ‘not working’. Blendshapes are set to 0 (neutral pose). If cleanQueue is true, the queue of sentences is cleared, setting the number of sentences to 0. To change the state of the module to ‘working’, call start.

---

### pause
```
pause ( )
```
The module stops making any kind of update. Blendshape values are kept. To continue playing from where it was stopped, call resume

---

### resume
```
resume ( )
```
The module starts computing updates again from where it was left when pause was called.

---

### update
```
update ( dt )
    - dt: Number > 0
```
Computes delays, changes of phonemes/sentences and/or blendshape values given the time passed since last update ( dt in seconds ).

---

### setEvent
```
setEvent ( eventType, fun )
    - eventType: string from this options: onIdle, onSentenceEnd, onSentenceStart
    - fun: callback function
```
Sets a callback for the specified module event. Only one callback (the newest) is held for each event type.

---

### setTables
```
setTables  ( phonemeToViseme, coarticulations, lowerBoundVisemes, upperBoundVisemes = null )
    - phonemeToViseme: 1D array or dictionary
    - coarts: 2D array of numbers -same size as visemes
    - lowerBoundVisemes: 2D array of numbers
    - upperBoundVisemes : [Optional] 2D array of numbers
```

Sets the arguments as the internal tables. They are NOT copied. They are only referenced. Any external modification to these tables will also be reflected in this module.  
phonemeToViseme must be able to translate a single element of the text (a character or a number) into an integer number. This number will select the viseme and coarticulation to use during interpolation.  
If upperBoundVisemes not provided, both lowerBoundVisemes and upperBoundVisemes will automatically hold a reference to the same table.  
During construction, a set of default tables are automatically set.  
Default tables have support for:  
* Arpabet 1-letter encoding   
* space `` `` and underscore ``_``.  Both mean a non-fullstop pause.  
* full stop ``.``  


---

### setDefaultSpeed
```
setDefaultSpeed ( speed )
    - speed: Number > 0.001
```
Speed in phonemes / second
Sets the default speed of the module. When pushing a sentence, if no timing or speed is sent, the default speed will be used instead.

---

### setDefaultIntensity
```
setDefaultIntensity ( value )
    - value: Number [0, 1]
```
Sets the default intensity of the gesticulation of the mouthing, used when no phoneme or sentence intensities are provided during a sentence push.  
Changes of this value take effect only during phoneme change but not during phoneme transition.
Automatically clamped between 0 and 1.

---

### setSourceBSWValues
```
setSourceBSWValues ( values )
    - values: Number or array
```
Sets the mouth posture from which it starts transitioning.

---

### getDefaultSpeed
```
getDefaultSpeed ( ) --returns--> Number
``` 
---

### getDefaultIntensity 
```
getDefaultIntensity ( ) --returns--> Number
```
---

### getCurrentIntensity
```
getCurrentIntensity ( ) --returns--> Number
```
---

    
### getSentenceDuration
```
getSentenceDuration ( text, options ) --returns--> Number
```
Given the same query that would be sent to pushSentence, it returns the duration of the entire sentence ( delay + sentence ).  
Only the text and time parameters ( phT, sentT, speed, outro, delay ) are required
---

### cleanQueueSentences
```
cleanQueueSentences ( )
```
Clears the queue of sentences to be computed during update. If the module is in 'working' state, it will become 'idle'.

---

### pushSentence
```
pushSentence ( text, options ) --returns-->  object { id: number, totalTime: number } with the sentence ID and its duration in seconds if succeeded, null otherwise.  
    - text: String of phonemes to display.  
    - options: [Optional] object containing any sentence configuration parameters the user desires
        + phT : Float32Array, duration (seconds) of each phoneme. Overrides sentT. This duration will be used as the time it takes to transition from phoneme-1 to this phoneme.  
        + sentT : Number, duration (seconds) of whole sentence. Overrides speed. Delay not included.  
        + speed: Number, phonemes/s of the whole string. Overrides default speed. 
        + phInt : Float32Array, intensity of each phoneme. Overrides sentInt.
        + sentInt : Number, intensity of the entire sentence. Overrides default intensity  
        + delay: Number, delay (in seconds) before starting playing this sentence. Defaults to 0.  
        + outro: Boolean, whether to insert a outro phoneme at the end of the sentence. Default to false. 
        + useCoart: Boolean, whether to use coarticulation. Defaults to true.  
        + copyArrays: Boolean, whether to create a copy of the arrays sent or directly use the references. Defaults to false (no copy).  
        + onStartEvent: Function, callback function which will be executed when the sentence starts. The sentence object is sent as argument.
        + onEndEvent: Function, callback function which will be executed after the sentence has finished.  The sentence object is sent as argument.
```

Adds a new sentence to compute during update with its own parameters. If the queue is full, the sentence will not be pushed and will return null.


---

### getBSW
```
getBSW ( ) --returns--> Reference to internal 1D array of Numbers
```
Current blendshape state of the animation. Usually, this function will be called after an update is done. 

See T2LTABLES.BlendshapeNames for information about the meaning of each entry

WARNING: values in the returned array can be modified. However this changes will remain and be returned by getBSW when:
- No update is done 
- The module is not-working / paused / idle
- The current sentence to mouth is waiting to end its delay

The next proper update will fix this. This array is used internally only for displaying purposes. It does not play any role during the mouthing whatsoever.

---

### getCompactState
```
getCompactState ( ) --returns--> Number;
```
Returns the state of this instance. If the value returned is 0, the module is busy during updates.

Bit 0: set when the module is not working ( stopped )  
Bit 1: set when the module is working but paused  
Bit 2: set when the module does not have more sentences to compute. If working, it is idle, waiting for some push.  

---

### isWorking, isPaused, needSentences
```
isWorking ( ) --returns-->  Boolean
isPaused ( ) --returns--> Boolean
needsSentences ( ) --returns--> Boolean
```
check whether the module is in working state, paused and if it needs more sentences (idle state)

---

### getNumSentences
```
getNumSentences ( ) --returns--> Number
```

### getMaxNumSentences
```
getMaxNumSentences ( ) --returns--> Number
```