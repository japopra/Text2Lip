import soundfile as sf
import sys
import os
import librosa

acceptedFileTypes = [".wav", ".mp3", ".ogg" ];

def ensureFolderExists( path ):
    if ( not os.path.isdir( path ) ): # create folder for dataset if non-existent
      os.mkdir( path );

def AudiotoWAVfile ( src, dst ):
  x, sr = librosa.load( src , sr=48000, mono=True ); # Loading the audio file
  sf.write( dst, x, sr,subtype='PCM_24' );


def transform ( basePath, outputFolder, removeOriginal = False ):
    if ( outputFolder[-1] != "/" ):
        outputFolder += "/";

    if ( os.path.isfile( basePath ) ): # process file
        extension = basePath[basePath.rfind("."):];
        if ( extension in acceptedFileTypes ):
            audioFileName = os.path.basename( basePath );
            audioFileName = audioFileName[ 0: audioFileName.rfind(".")]; # get text from file name
            AudiotoWAVfile( basePath, outputFolder + audioFileName + ".wav");
            if ( removeOriginal and not extension == ".wav" ):
                os.remove( basePath );


    elif ( os.path.isdir( basePath ) ):
        if ( basePath[-1] != "/"):
            basePath += "/";
        folderName = os.path.basename( basePath );
        ensureFolderExists( outputFolder + folderName );
        
        filesInFolder = os.listdir( basePath );
        count = 0;
        for file in filesInFolder:
            transform( basePath + file, outputFolder + folderName + "/", removeOriginal );
            count += 1;
            print( folderName, " : " + str(count) +" / " + str( len(filesInFolder) ) ); 
    
    else:
        print( basePath + " is neither a file nor a directory.")
    

transform( sys.argv[1], sys.argv[2], True);