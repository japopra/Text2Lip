# Text2Lip
Simple JavaScript module to procedurally generate mouth blendshape weights from text (phonemes)

[Text2Lip doc](Text2LipDoc.md)


# Pipeline

1. Get an audio
2. Transcript what the speaker is saying into plain text
3. Use a Forced Aligner to get the phone transcription synchronised with the audio
4. Parse this file into an input that Text2Lip understands
5. Use the Text2Lip in your application with such input with the audio overlayed to have a mouthing for your avatar.

# Forced Aligners
Several offline and online options are available.  

## (Online) Darla: 
http://darla.dartmouth.edu/uploadtxt  
Given a .wav/.mp3 and a .txt it returns a .TextGrid file.  
Although not complete, a parser is given in [textGridParser](utils/textGridParser.js)

## (Offline) Montreal Forced Aligner:
https://montreal-forced-aligner.readthedocs.io/en/latest/  
(pretrained models) https://mfa-models.readthedocs.io/en/latest/  
Coded in python, this tool makes it easy to align several files at once.  
Since it uses dictionaries to recognise words, it is easy to include new (rare) terms such as names.  
A quick setup and usage explanation is given in [MFA](utils/MFA/)