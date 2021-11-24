const Emojis = {
    TIMER: 'timer:',
    PING_PONG: 'ping_pong:',
    DANGER: 'exclamation:',
    MUSIC: '🎶',
    SEARCH: '🔍',
    SUCCESS: '👍',
    SAD: 'sad:',
    PLAY: 'play:',
    PAUSE: 'pause:',
    WAVE: 'wave:',
    REPEAT: 'repate:',
    SINGLE_REPEAT: 'repate_one:',
    CHECK: '✅',
    NO: '⛔:',
    NOTEPAD: '🗒️'
};
 
const Controler = {
    LEFT: "⬅️",
    UP : "⬆️",
    DOWN: "⬇️",
    RIGHT: "➡️",
    SELECT: "🆗",
    START: "⏯️",
    A : "🇦",
    B : "🇧",
    SKIP : "🔜"
}

const Colors = {
    WHITE: 16777215,
    BLURPLE: 5793266,
    GREYPLE: 10070709,
    DARK_BUT_NOT_BLACK: 2895667,
    NOT_QUITE_BLACK: 2303786,
    GREEN: 5763719,
    YELLOW: 16705372,
    FUSCHIA: 15418782,
    RED: 15548997,
    BLACK: 2303786,
    
};


function cobRes(iBuf, width, cb) {
    const stream = require("stream");
    const PNG = require("pngjs").PNG

    b2s(iBuf)
    .pipe(new PNG({
        filterType: -1
    }))
    .on('parsed', function() {

        var nw = width;
        var nh = nw *  this.height /this.width;
        var f = resize(this, nw, nh);

        sbuff(f.pack(), b=>{
            cb(b);
        })
    })


    function resize(srcPng, width, height) {
        var rez = new PNG({
            width:width,
            height:height
        });
        for(var i = 0; i < width; i++) {
            var tx = i / width,
                ssx = Math.floor(tx * srcPng.width);
            for(var j = 0; j < height; j++) {
                var ty = j / height,
                    ssy = Math.floor(ty * srcPng.height);
                var indexO = (ssx + srcPng.width * ssy) * 4,
                    indexC = (i + width * j) * 4,
                    rgbaO = [
                        srcPng.data[indexO  ],
                        srcPng.data[indexO+1],
                        srcPng.data[indexO+2],
                        srcPng.data[indexO+3]
                    ]
                rez.data[indexC  ] = rgbaO[0];
                rez.data[indexC+1] = rgbaO[1];
                rez.data[indexC+2] = rgbaO[2];
                rez.data[indexC+3] = rgbaO[3];
            }
        }
        return rez;
    }

    function b2s(b) {
        var str = new stream.Readable();
        str.push(b);
        str.push(null);
        return str;
    }
    function sbuff(stream, cb) {
        var bufs = []
        var pk = stream;
        pk.on('data', (d)=> {
            bufs.push(d);

        })
        pk.on('end', () => {
            var buff = Buffer.concat(bufs);
            cb(buff);
        });
    }
}

module.exports =  {
    Emojis: Emojis,
    Colors: Colors,
    Controler: Controler,
    resizer : cobRes
}