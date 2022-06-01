
let TextGrid = (function(){
'use strict'
    var Context = {};
    
    let SIZES = {
        INTERVAL : 4
    };

    function leadingSpaces ( line ){ return line.search(/\S/); }
    function trimStr( text ){
        let val = text.trim();
        let initTrim = 0;
        let endTrim = val.length;
        // remove "" symbols
        if( val[0] == "\"" ){ initTrim++; }
        if( val[ val.length - 1 ] == "\"" ){ endTrim--; }
        return val.slice( initTrim, endTrim );
    }

    // startIdx must be the line "points [x]:" or "intervals [x]:" or alike
    function parseTierArrayElement ( lines, startIdx ){ 
        let obj = {};

        // leading tabs of header of element ( "points [x]:" or alike )
        let itemLeadingSpaces = leadingSpaces( lines[ startIdx ] );
        let linesUsed = 1;
        while( leadingSpaces( lines[ startIdx + linesUsed ] ) > itemLeadingSpaces ){
            let things = lines[ startIdx + linesUsed ].trim().split(" = ");
            linesUsed++;
            if ( things.length < 2){ continue; }

            let key = things[0];
            let val = things[1];
            switch( key ){
                case "xmin":
                case "xmax": 
                    obj[ key ] = parseFloat( val );
                    break;
                case "text":
                case "mark":
                    obj[ key ] = trimStr( val );
                    break;
                default:
                    obj[ key ] = val;
                    break;
            } 
        }
        return [ obj, linesUsed ];
    }


    // returns intervals array and lines used
    function parseTierArray ( lines, startIdx ){
        // intervals: size = X
        let size = parseInt( lines[ startIdx ].split(" = ")[1] );

        if ( !size || size < 0 ){ size = 0; }
        let intervals = new Array( size );
        let linesUsed = 1;
        for ( let i = 0; i < size; ++i ){
            let result = parseTierArrayElement( lines, startIdx + linesUsed );
            intervals[i] = result[0];
            linesUsed += result[1];
        }
        return [ intervals, linesUsed ];
    }


    function parseItem ( lines, startIdx ){
        let linesUsed = 1;
        let obj = {};
        let finishedItem = false;

        while( true ){
            let things = lines[ startIdx + linesUsed ].trim().split(" = ");
            let key = things[0];
            let val = things[1];

            switch( key ){
                case "xmin":
                case "xmax": 
                    obj[ key ] = parseFloat( val );
                    linesUsed++;
                    break;
                case "intervals: size":
                    {
                        let results = parseTierArray( lines, startIdx + linesUsed );
                        obj[ "intervals" ] = results[0];
                        linesUsed += results[1];
                        finishedItem = true;
                    }
                    break;
                case "points: size":
                    {
                        let results = parseTierArray( lines, startIdx + linesUsed );
                        obj[ "points" ] = results[0];
                        linesUsed += results[1];
                        finishedItem = true;
                    }
                    break;
                //case "class": already dealt by default
                default: 
                    linesUsed++;
                    if ( !val || !val.length || val.length <= 0){ break;}
                    obj[ key ] = trimStr( val );
                    break;
            } 
            // break loop when intervals have been 
            if( finishedItem ){ break; }
        }
        return [ obj, linesUsed ];
    }

    function parseItemsArray ( lines, startIdx, size ){
        let linesUsed = 1;
        let items = new Array( size );
        for ( let i = 0; i < size; ++i ){
            let results = parseItem( lines, startIdx + linesUsed );
            items[ i ] = results[ 0 ];
            linesUsed += results[1];
        }
        return [ items, linesUsed ];
    }


    Context.TGtoJSON = function( text ){
        let lines = text.split("\n");

        let obj = {};

        let itemsSize = 0;
        for ( let i = 0; i < lines.length; ++i ){
            let line = lines[i].trim();
            if ( line.length <= 0 ){ continue; }

            let key = line.split(" ")[0].trim();
            if ( typeof(key) != 'string' && key.length <= 0 ){ continue; }
            

            switch( key ){
                case "size":
                    {
                        let val = line.split(" = ")[1];
                        itemsSize = parseFloat( val );
                        break;
                    }
                case "item":
                    let results = parseItemsArray( lines, i, itemsSize );
                    obj[ "items" ] = results[0];
                    i += results[1]; 
                    break;
                case "xmin":
                case "xmax":
                    {
                        let val = line.split(" = ")[1];
                        obj[ key ] = parseFloat( val );
                    }
                    break;
                case "tiers?":
                    obj[ key ] = ( line.split(" ")[1].trim() == "<exists>" ) ? true : false;
                    break;
                default:
                    obj[ key ] = trimStr( line.split(" = ")[1] );
                    break;
            }
        }
        return obj;

    }

    // not implemented
    Context.JSONtoTG = function ( obj ){ return "NOT IMPLEMENTED";  }

    return Context;
})();