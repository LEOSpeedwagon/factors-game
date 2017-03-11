function SliderInput(element, min, max, xPad, yMin, yMax, callback) {
    this.element = typeof element !== 'undefined' ? element : document;
    this.min = min;
    this.max = max;
    this.maxWidth = element.width || element.offsetWidth || element.clientWidth || window.innerWidth;
    this.xPad = xPad;
    this.yMin = yMin;
    this.yMax = yMax;
    this.callback = callback;
    this.value = min;
    this.listeners = {
        touchStart: this.startTouch.bind(this),
        touchMove: this.determineValue.bind(this),
        touchEnd: this.endTouch.bind(this),
        keyDown: this.setValue.bind(this)
    };
}

SliderInput.prototype.listen = function() {
    this.element.addEventListener('touchstart', this.listeners.touchStart);
    this.element.addEventListener('touchmove', this.listeners.touchMove);
    this.element.addEventListener('touchend', this.listeners.touchEnd);
    document.addEventListener('keydown', this.listeners.keyDown);
};

SliderInput.prototype.startTouch = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.xStart = event.touches[0].clientX;
    this.yStart = event.touches[0].clientY;
};

SliderInput.prototype.determineValue = function(event) {
    event.preventDefault();
    event.stopPropagation();
    if( this.xStart === null || this.yStart < this.yMin || this.yStart > this.yMax ) {
        return;
    }
    var xEnd = event.touches[0].clientX;
    var yEnd = event.touches[0].clientY;
    if(Math.abs(this.yStart - yEnd) > Math.abs(this.xStart - xEnd) - 8 && (yEnd - this.yStart > 0)) {
        if( yEnd - this.yStart > 20 ) {
            this.onSelect(this.value);
        }
        return;
    }
    if(this.dispatchBeforeTouchValueChange(this.value, xEnd, yEnd)) {
        return;
    }
    var value = Math.max(this.min, Math.min(Math.round((((xEnd - this.xPad) * (this.max - this.min)) / (this.maxWidth - this.xPad * 2)) + this.min), this.max));
    this.value = value;
    if(typeof this.callback === 'function') {
        var x = Math.max(this.xPad, Math.min(xEnd, this.maxWidth - this.xPad));
        var y = event.touches[0].clientY;
        this.lastX = x;
        this.lastY = y;
        this.callback(value, x, y, false);
    }
};

SliderInput.prototype.endTouch = function(event) {
    this.xStart = null;
    this.yStart = null;
    this.callback(this.value, this.lastX, this.lastY, true);
}

SliderInput.prototype.dispatchBeforeTouchValueChange = function(value, xEnd, yEnd) {
    if(!(typeof this.beforeTouchValueChange === 'function')) {
        return;
    }
    return this.beforeTouchValueChange({currentValue: value, xStart: this.xStart, yStart: this.yStart, xEnd: xEnd, yEnd: yEnd });
}

SliderInput.prototype.onSelect = function(value) {};

SliderInput.prototype.setValue = function(event) {
    var keyCode = event.keyCode;
    //For number input - tries to append digit if within range
    if(keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105) {
       var zeroCode = keyCode <= 57 ? 48 : 96;
       var number = keyCode - zeroCode;
       var value = this.value.toString();
       value += number.toString();
       this.value = value > this.max ? Math.min(number, this.max) : parseInt(value);
    //Backspace input - let's do it mathematically
    } else if(keyCode === 8) {
        event.preventDefault();
       this.value = Math.floor(this.value / 10);
    //Left and right arrow keys - treat it like a number line
    } else {
        switch(event.keyCode) {
            //Left
            case 37 :
            case 65 :
            case 72 :
                if(this.value > this.min) {
                    this.value -= 1;
                }
                break;
            //Right
            case 39 :
            case 68 :
            case 76 :
                if(this.value < this.max) {
                    this.value += 1;
                }
                break;
            //Down or enter
            case 40 :
            case 74 :
            case 83 :
            case 13 :
              this.onSelect(this.value);
              return;
        }
    }
    var x = Math.max(this.value, this.min) * ((this.maxWidth - this.xPad * 2) / this.max) + this.xPad;
    this.callback(this.value, x, null, true);
};

SliderInput.prototype.triggerInitial = function(value) {
    var x = Math.max(value, this.min) * ((this.maxWidth - this.xPad * 2) / this.max) + this.xPad;
    this.lastX = x;
    this.value = value;
    this.callback(value, x, null, true);
};

SliderInput.prototype.detach = function() {
    this.element.removeEventListener('touchstart', this.listeners.touchStart);
    this.element.removeEventListener('touchmove', this.listeners.touchMove);
    this.element.removeEventListener('touchend', this.listeners.touchEnd);
    document.removeEventListener('keydown', this.listeners.keyDown);
};
/*
sliderInputController.beforeTouchValueChange(function(event) {
    var deltaX = event.xEnd - event.xStart;
    var deltaY = event.yEnd - event.yStart;

    var isDownSwipe = Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 50;

    if(isDownSwipe) {
        alert("It's a down swipe! Value: " + event.currentValue);
        return true;
    }
});
sliderInputController.listen();
*/
