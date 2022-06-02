# Montreal Forced Aligner (MFA)

## Set UP  

1. Install anaconda or miniconda if not already installed
2. Enter conda Prompt
3. Create Environment (optional) and install necessary dependencies for MFA from conda-forge
```
conda create -n Aligner -c conda-forge kaldi sox montreal-forced-aligner
```

4. Enter Environment
```
conda activate Aligner
``` 

5. Download dictionary and acoustic models from mfa repository
```
mfa models download dictionary english_us_arpa
mfa models download acoustic english_us_arpa
```  
They can also be manually downloaded from https://mfa-models.readthedocs.io/en/latest/ 

6. Install other libraries
```
pip install librosa
pip install soundfile
pip install textgrid
pip install pandas
```

7. Exit  

Summary  
```
conda create -n Aligner -c conda-forge kaldi sox montreal-forced-aligner
conda activate Aligner
mfa models download dictionary english_us_arpa
mfa models download acoustic english_us_arpa
pip install librosa
pip install soundfile
pip install textgrid
pip install pandas
```

## Usage  

1. Enter conda prompt
2. Activate Environment
```
conda activate Aligner
```
3. Go to the directory that contains the [MFA skeleton]() with all scripts associated. You can move this folder wherever you prefer.
```
cd path/to/folder/MFA
```

4. Ensure every audio have the same sampling rate and file format. Sometimes MFA will not accept different file formats or sampling rates in the same batch. This will transform every audio into .wav at 48000. It fetches .mp3, .wav and .ogg. Other file types are ignored. To allow for other audio types, modify the "acceptedFileTypes" variable.      
_python audioCorrection.py path/to/fetch path/to/store_
```
python audioCorrection.py ToAlign ToAlign
```

5. Alignment  
```
mfa align --clean ToAlign english_us_arpa english_us_arpa Aligned
```

6. Transform every .TextGrid into a simple json that can be easily loaded into javascript. It also avoids having to parse TextGrid files during application execution. This script will also make some adjustments on phoneme timings ( nothing fancy )  
_python simplifyAlignedFiles.py path/fetch/textgrids path/store/simpleAligns_
```
python simplifyAlignedFiles.py Aligned SimplifiedAligned
```


Summary
```
conda activate Aligner
python audioCorrection.py ToAlign ToAlign
mfa align --clean ToAlign english_us_arpa english_us_arpa Aligned
python simplifyAlignedFiles.py Aligned SimplifiedAligned
```

## Custom Dictionary
1. Go to
https://mfa-models.readthedocs.io/en/latest/dictionary/index.html#dictionary  
2. Select the desired dictionary (in this case english Arpabet) and download the .dict file.
3. Open the .dict in your prefered text/code editor
4. Include the word you want, taking into account that dictionaries are alphatically sorted. For example include the word _stonks_. Stress symbols can be optionally included (numbers) alongside the phoneme representations. MFA also accepts some symbols on the plaintext word such as ' and -  
IMPORTANT: every space should be a tabular space, except the spaces AFTER the first ``S`` in the phoneme transcription
```
stonks	1.0	0.0	0.0	0.0	S T AO1 NG K S
stonks	1.0	0.0	0.0	0.0	S T AO NG K S
s'ton-ks	1.0	0.0	0.0	0.0	S T AO NG K S
``` 


## Possible Causes of Alignment Problems   
 * No files given  
 * Wrong/weird words on the plain text file. MFA translates through dictionaries, if it does not appear there sometimes crash and sometimes simply ignores that word, using blank phonemes instead.
 * When weird words need to be used, expand the dictionary or try to find other real english words that are similar to them. The resulting visual appearance should not differ too much. 
 * Numbers should be translated into words. Usually does not crash but it just puts a blank phoneme over the number.
 * When plainText, avovid having things like ``Let's start``. Sometimes the model does not understand the ``'``. Also, the ``'s`` and ``start`` are usually merged when speaking but the MFA will try to search for it and sometimes fail

 ``.`` 
