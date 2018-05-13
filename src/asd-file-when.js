'use strict'

var asdFileWhen = module.exports = function(){
    this.seconds = 0;     
    this.minute = 0;     
    this.hour = 0; 
    this.day = 0;   
    this.month = 0;     
    this.year = 0;
    this.weekDay = 0;    
    this.daysInYear = 0;  
    this.isDaylighSavings = 0;
    return this;
};

asdFileWhen.prototype = {
    getSaveDateTime: function(){
        var year = this.year;
        var hour = this.hour;
        var now = new Date();

        var getYear = function(){
            const BASE_YEAR = 1900;
            if(year < BASE_YEAR)
                year += BASE_YEAR;
            return year;
        };

        var getTimeZoneOffset = function(){
            console.log(now.getTimezoneOffset());
            return now.getTimezoneOffset();
        };

        var getHour = function(){
            return (((hour * 60) - getTimeZoneOffset()) / 60);
        };

		return new Date(getYear(), this.month, this.day, getHour(), this.minute, this.seconds, 0); 
    }
};

