FBL.ns(function () { with (FBL) {
/*************************************************************/
Firecrow.TimerHelper =
{
    createTimer: function()
    {
        return new Firecrow.TimerHelper.Timer();
    }
};

Firecrow.TimerHelper.Timer = function()
{
    this.startTime = new Date();
};

Firecrow.TimerHelper.Timer.prototype =
{
    getElapsedTimeInSeconds: function()
    {
        if(this.startTime == null) { return -1; }

        return Math.round((new Date() - this.startTime)/1000); //take ms away
    },

    hasMoreThanSecondsElapsed: function(seconds)
    {
        return this.getElapsedTimeInSeconds() > seconds;
    }
};
}});