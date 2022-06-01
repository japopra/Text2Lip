const GUI2DLib = {
    createGUI: function (canvasContext) {
        'use strict'

        let GUI2DINSTANCE = {};
        GUI2DINSTANCE.ctx = canvasContext;

        GUI2DINSTANCE.update = function ( dt ){
            //this.updateButtons( dt );
            this.updateSliders( dt );
        }

        GUI2DINSTANCE.render = function ( ){
            this.renderButtons( );
            this.renderSliders( );
            this.renderSpectrograms( );
        }

        GUI2DINSTANCE.mouseDown = function ( mouseDownEvent ){
            this.mouseDownButtons( mouseDownEvent );
            this.mouseDownSliders( mouseDownEvent );
        }


        // Spectrograms -------------------------------------------------------------------------------
        let SPECTROGRAMS = GUI2DINSTANCE.SPECTROGRAMS = [];

        /**
         * Renders a set of timestamps. Each timestamps is rendered vertically
         * @param {string} title 
         * @param {int} x 
         * @param {int} y 
         * @param {int} w 
         * @param {int} h 
         * @param {int} timestamps 
         * @param { 1D array } rawDataReference raw data, sequence of timestamps
         * @param {function} updateCallback 
         * @param {function } renderCallback 
         * @returns 
         */
        GUI2DINSTANCE.createSpectrogram = function (title, x, y, w, h, timestamps = 1, rawDataReference = null, updateCallback = null, renderCallback = null) {
            let spectrogram = {
                title: title,
                x: x, y: y,
                w: w, h: h,
                ts: timestamps,
                data: rawDataReference,
                updateCallback: updateCallback,
                renderCallback: renderCallback,

                clicked: false,
                isClickable: true,
                isRenderable: true,
                isUpdateable: true,

                setRawDataReference : function( _rawDataReference ){ this.data = _rawDataReference; },
            };
            SPECTROGRAMS.push(spectrogram);
            return spectrogram;
        }

        GUI2DINSTANCE.renderSpectrograms = function(){
            // renders spectrogram as one square per value in array. It would be better a shader but canvas 2d...
            for ( let item = 0; item < this.SPECTROGRAMS.length; ++item ){                
                let spectro = this.SPECTROGRAMS[ item ];
                if (spectro.renderCallback && !spectro.renderCallback()) { continue; }
                if ( !spectro.isRenderable ){ continue; }

                let sample = spectro.data;
                
                let timestamps = Math.max( 0, spectro.ts );
                let timestampSize = Math.max( 0, Math.floor( sample.length / timestamps ) );
                
                let sampleW = spectro.w;
                let sampleH = spectro.h;
              
                // when width/height per lines does not match, share remaining pixels among squares
                let remainingExtras_width = 0;
                let remainingExtras_height = 0;

                // position to render currente square of data. Amount of pixels might be variable among squares/lines
                let xxx= 0;
                let yyy= 0;

                remainingExtras_width = sampleW - ( Math.floor( sampleW / timestamps ) * timestamps );
                for ( let i = 0; i < timestamps; ++i ){
                    // reset height counters
                    yyy = 0;
                    remainingExtras_height = sampleH - ( Math.floor( sampleH / timestampSize ) * timestampSize ); // 

                    // distribute remaining pixels from width
                    let squareWidth = Math.floor( sampleW / timestamps );
                    if ( remainingExtras_width > 0 ){
                        squareWidth++;
                        remainingExtras_width--;
                    }
                  
                    for ( let j = 0; j < timestampSize; ++j ){
                        // distribute remaining pixels from height
                        let squareHeight = Math.floor( sampleH / timestampSize );
                        if ( remainingExtras_height > 0 ){
                            squareHeight++;
                            remainingExtras_height--;
                        }

                        // render square
                        let value = Math.floor( sample[ i * timestampSize + j ] * 255 );
                        gl.fillStyle = "rgba(" + value.toString() + "," + value.toString() + "," + value.toString() +",1)";
                        gl.fillRect ( spectro.x + xxx, spectro.y + yyy, squareWidth, squareHeight );
              
                        yyy += squareHeight;
                    }
                  
                  xxx += squareWidth;
              
                }

                // Title
                gl.fillStyle = "rgba(0,0,0,1)";
                let text = spectro.title;
                let textMeasure = gl.measureText(text);
                gl.fillText(text, spectro.x + spectro.w * 0.5 - textMeasure.width * 0.5, spectro.y - textMeasure.height);
                

            }// end of render of 1 spectro
        }

        
        // Sliders ---------------------------------------------------------------------------------------
        let SLIDERS = GUI2DINSTANCE.SLIDERS = [];

        /**
         * creates a slider 
         * @param {string} title 
         * @param {int} x 
         * @param {int} y 
         * @param {int} w 
         * @param {int} h 
         * @param {Float32Array(2)} v initial values the slider should hold. Values are copied into a slider owned array
         * @param {1 or 2} dim  dimensions of the slider. 1 will render a 1D slider. 2 will render a 2D slider (like a heatmap). Other ignored 
         * @param {function} updateCallback  (optional) Receives NewValue and OldValue of slider. Only called when a mouseDown activated it
         * @param {function} renderCallback  (optional) Must return false to not render. Otherwise it always renders  
         * @returns slider obj
         */
        GUI2DINSTANCE.createSlider = function (title, x, y, w, h, v = null, dim = 1, updateCallback = null, renderCallback = null, xLabel = "", yLabel = "") {
            let value = new Float32Array(2);
            let prevValue = new Float32Array(2);

            value.fill(0); prevValue.fill(0);
            if (v) { value.set(v); prevValue.set(v); }

            let slider = {
                title: title,
                xLabel: xLabel,
                yLabel: yLabel,
                x: x, y: y,
                w: w, h: h,
                v: value,
                prevV: prevValue,
                dim: Math.max( 1, Math.min( 2, Math.floor(dim) ) ),
                updateCallback: updateCallback,
                renderCallback: renderCallback,

                clicked: false,
                isClickable: true,
                isRenderable: true,
                isUpdateable: true,
            };
            SLIDERS.push(slider);
            return slider;
        }

        /**
         * simplified version of createSlider for 1D only. 
         * @param {Number} v
         * @returns 
         */
        GUI2DINSTANCE.createSlider1D = function (title, x, y, w, h, v = 0, updateCallback = null, renderCallback = null) {
            if ( typeof( v ) !== 'number'){ v = 0; }
            return this.createSlider( title, x, y, w, h, [v,0], 1, updateCallback, renderCallback );
        }

        /**
         * simplified version of createSlider for 2D only. 
         * @param {Array} v 
         * @returns 
         */
        GUI2DINSTANCE.createSlider2D = function (title, xLabel, yLabel, x, y, w, h, v = null, updateCallback = null, renderCallback = null) {
            return this.createSlider( title, x, y, w, h, v, 2, updateCallback, renderCallback, xLabel, yLabel );
        }

        /**
         * updates values of all sliders. Also deactivates sliders if mouse is no longer clicked
         * @param {float} dt not used  
         */
        GUI2DINSTANCE.updateSliders = function ( dt = 0 ) {
            let gl = this.ctx;
            let width = gl.viewport_data[2];
            let height = gl.viewport_data[3];
            let mouse = { x: gl.mouse.canvasx, y: height - gl.mouse.canvasy };

            for (let i = 0; i < SLIDERS.length; ++i) {
                let slider = SLIDERS[i]; // reference, not a copy
                if (!slider.clicked) { continue; }
                if (slider.clicked && !gl.mouse.left_button) { slider.clicked = false; continue; }
                if ( !slider.isUpdateable ){ continue;}

                // swap pointers
                let newV = slider.prevV;
                let oldV = slider.v;
                newV[0] = Math.max( 0, Math.min( 1, (mouse.x - slider.x) / slider.w ) );
                newV[1] = Math.max( 0, Math.min( 1, (mouse.y - slider.y) / slider.h ) );

                slider.prevV = oldV;
                slider.v = newV;

                if (slider.updateCallback) { slider.updateCallback(newV, oldV); }
            }
        }

        /**
         * call this function in the onMouseDown event listener or others. Will check for new slider clicks
         * @param {onMouseDown event} e 
         */
        GUI2DINSTANCE.mouseDownSliders = function (e) {
            let gl = this.ctx;
            let x = e.canvasx;
            let y = gl.viewport_data[3] - 1 - e.canvasy; // mouse y is inverted

            for (let i = 0; i < SLIDERS.length; ++i) {
                let slider = SLIDERS[i];
                if ( !slider.isClickable ){ continue; }

                if (x >= slider.x && x <= (slider.x + slider.w) && y >= slider.y && y <= (slider.y + slider.h)) {
                    slider.clicked = true;
                }
                else {
                    slider.clicked = false; // just in case of rapid move and click
                }
            }
        }

        /**
         * Renders sliders
         */
        GUI2DINSTANCE.renderSliders = function () {
            let gl = this.ctx;
            let rect = { x: 0, y: 0, w: 200, h: 30 };
            let arc = { x: 0, y: 0, r: 50 };

            for (let i = 0; i < SLIDERS.length; ++i) {
                let slider = SLIDERS[i];
                if (slider.renderCallback && !slider.renderCallback()) { continue; }
                if ( !slider.isRenderable ){ continue; }

                if (slider.dim == 1) { // 1D slider
                    rect.w = slider.w * 0.07;
                    rect.h = slider.h;
                    rect.x = slider.x + slider.v[0] * slider.w - rect.w * 0.5;
                    rect.y = slider.y;
                    // line at half height
                    gl.strokeStyle = "rgba(255,0,0,1)";
                    gl.beginPath();
                    gl.moveTo(slider.x, slider.y + slider.h * 0.5);
                    gl.lineTo(slider.x + slider.w, slider.y + slider.h * 0.5);
                    gl.stroke();

                    // rect that moves
                    gl.fillStyle = "rgba(0,0,0,1)";
                    gl.fillRect(rect.x, rect.y, rect.w, rect.h);

                    // value text
                    gl.fillStyle = "rgba(0,0,0,1)";
                    gl.fillText(slider.v[0].toFixed(3), slider.x + slider.w + 10, slider.y + slider.h * 0.5);

                    // label
                    gl.fillStyle = "rgba(0,0,0,1)";
                    gl.fillText(slider.title, slider.x - 125, slider.y + 25);
                }
                else { // 2D Heatmap
                    // background
                    gl.fillStyle = "rgba(125,125,125,1)";
                    gl.strokeStyle = "rgba(0,0,0,1)";
                    gl.fillRect(slider.x, slider.y, slider.w, slider.h);

                    gl.strokeStyle = "rgba(0,0,0,1)";
                    gl.lineWidth = 2;
                    gl.strokeRect(slider.x, slider.y, slider.w, slider.h);

                    //axis lines
                    gl.strokeStyle = "rgba(0,0,0,1)";
                    gl.beginPath();
                    gl.moveTo(slider.x, slider.y + slider.h * 0.5);
                    gl.lineTo(slider.x + slider.w, slider.y + slider.h * 0.5);
                    gl.stroke();
                    gl.strokeStyle = "rgba(0,0,0,1)";
                    gl.beginPath();
                    gl.moveTo(slider.x + slider.w * 0.5, slider.y);
                    gl.lineTo(slider.x + slider.w * 0.5, slider.y + slider.h);
                    gl.stroke();

                    // point that moves
                    arc.x = slider.v[0] * slider.w + slider.x;
                    arc.y = slider.v[1] * slider.h + slider.y;
                    arc.r = 10;
                    gl.beginPath();
                    gl.strokeStyle = "rgba(0,0,0,1)";
                    gl.lineWidth = 2;
                    gl.fillStyle = "rgba(125,25,25,1)";
                    gl.arc(arc.x, arc.y, arc.r, 0, 2 * Math.PI);
                    gl.fill();
                    gl.stroke();

                    // value text
                    gl.fillStyle = "rgba(0,0,0,1)";
                    gl.fillText(slider.v[0].toFixed(3) + " " + slider.v[1].toFixed(3), slider.x, slider.y - 2);

                    // Title
                    gl.fillStyle = "rgba(0,0,0,1)";
                    let text = slider.title;
                    let textMeasure = gl.measureText(text);
                    gl.fillText(text, slider.x + slider.w * 0.5 - textMeasure.width * 0.5, slider.y - textMeasure.height);

                    // xLabel
                    gl.fillStyle = "rgba(0,0,0,1)";
                    text = slider.xLabel;
                    textMeasure = gl.measureText(text);
                    gl.fillText(text, slider.x + slider.w * 0.5 - textMeasure.width * 0.5, slider.y + slider.h + textMeasure.height);

                    // yLabel
                    gl.rotate( -Math.PI / 2.0 );
                    gl.fillStyle = "rgba(0,0,0,1)";
                    text = slider.yLabel;
                    textMeasure = gl.measureText(text);
                    gl.fillText(text, -slider.y - slider.h * 0.5 - textMeasure.width * 0.5, slider.x - textMeasure.height);
                    gl.rotate( Math.PI / 2.0 );

                }
            }

        }



        // Buttons ---------------------------------------------------------------------------------------
        
        let BUTTONS = GUI2DINSTANCE.BUTTONS = [];

        /**
         * 
         * @param {string} title 
         * @param {function} onClickCallback  when clicked, this callback will be called 
         * @param {HTML color} color background color of button 
         * @param {function} renderCallback  (optional) Must return false to not render. Otherwise it always renders  
         * @returns 
         */
        GUI2DINSTANCE.createButton = function (title, onClickCallback, color = null, renderCallback = null ) {
            let button = { 
                title: title,
                onClickCallback: onClickCallback, 
                color: color,
                renderCallback: renderCallback,
                isClickable: true,
                isRenderable: true,
            };
            BUTTONS.push(button);
            return button;
        }

        /**
         * call this in the onMouseDown event listener or others. Will check for new clicks
         * @param {onMouseDown event} e 
         */
        GUI2DINSTANCE.mouseDownButtons = function (e) {
            let gl = this.ctx;

            let x = e.canvasx;
            let y = e.canvasy;

            let width = gl.viewport_data[2];
            let height = gl.viewport_data[3];

            let rect = { x: 0, y: 0, w: 200, h: 30 };
            let offsetRect = 0;

            let buttonsAmount = BUTTONS.length;
            // Samples
            for (let i = 0; i < buttonsAmount; i++) {
                if ( !BUTTONS[i].isClickable ){ continue; }

                rect.x = i * (rect.w + 10);
                let mod = Math.floor((rect.x + rect.w) / width);
                // Offset in new line
                if (rect.x - width * mod < 0) offsetRect = width * mod - rect.x;
                rect.x -= width * mod - offsetRect;
                rect.y = mod * (rect.h + 10);

                if (x < rect.x + rect.w && x > rect.x &&
                    height - y < rect.y + rect.h && height - y > rect.y) {
                    BUTTONS[i].onClickCallback();
                }
            }

        }

        /**
         * Renders buttons
         */
        GUI2DINSTANCE.renderButtons = function () {
            let gl = this.ctx;

            let width = gl.viewport_data[2];
            let height = gl.viewport_data[3];


            let rect = { x: 0, y: 0, w: 200, h: 30 };
            let offsetRect = 0;
            // Samples
            let buttonsAmount = BUTTONS.length;

            for (let i = 0; i < buttonsAmount; i++) {
                let button = BUTTONS[i];
                if (button.renderCallback && !button.renderCallback()) { continue; }
                if ( !button.isRenderable ){ continue; }

                rect.x = i * (rect.w + 10);
                let mod = Math.floor((rect.x + rect.w) / width);
                // Offset in new line
                if (rect.x - width * mod < 0) offsetRect = width * mod - rect.x;
                rect.x -= width * mod - offsetRect;
                rect.y = mod * (rect.h + 10);
                gl.fillStyle = BUTTONS[i].color ? BUTTONS[i].color : "rgba(255,255,255,0.6)";
                gl.fillRect(rect.x, rect.y, rect.w, rect.h);
                gl.fillStyle = "rgba(0,0,0,0.9)";
                gl.fillText(button.title.substring(0, 30), rect.x + 6, rect.y + 2 * rect.h / 3);
            }

        }

        return GUI2DINSTANCE;
    }
    // end of create gui 2d function


}
// end of lib