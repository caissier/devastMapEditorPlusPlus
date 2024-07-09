
MYUI_WINDOWINFO_MOUSETIME = 400
MYUI_LETTER_SIZE = 20
MYUI_FONT = "'Footlight MT Light'"

isInRect = (x, y, rect) => {
    if (x === undefined || y === undefined
            || rect.ax === undefined || rect.ay === undefined
            || rect.bx === undefined || rect.by === undefined)
        return (false)

    if (x > rect.ax && x < rect.ax + rect.bx
            && y > rect.ay && y < rect.ay + rect.by)
        return (true)
    return (false)
}

class MyUI { 
    constructor(uiManager, canvas, x, y, lenx, scale, background, stroke, marge) {
        this.uiManager = uiManager
        this.x = x
        this.y = y
        this.canvas = canvas
        this.marge = marge >= 0 ? marge : 5
        this.lenx = lenx + 2 * this.marge
        this.leny = this.marge
        this.elmList = []
        this.scale = scale
        this.background = background ? background : undefined
        this.stroke = stroke ? stroke : undefined
        this.buttonList = []

        this.InfoWindowPos = false
    }


    addTextZone = (txt, letter_size, letter_per_line, text_color, text_font) => {
        this.canvas.ctx.font = "" + letter_size + "px " + text_font
        var txts = []
        while (txt.length > 0) {
            var cutlen = 0
            while (txt[cutlen] == '\n')
                cutlen++
            while (txt[cutlen] != '\n' && cutlen < txt.length && cutlen < letter_per_line)
                cutlen++;
            if (cutlen == letter_per_line)
                while (txt[cutlen] != ' ' && cutlen > 0)
                    cutlen--
            cutlen = cutlen > 0 ? cutlen : letter_per_line
            var line = "" + txt.substring(0, cutlen)
            while (txt[cutlen + 1] == '\n')
                cutlen++
            txt = txt.substring(cutlen)
            txts.push(line)
            var txt_size = this.canvas.ctx.measureText(line)
            if (this.lenx < txt_size.width + 2 * this.marge)
                this.lenx = txt_size.width + 2 * this.marge
            this.leny += (letter_size + this.marge) 
        }
        this.elmList.push({
            type : "text",
            txts : txts,
            letter_size : Math.floor(letter_size),
            txt_color : text_color,
            text_font : text_font
        })
    }

    addGauge = (txt, fullness, lenx, leny, letter_size, colorFill, colorStroke, colorText, text_font) => {
        text_font = text_font ? text_font : "Arial"
        this.canvas.ctx.font = "" + letter_size + "px " + text_font
        var txt_size = this.canvas.ctx.measureText(txt)
        if (txt_size > lenx + 2 * this.marge)
            lenx = txt_size + 2 * this.marge
        if (this.lenx < lenx + 2 * this.marge)
            this.lenx = lenx + 2 * this.marge
        if (leny < letter_size + 2 * this.marge)
            leny = letter_size + 2 * this.marge
        this.elmList.push({
            type : "gauge",
            txt : txt,
            fullness : fullness,
            lenx : lenx,
            leny : leny,
            letter_size : letter_size,
            colorFill : colorFill,
            colorStroke : colorStroke,
            colorText : colorText,
            text_font : text_font,
        })
        this.leny += leny + 2 * this.marge
    }

    addButton = (txt, letter_size, text_color, fillColor, strokeColor, callback, callback_data, text_font, key_event, windowInfo, mouseLight) => {
        this.canvas.ctx.font = "" + letter_size + "px " + text_font
        txt = key_event ? key_event + " - " + txt : txt
        var txt_size = this.canvas.ctx.measureText(txt)
        if (txt_size.width + 4 * this.marge > this.lenx)
            this.lenx = txt_size.width + 4 * this.marge
        this.elmList.push({
            type : "button",
            txt_size : txt_size,
            letter_size : letter_size,
            text_color : text_color,
            fillColor : fillColor,
            strokeColor : strokeColor,
            callback : callback,
            callback_data : callback_data,
            text_font : text_font,
            key_event : key_event,
            txt : txt,
            windowInfo : windowInfo,
            mouseLight : mouseLight
        })
        this.leny += Math.floor(3 * this.marge + letter_size)
    }

    addHorizontalElem = (list) => {
        // list  all the elemnt on the verctial
        var elmUI = {
            type : "horizontal",
            list : []
        }
        var max_len_y = 0;
        var len_x = this.marge
        for (var z in list) {
            var e = list[z]
            var elmHoriz = undefined
            switch (e.type) {
                case undefined :
                    continue
                case "txt" :
                    if (!e.txt)
                        continue
                    var txt = e.txt
                    var txts = []
                    var txt_leny = 0
                    var txt_lenx = 0
                    var letter_per_line = e.letter_per_line ? e.letter_per_line : 9999
                    this.canvas.ctx.font = "" + e.letter_size + "px" + e.txt_font
                    while (txt.length > 0) {
                        var cutlen = 0
                        while (txt[cutlen] == '\n')
                            cutlen++
                        while (txt[cutlen] != '\n' && cutlen < txt.length && cutlen < letter_per_line)
                            cutlen++;
                        if (cutlen == letter_per_line)
                            while (txt[cutlen] != ' ' && cutlen > 0)
                                cutlen--
                        cutlen = cutlen > 0 ? cutlen : letter_per_line
                        var line = "" + txt.substring(0, cutlen)
                        while (txt[cutlen + 1] == '\n')
                            cutlen++
                        txt = txt.substring(cutlen)
                        txts.push(line)
                        var txt_size = this.canvas.ctx.measureText(line)
                        if (txt_lenx < txt_size.width + 2 * this.marge)
                            txt_lenx = txt_size.width + 2 * this.marge
                        txt_leny += (e.letter_size + this.marge) 
                    }
                    max_len_y = txt_leny > max_len_y ? txt_leny : max_len_y  
                    elmHoriz = {
                        type : "txt",
                        txts : txts,
                        txt_color : e.txt_color ? e.txt_color : "#000000",
                        max_letters : e.max_letter ? e.max_letter : 9999,
                        letter_size : e.letter_size ? e.letter_size : 20,
                        txt_font : e.txt_font ? e.txt_font : "Arial",
                        txt_size : txt_lenx,
                    }
                    
                    len_x += txt_lenx
                    //
                    //var txt_size = this.canvas.ctx.measureText(elmHoriz.txt).width
                    //elmHoriz.txt_size = txt_size
                    //max_len_y = elmHoriz.letter_size > max_len_y ? elmHoriz.letter_size : max_len_y
                    //len_x += elmHoriz.txt_size + this.marge
                    break
            
                case "img" :
                    if (!e.img)
                        continue
                    elmHoriz = {
                        type : "img",
                        img : e.img,
                        len_x : e.len_x ? e.len_x : 50,
                        len_y : e.len_y ? e.len_y : 50
                    }
                    max_len_y = elmHoriz.len_y > max_len_y ? elmHoriz.len_y : max_len_y
                    len_x += elmHoriz.len_x + this.marge
                    break
                case "button" :
                    if (!e.callback || !e.txt)
                        continue
                    var letter_size = e.letter_size ? e.letter_size : 20
                    var txt_font = e.txt_font? e.txt_font : "Arial"
                    this.canvas.ctx.font = "" + letter_size + "px " + txt_font
                    var txt = e.key_event ? e.key_event + " - " + e.txt : e.txt
                    var txt_size = this.canvas.ctx.measureText(txt)
                    elmHoriz = {
                        type : "button",
                        txt_size : txt_size.width,
                        letter_size : letter_size,
                        txt_color : e.txt_color ? e.txt_color : '#000000',
                        fillColor : e.fillColor ? e.fillColor : "#ffffff",
                        strokeColor : e.strokeColor ? e.strokeColor : '#000000',
                        callback : e.callback,
                        callback_data : e.callback_data,
                        txt_font : txt_font,
                        key_event : e.key_event,
                        txt : txt,
                        windowInfo: e.windowInfo,
                        mouseLight : e.mouseLight
                    }
                    max_len_y = elmHoriz.letter_size + 2 * this.marge > max_len_y ? elmHoriz.letter_size + 2 * this.marge : max_len_y
                    len_x += txt_size.width + this.marge * 3
                    break
            }
            elmUI.list.push(elmHoriz)
        }
        if (this.lenx < len_x)
            this.lenx = len_x
        elmUI.len_y = max_len_y
        this.elmList.push(elmUI)
        this.leny += Math.floor(this.marge + max_len_y)
    }

    addImage = (img, lenx, leny) => {
        this.elmList.push({
            type : "img",
            img : img,
            lenx : lenx,
            leny : leny
        })
        if (this.lenx < lenx + 2 * this.marge)
            this.lenx = lenx + 2 * this.marge
        this.leny += Math.floor(this.marge + lenx)
    }

    drawUI = () => {
        if (this.background) {
            this.canvas.ctx.fillStyle = this.background
            this.canvas.drawFillRect(this.x, this.y, this.x + this.lenx, this.y + this.leny)
        }
        if (this.stroke) {
            this.canvas.ctx.strokeStyle = this.stroke
            this.canvas.drawRect(this.x, this.y, this.x + this.lenx, this.y + this.leny)
        }
        var py = this.y + this.marge
        for (var z in this.elmList) {
            var zone = this.elmList[z]
            switch (zone.type) {
                case "text": 
                    for (var i in zone.txts) {
                        this.canvas.drawTextTopLeft(zone.txts[i], this.x + this.marge, py, this.lenx - 2 * this.marge, zone.letter_size, zone.txt_color, zone.text_font)
                        py += zone.letter_size + this.marge
                    }
                    break
                case "button":
                    this.canvas.ctx.font = "" + zone.letter_size + "px " + zone.text_font
                    //this.canvas.ctx.textAlign = 'center';
                    //this.canvas.ctx.textBaseline = "middle"
                    var center_x = Math.floor(this.x + zone.txt_size.width / 2 + 2 * this.marge)
                    var center_y = Math.floor(py + zone.letter_size / 2 + 1 * this.marge)
                    var bRect = {
                        ax : Math.floor(center_x - zone.txt_size.width / 2 - this.marge),
                        ay : Math.floor(center_y - zone.letter_size / 2 - this.marge),
                        bx : Math.floor(zone.txt_size.width + 2 * this.marge),
                        by : Math.floor(zone.letter_size + 2 * this.marge),
                    }
                    
                    this.canvas.ctx.fillStyle = zone.fillColor
                    if (zone.mouseLight && this.uiManager.controler.mousePos && this.uiManager.controler.mousePos.x !== undefined && isInRect(this.uiManager.controler.mousePos.x, this.uiManager.controler.mousePos.y, bRect))
                        this.canvas.ctx.fillStyle = zone.fillColor.substring(0, 7) + zone.mouseLight
                    this.canvas.drawFillRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                    this.canvas.ctx.strokeStyle = zone.strokeColor
                    this.canvas.drawRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                    this.canvas.drawTextTopLeft(zone.txt, bRect.ax + this.marge, bRect.ay + this.marge, 9999, zone.letter_size, zone.text_color, zone.text_font)
                    this.buttonList.push({
                        rect : bRect,
                        callback : zone.callback,
                        callback_data : zone.callback_data,
                        key_event : zone.key_event,
                        windowInfo : zone.windowInfo
                    })
                    py += zone.letter_size + this.marge * 3
                    break;
                case ("img"):
                    this.canvas.ctx.drawImage(zone.img.img, this.x + this.marge, py + this.marge, zone.lenx, zone.leny)
                    py += zone.leny + this.marge
                    break
                case ("gauge"):
                    this.canvas.ctx.fillStyle = zone.colorFill
                    this.canvas.drawFillRect(this.x + this.marge, py + this.marge, zone.lenx, zone.leny)
                    this.canvas.ctx.fillStyle = zone.colorStroke
                    if (zone.fullness > 0)
                        this.canvas.drawFillRect(this.x + this.marge * 2, py + this.marge * 2, Math.floor(zone.lenx * zone.fullness - this.marge), zone.leny - this.marge * 2)
                    this.canvas.drawTextCenter(zone.txt, this.x + this.marge + zone.lenx / 2, py + this.marge + zone.leny / 2, zone.lenx, zone.letter_size, zone.colorText, zone.text_font)
                    py += zone.leny + 2 * this.marge
                    break
                case ("horizontal"):
                    var horizX = this.marge
                    for (var e in zone.list) {
                        var elmH = zone.list[e]
                        switch (elmH.type) {
                            case "txt": 
                                var ppy = py
                                for (var z in elmH.txts) {
                                    this.canvas.drawTextTopLeft(elmH.txts[z], this.x + horizX, ppy, elmH.txt_size, elmH.letter_size, elmH.txt_color, elmH.txt_font)
                                    ppy += elmH.letter_size + this.marge
                                }
                                horizX += this.marge + elmH.txt_size
                                break
                            case "button":
                                this.canvas.ctx.font = "" + elmH.letter_size + "px" + elmH.txt_font
                                var center_x = Math.floor(this.x + horizX + elmH.txt_size / 2 + this.marge / 2)
                                var center_y = Math.floor(py + elmH.letter_size / 2 + this.marge / 2)
                                var bRect = {
                                    ax : Math.floor(center_x - elmH.txt_size / 2 - this.marge),
                                    ay : Math.floor(center_y - elmH.letter_size / 2 - this.marge),
                                    bx : Math.floor(elmH.txt_size + this.marge * 2),
                                    by : Math.floor(elmH.letter_size + this.marge * 2),
                                }
                                this.canvas.ctx.fillStyle = elmH.fillColor
                                if (elmH.mouseLight && this.uiManager.controler.mousePos && this.uiManager.controler.mousePos.x !== undefined && isInRect(this.uiManager.controler.mousePos.x, this.uiManager.controler.mousePos.y, bRect))
                                    this.canvas.ctx.fillStyle = elmH.fillColor.substring(0, 7) + elmH.mouseLight
                                this.canvas.drawFillRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                                this.canvas.ctx.strokeStyle = elmH.strokeColor
                                this.canvas.drawRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                                this.canvas.drawTextTopLeft(elmH.txt, bRect.ax + this.marge, bRect.ay + this.marge, 9999, elmH.letter_size, elmH.txt_color, elmH.txt_font)
                                this.buttonList.push({
                                    rect : bRect,
                                    callback : elmH.callback,
                                    callback_data : elmH.callback_data,
                                    key_event : elmH.key_event,
                                    windowInfo : elmH.windowInfo,
                                    mouseLight : true
                                })
                                horizX += this.marge * 3 + elmH.txt_size
                                break;
                            case ("img"):
                                this.canvas.ctx.drawImage(elmH.img, this.x + horizX, py, elmH.len_x, elmH.len_y)
                                horizX += elmH.len_y + this.marge
                                break
                        } 
                    }
                    py += zone.len_y + this.marge
                    break
            }
        }
        this.CheckInfoWindow()
    }
    click_buton_check = (x, y) => {
        for (var z in this.buttonList) {
            var buto = this.buttonList[z]
            if (isInRect(x, y, buto.rect)) {
                buto.callback(buto.callback_data)
                return (true)
            }
        }
        return (false)
    }

    mouse_move_check = (x, y) => {
        for (var z in this.buttonList) {
            var buto = this.buttonList[z]
            if (buto.mouseLight && isInRect(x, y, buto.rect)) {
                this.needRedraw = true
                return (true)
            }
        }
        return (false)
    }

    CheckInfoWindow = (redraw) => {
        if (!this.uiManager.controler)
            return false
        var mpos = this.uiManager.controler.mousePos
        if (!mpos)
            return
        if (new Date().getTime() - mpos.lastTime < MYUI_WINDOWINFO_MOUSETIME) {
            if (this.InfoWindowPos) {
                this.InfoWindowPos = false
                this.needRedraw = true;
            }
            return false
        }
        if (!this.InfoWindowPos)
            this.InfoWindowPos = {
                x : mpos.x,
                y : mpos.y
            }
        else if (!redraw && mpos.x == this.InfoWindowPos.x && mpos.y == this.InfoWindowPos.y)
            return false

        for (var z in this.buttonList) {
            var b = this.buttonList[z]
            if (b.windowInfo && isInRect(mpos.x, mpos.y, b.rect)) {
                var wUI = new MyUI(this.canvas, mpos.x, mpos.y, 50, 1, this.background, this.stroke, 1)
                wUI.addTextZone("  Info  ", MYUI_LETTER_SIZE, 9999, '#000000', MYUI_FONT)
                for (var i in b.windowInfo) {
                    var e = b.windowInfo[i]
                    if (e.callback)
                        wUI.addTextZone(e.callback(e.input), MYUI_LETTER_SIZE, 9999, '#000000', MYUI_FONT)
                }
                wUI.drawUI()
                return true
            }
        }
        return false
    }

}

class UIManager { 
    constructor (controlerManager) {
        this.controler = controlerManager
        this.UI_list = []
    }

    createUI = (canvas, x, y, lenx, scale, background, stroke, marge) => {
        var UI = new MyUI(this, canvas, x, y, lenx, scale, background, stroke, marge)
        this.UI_list.push(UI)
        return UI
    }

    CheckInput = (event) => {
        var key = event.key
        for (var z in this.UI_list) {
            var UI = this.UI_list[z]
            for (var b in UI.buttonList) {
                var buto = UI.buttonList[b]
                if (buto.key_event && buto.key_event == key) {
                    buto.callback(buto.callback_data)
                    return (true)
                }
                if (event.type == "click")
                    ;
                if (event.type == "click" && isInRect(event.x, event.y, buto.rect)) {
                    buto.callback(buto.callback_data)
                    return (true)
                }
            }
        }
        return (false)
    }

    Mouse_Input = (x, y) => {
        for (var z in this.UI_list) {
            var UI = this.UI_list[z]
            var check = UI.click_buton_check(x, y)
            if (check)
                return (true)
        }
        return (false)
    }
}
class SoundManager {
    constructor() {
        this.sounds = []
        this.src = "./music/"
    }

    LoadSound = (name) => {
        if (this.sounds[name] && this.sounds[name].readyState)
            return
        var sound = new Audio(this.src + name + ".mp3")
        this.sounds[name] = sound
    }

    playSound = (name, loop, Norestart) => {
        if (!this.sounds[name])
            this.LoadSound(name)
        if (!Norestart && !this.sounds[name].paused)
            this.sounds[name].currentTime = 0;
        if (loop)
            this.sounds[name].loop = true
        this.sounds[name].play()
    }

    stopSound = (name) => {
        if (this.sounds[name]) {
            this.sounds[name].pause()
            this.sounds[name].currentTime = 0;
        }
    }
}
const TIME_REFRESH_SCREEN_DEFAULT = 20

class OffScreen{          
    constructor(name, layer, width, height, drawFunction) {
        this.name = name
        this.layer = layer          //#canvas with layer closer to 0 are display on the top of the screen
        this.canvas = document.createElement("canvas")
        this.canvas.width = width
        this.canvas.height = height
        this.ctx = this.canvas.getContext("2d");
        this.drawFunction = drawFunction
        this.needRedraw = 1
    }

    drawToMainCanvas = () => {
        this.needRedraw = 0 
        if (this.drawFunction) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.beginPath()
            this.drawFunction(this)
        }

    }

    drawFromCanvas = (can, x, y) => {
        this.ctx.drawImage(can, x, y)
    }

    drawFillRect(x, y, width, height, color) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, width, height)
    }

    drawRect(x, y, width, height, color, lineWidth) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = lineWidth
        this.ctx.rect(x, y, width, height)
        this.ctx.stroke()
    }
    
    drawImg(x, y, img) {
        if (!img)
            return
        if (img.ready)
            this.ctx.drawImage(img.img, x, y)
    }

    drawImgCenter(img, x, y, angle, zoom) {
        if (!img || !img.ready)
            return
        this.ctx.save()
        this.ctx.setTransform(zoom, 0, 0, zoom, x, y)
        this.ctx.rotate((angle * Math.PI) / 180);
        this.ctx.drawImage(img.img, - img.img.width / 2, - img.img.width / 2);
        this.ctx.restore()
    }

    drawTextFromImage(txtImg, x, y) {
        this.drawFromCanvas(txtImg.canvas, x, y)
    }

    drawTextTopLeft(txt, x, y, lenx, letter_size, txt_color, font) {
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = "top"
        this.ctx.fillStyle = txt_color
        var fonttxt = "" + letter_size + "px"
        if (!font)
            font = "serif"
        fonttxt = fonttxt + " " + font
        this.ctx.font = fonttxt
        this.ctx.fillText(txt, x, y, lenx)
    }
    drawTextCenter(txt, x, y, lenx, letter_size, txt_color, font) {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = "middle"
        this.ctx.fillStyle = txt_color
        var fonttxt = "" + letter_size + "px"
        if (!font)
            font = "serif"
        fonttxt = fonttxt + " " + font
        this.ctx.font = fonttxt
        this.ctx.fillText(txt, x, y, lenx)
    }



}

class MyScreen{         //the class managing displaying image. the main canvas, and all the offscreen canvas.
    constructor(){
        this.fps = TIME_REFRESH_SCREEN_DEFAULT
        this.canvas = document.createElement("canvas")
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px"
	    document.body.appendChild(this.canvas)
        this.ctx = this.canvas.getContext("2d")

        this.offscreenCanvas = []
        this.displayInterval = setInterval(() => {this.mainDraw()}, this.fps)

        //stats data
        this.timeSinceLastCall = 0 //time since last call of draw function
        this.lastDrawDuration = 0 //how much time it took for draw last frame

        window.addEventListener('resize', () => {        
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
            for (var i in this.offscreenCanvas) {
                var can = this.offscreenCanvas[i].canvas
                can.width = window.innerWidth
                can.height = window.innerHeight
                this.offscreenCanvas[i].needRedraw = 1
            }
        })
    }

    addLayerCanvas(name, layer, drawFunction) {
        var newlayer = new OffScreen(name, layer, this.canvas.width, this.canvas.height, drawFunction)
        this.offscreenCanvas.push(newlayer)
        return newlayer
    }

    printAllCanvasToMainCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //clean the screen
        this.ctx.beginPath()        //need to be called just after clean a canvas
        this.offscreenCanvas.sort((a, b) => {return a.layer - b.layer}) //sort offscreen for displayer layer 0 first
        for (var can in this.offscreenCanvas) {
            can = this.offscreenCanvas[can]
            if (can.needRedraw)
                can.drawToMainCanvas()
            this.ctx.drawImage(can.canvas, 0, 0)  //draw the offscreen on the mainscreeen
        }
    }

    mainDraw() {
        const startTime = new Date().getTime()

        this.printAllCanvasToMainCanvas()

        const now = new Date().getTime()
        this.lastDrawDuration = now - startTime
        this.timeSinceLastCall = now
    }


}
class myImage {
    constructor(name) {
        this.img = new Image()
        this.ready = false
        this.name = name;
    }

    createDatafromImage = () => {
        if (!this.ready)
            return undefined
        const canvas = document.createElement("canvas")
        canvas.width = this.img.width
        canvas.height = this.img.height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(this.img, 0, 0)
        return ctx.getImageData(0, 0, this.img.width, this.img.height)
    }

    createImgFromData = (data) => {
        const canvas = document.createElement("canvas")
        canvas.width = data.width
        canvas.height = data.height
        const ctx = canvas.getContext("2d")
        ctx.putImageData(data, 0, 0)
        this.img.src = canvas.toDataURL()
        this.img.alt = 'failed createImgData image';
        this.img.decode()
        .then(() => {
            this.ready = true
        })
        .catch((encodingError) => {
            console.log("can't decode " + this.name)
            console.log(encodingError)
        })
        return this
    }

    LoadImageFromFile(src) {
        this.img.crossOrigin = 'anonymous'
        this.img.alt = 'cant load image "' + src + '"';
        this.img.onload = () => {
            console.log("img " + this.name + " is loaded")
            this.ready = true    
        }
        this.img.onerror = () => {
            console.log("error while loading " + this.name)
        }
        this.img.src = src;
        return this
    }
    LoadImageFromFileAndSetTransparency(src, r, g, b, a) {
        this.img.crossOrigin = 'anonymous'
        this.img.alt = 'cant load image "' + src + '"';
        this.img.onload = () => {
            console.log("img " + this.name + " is loaded")
            this.ready = true
            this.img.onload = () => {
                this.ready = true
            }
            this.setColorTransparency(r, g, b, a)   
        }
        this.img.onerror = () => {
            console.log("error while loading " + this.name)
        }
        this.img.src = src;
        return this
    }
 
    setColorTransparency = (ra, ga, ba, alpha) => {
        var imageData = this.createDatafromImage()
        if (!imageData) {
            console.log("could create image data " + this.name)
            return undefined
        }
        for(var x = 0; x < imageData.height; x++) {
            for(var y = 0; y < imageData.width; y++) {
                var r = imageData.data[((x*(imageData.width*4)) + (y*4))];
                var g = imageData.data[((x*(imageData.width*4)) + (y*4)) + 1];
                var b = imageData.data[((x*(imageData.width*4)) + (y*4)) + 2];
                var a = imageData.data[((x*(imageData.width*4)) + (y*4)) + 3];
                if (r == ra && g == ga && b == ba) {
                    imageData.data[((x*(imageData.width*4)) + (y*4)) + 3] = alpha
                }
            }
        }
        return this.createImgFromData(imageData)
    } 

}



class myTextImg {
    constructor(txt, data) {
        this.txt = txt
        this.canvas = document.createElement("canvas")
        this.ctx = this.canvas.getContext("2d")
        if (!data)
            data = {
                font : "20px serif",
                color : "black",
                textAlign : "left",
                textBaseline : "top"
            }
        this.font = data.font
        this.color = data.color
        this.textAlign = data.textAlign
        this.textBaseline = data.textBaseline
    }

    BuildTextImage() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.font = this.font
        this.ctx.fillStyle = this.color
        this.ctx.textAlign = this.textAlign
        this.ctx.textBaseline = this.textBaseline
        this.ctx.fillText(this.txt, 0, 0)
        return this
    }
}

class ControllersManager {
    constructor() {
        this.keyDown = []
        this.keyUp = []
        this.mousePos = {
            x : 0,
            y : 0,
            lastTime : new Date().getTime()
        }
        this.onControllerEventFunction = undefined

        window.addEventListener('keydown', (event) => {
            if (event.repeat)
                return
            var name = event.key;
            var code = event.code;
            this.keyDown[code] = true
            if (this.onControllerEventFunction)
                this.onControllerEventFunction(event)
        });
        window.addEventListener('keyup', (event) => {
            var name = event.key;
            var code = event.code;
            this.keyDown[code] = false
            this.keyUp[code] = true
            if (this.onControllerEventFunction)
                this.onControllerEventFunction(event)
        });
        window.addEventListener('wheel', (event) => {
            var wheelDir = event.deltaY
            if (this.onControllerEventFunction)
                this.onControllerEventFunction(event)
        })
        window.addEventListener('mouseup', (event) => {
            this.inputclick = {
                x : event.clientX,
                y : event.clientY,
                button : event.button
            }
            if (this.onControllerEventFunction)
                this.onControllerEventFunction(event)
        });
        window.addEventListener('mousemove', (event) => {
            this.mousePos.x = event.clientX
            this.mousePos.y = event.clientY
            this.mousePos.lastTime = new Date().getTime()
            if (this.onControllerEventFunction)
                this.onControllerEventFunction(event)
        });
        window.addEventListener('click', (event) => {
            if (this.onControllerEventFunction)
                this.onControllerEventFunction(event)
        });
        
    }
}


class Building {
    constructor(x, y, id1, id2, r) {
        this.x = Number(x)
        this.y = Number(y)
        this.id1 = Number(id1)
        this.id2 = (id2 == undefined) ? undefined : Number(id2)
        this.r = Number(r)
    }
}

buildingsListToTxt = (list) => {
    let txt = ""
    for (var z in list) {
        let b = list[z]
        let line = "!b=" + b.id1 + ":"
        if (b.id2 != undefined)
            line += b.id2 + ":"
        line += b.x + ":" + b.y + ":" + b.r
        txt += line
    }
    return txt
}

txtToBuildingList = (txt) => {
    if (!txt || txt.length == 0)
        return undefined
    let lst
    let buildingsList = []
    txt = txt.replaceAll(" ", "").replaceAll("\n", "").replaceAll("\t", "")
    lst = txt.split("!b=").filter((t) => {return t != ""})
    for (var z in lst) {
        let b = lst[z].split(":")
        let x, y, id1, id2, r
        if (b.length == 4 || b.length == 5) {
            id1 = b[0]
            if (isNaN(id1) || id1 < 0)
                continue
            let offset = 0
            id2 = undefined
            if (b.length == 5) {
                offset = 1
                id2 = b[1]
                if (isNaN(id2) || id2 < 0)
                    continue
            }
            x = b[1 + offset]
            if (isNaN(x) || x >= 150 && x < 0)
                continue
            y = b[2 + offset]
            if (isNaN(y) || y >= 150 && y < 0)
                continue
            r = b[3 + offset] % 4
            if (isNaN(r) || r < 0)
                continue
        }
        buildingsList.push(new Building(x, y, id1, id2, r))
    }
    return buildingsList
}


class MapCode {
    constructor() {
        this.buildings = []
    }

    createFromText = (txt) => {
        let bList = txtToBuildingList(txt)
        if (bList == undefined || bList.length == 0)
            return console.log("unvalid map code entered")
        this.buildings = bList
        console.log("valid map")
        return this
    }

    moveMap = (dx, dy) => {
        let newBuildings = []
        for (var z in this.buildings) {
            let bu = this.buildings[z]
            let x = bu.x + dx
            let y = bu.y + dy
            if (x < 0 || y < 0 || x > 149 || y > 149)
                continue
            newBuildings.push(new Building(x, y, bu.id1, bu.id2, bu.r))
        }
        this.buildings = newBuildings
    }

    replaceMap = (Aid1, Aid2, Bid1, Bid2) => {
        let newBuildings = []
        for (var z in this.buildings) {
            let bu = this.buildings[z]
            let newb
            if (Aid1 == bu.id1 && Aid2 == bu.id2) {
                if (Bid1 == undefined)
                    continue
                newb = new Building(bu.x, bu.y, Bid1, Bid2, bu.r)
            }
            else
                newb = bu
            newBuildings.push(newb)
        }
        this.buildings = newBuildings
    }

    getMinMaxCorner = () => {
        let minX = 149
        let minY = 149
        let maxX = 0
        let maxY = 0
        for (var z in this.buildings) {
            let b = this.buildings[z]
            minX = b.x < minX ? b.x : minX
            minY = b.y < minY ? b.y : minY
            maxX = b.x > maxX ? b.x : maxX
            maxY = b.y > maxY ? b.y : maxY
        }
        return ({minX, minY, maxX, maxY})
    }

    addBuilding(x, y, id1, id2, r) {
        //for (var bid in this.buildings) {
        //    let b = this.buildings[bid]
            //if (b.x == x && b.y == y && b.id1 == id1 && b.id2 == id2)
            //    return
        //}
        this.buildings.push(new Building(x, y, id1, id2, r))
    }

    removeBuildingFromRect(ax, ay, bx, by) {
        for (var bid in this.buildings) {
            let b = this.buildings[bid]
            if (b.x >= ax && b.y >= ay && b.x <= bx && b.y <= by)
                b.isDead = true
        }
        this.buildings = this.buildings.filter((a) => (a.isDead != true))
    }

    removeBuildingFromPos(x, y) {
        for (var bid in this.buildings) {
            let b = this.buildings[bid]
            if (b.x == x && b.y == y)
                b.isDead = true
        }
        this.buildings = this.buildings.filter((a) => (a.isDead != true))
    }

    saveToLocalStorage(name) {
        var str = buildingsListToTxt(this.buildings)
        localStorage.setItem(name, str)
        console.log("saved in Local Storage as " + name)
    }

    LoadFromLocalStorage(name) {
        var str = localStorage.getItem(name)
        this.buildings = txtToBuildingList(str)
        console.log("loaded from Local Storage as " + name)
    }

    copyMap(ax, ay, bx, by) {
        let cpy = new MapCode()
        for (var bid in this.buildings) {
            let b = this.buildings[bid]
            if (b.x >= ax && b.y >= ay && b.x <= bx && b.y <= by)
                cpy.addBuilding(b.x, b.y, b.id1, b.id2, b.r)
        }
        return cpy
    }

    copyMapAndMoveToTopLeftCorner(ax, ay, bx, by) {
        if (ax > bx) {
            let tmp = ax
            ax = bx
            bx = tmp
        }
        if (ay > by) {
            let tmp = ay
            ay = byx
            by = tmp
        }
        let cpy = this.copyMap(ax, ay, bx, by)
        let corners = cpy.getMinMaxCorner()
        cpy.moveMap(-corners.minX, -corners.minY)
        return cpy
    }

    pastFromMap(map, dx, dy) {
        for (var z in map.buildings) {
            var b = map.buildings[z]
            this.addBuilding(b.x + dx, b.y + dy, b.id1, b.id2, b.r)
        }
    }
}

class House {
    constructor(txt, max, name) {
        this.txt = txt
        this.map = undefined
        this.hasBeenPlaced = 0
        this.maxPlace = max
        this.name = name ? name : "myhouse"
    }
    convertToMap() {
        this.map = new MapCode()
        this.map.buildings = txtToBuildingList(this.txt)
        this.map = this.map.copyMapAndMoveToTopLeftCorner(0, 0, 149, 149)
    }
}

class ExclusionZone {
    constructor(ax, ay, bx, by) {
        if (ax > bx) {
            let tmp = ax
            ax = bx
            bx = tmp
        }
        if (ay > by) {
            let tmp = ay
            ay = by
            by = tmp
        }
        this.ax = (ax >=0 && ax < 150) ? Number(ax) : 0
        this.ay = (ay >=0 && ay < 150) ? Number(ay) : 0
        this.bx = (bx >=0 && bx < 150) ? Number(bx) : 150
        this.by = (by >=0 && by < 150) ? Number(by) : 150
    }
}


generateMapFromHouse = (houses, maxtry, maxhouse, minDistBetweenHouse, dx, dy) => {
    console.log("generating map...")
    console.log(houses.length, " houses, ", maxtry, " tentatives, ", maxhouse, " max placed, every x/y = ", dx, dy)
    let generatedMap = new MapCode()
    let mapbit = []
    for (var i = 0; i < 150; i++) {
        mapbit[i] = []
        for (var j = 0; j < 150; j++) {
            mapbit[i][j] = false
        }
    }
    for (var z in houses)  {
        houses[z].convertToMap()
        houses[z].hasBeenPlaced = 0
    }
    for (var z in exclusionZone) {
        let zone = exclusionZone[z]
        exclusionZone[z] = new ExclusionZone(zone.ax, zone.ay, zone.bx, zone.by)
        zone = exclusionZone[z]
        for (var i = zone.ax; i <= zone.bx; i++)
            for (var j = zone.ay; j <= zone.by; j++)
                if (i >= 0 && j >= 0 && i < 150 && j < 150)
                    mapbit[i][j] = true
    }

    
    let housesPlaced = 0
    for (var test = 0; test < maxtry; test++) {
        if (housesPlaced >= maxhouse)
            break

        let alreadyplaced = true
        let hid
        test--
        while (alreadyplaced && test < maxtry) {
            test++
            hid = Math.floor(Math.random() * houses.length)
            if (houses[hid].hasBeenPlaced < houses[hid].maxPlace)
                alreadyplaced = false
        }
        if (test >= maxtry)
            break
        let h = houses[hid]
        let dx = Math.floor(Math.random() / placeHousesEveryX * 150) * placeHousesEveryX
        let dy = Math.floor(Math.random() / placeHousesEveryY * 150) * placeHousesEveryY
        let canplace = true
        for (var bid in h.map.buildings) {
            let b = h.map.buildings[bid]
            let x = b.x + dx
            let y = b.y + dy
            if (x < 0 || y < 0 || x > 149 || y > 149 || mapbit[x][y]) {
                canplace = false
                break
            }
            for (var i = x - minDistBetweenHouse; i <= x + minDistBetweenHouse; i++) {
                for (var j = y - minDistBetweenHouse; j <= y + minDistBetweenHouse; j++) {
                    if (i < 0 || j < 0 || i > 149 || j > 149)
                        continue
                    if (mapbit[i][j])
                    canplace = false
                    break
                }
                if (canplace == false)
                    break
            }
        }
        if (!canplace)
            continue
        housesPlaced++
        h.hasBeenPlaced++
        for (var bid in h.map.buildings) {
            let b = h.map.buildings[bid]
            let x = b.x + dx
            let y = b.y + dy
            for (var i = x - minDistBetweenHouse; i <= x + minDistBetweenHouse; i++) {
                for (var j = y - minDistBetweenHouse; j <= y + minDistBetweenHouse; j++) {
                    if (i >= 0 && j >= 0 && i < 150 && j < 150)
                        mapbit[i][j] = true
                }
            }
        }
        generatedMap.pastFromMap(h.map, dx, dy)
        console.log("copying to map", dx, dy)
        console.log("placing nb of building : ", h.map.buildings.length)
        console.log("new amount of building = ", generatedMap.buildings.length)
    }
    currentMap = generatedMap
    console.log("end of generation")
}


class MapDisplay {
    constructor(offscreenFloor) {
        this.width = 150
        this.height = 150
        this.camera = {
            x : 75,
            y : 75,
            zoom : 2
        }
        this.offscreenFloor = offscreenFloor
        this.clickSelectionfrom = undefined
    }

    getPixelFromPos(x, y) {
        x = Math.floor((x - this.camera.x) * this.camera.zoom  + this.offscreenFloor.canvas.width / 2)
        y = Math.floor((y - this.camera.y) * this.camera.zoom  + this.offscreenFloor.canvas.height / 2)
        return ({x : x, y : y})
    }

    getPosFromPixel(x, y) {
       x = (x - this.offscreenFloor.canvas.width / 2) / this.camera.zoom + this.camera.x
       y = (y - this.offscreenFloor.canvas.height / 2) / this.camera.zoom + this.camera.y
       return ({x : x, y : y})
    }

    drawBuilding = (x, y, b) => {
        var start = this.getPixelFromPos(x, y)
        var end = this.getPixelFromPos(x + 1, y + 1)
        var len = {
            x : end.x - start.x,
            y : end.y - start.y
        }
        let color = "#0000ff44"
        let form = "default"
        if (b.id1 == 30 || b.id1 == 68 || b.id1 == 27 || b.id1 == 50) {
            color = "#964B00"
            form = "wall"
        }
        else if (b.id1 == 31 || b.id1 == 69 || b.id1 == 28 || b.id1 == 51) {
            color = "#888888"
            form = "wall"
        }
        else if (b.id1 == 32 || b.id1 == 70 || b.id1 == 29 || b.id1 == 52) {
            color = "#ffffff"
            form = "wall"
        }
        else if (b.id1 == 62 || b.id1 == 67 || b.id1 == 84 || b.id1 == 85 || b.id1 == 154 || b.id1 == 155)
            color = "#ffff0022"
        else if (b.id1 == 71) {
            form = "circle"
            color = "#00ff0044"
        }
        else if (b.id1 == 86)
            color = "#00000044"
        else if (b.id1 == 97 || b.id1 == 98 || b.id1 == 99 || b.id1 == 111) {
            color = "#ff000044"
            form = "circle"
        }
        else if (b.id1 >= 140 && b.id1 <= 159) {
            color = "#a020f044"
            form = "circle"
        }
        if (form == "default")
            this.offscreenFloor.drawFillRect(start.x, start.y, len.x, len.y, color)
        else if (form == "wall") {
            this.offscreenFloor.drawFillRect(start.x + len.x * 0.1, start.y + len.y * 0.1, len.x * 0.8, len.y * 0.8, color)
        }
        else if (form == "circle") {
            let ctx = this.offscreenFloor.ctx
            ctx.fillStyle = color
            ctx.beginPath();
            ctx.arc(start.x + len.x / 2, start.y + len.y / 2, len.x / 2.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    clickOnMap = (x, y) => {
        let selection = []
        let hasSelected = false
        let pos = this.getPosFromPixel(x, y)
        let bpos = {x : Math.floor(pos.x), y : Math.floor(pos.y)}
        if (bpos.x < 0 || bpos.y < 0 || bpos.x > 149 || bpos.y > 149) {
            this.clickSelectionfrom = undefined
            return (false)
        }
        if (guiMainMenuSelector == "mouse") {
            if (mouseSelectorList[mouseSelectorId] == "point") {
                selection.push({x : bpos.x, y : bpos.y})
                hasSelected = true
            }
            else if (mouseSelectorList[mouseSelectorId] == "rect") {
                if (this.clickSelectionfrom == undefined)
                    this.clickSelectionfrom = bpos
                else {
                    if (this.clickSelectionfrom.x > bpos.x) {
                        let tmp = bpos.x
                        bpos.x = this.clickSelectionfrom.x
                        this.clickSelectionfrom.x = tmp
                    }
                    if (this.clickSelectionfrom.y > bpos.y) {
                        let tmp = bpos.y
                        bpos.y = this.clickSelectionfrom.y
                        this.clickSelectionfrom.y = tmp
                    }
                    for (var i = this.clickSelectionfrom.x; i <= bpos.x; i++)
                        for (var j = this.clickSelectionfrom.y; j <= bpos.y; j++)
                            selection.push({x : i, y : j})
                    hasSelected = true 
                }
            }
            let mode = mouseDrawModeList[mouseDrawModeId]
            if (hasSelected) {
                if (mode == "past") {
                    currentMap.pastFromMap(mapCopied, bpos.x, bpos.y)
                }
                if (mode == "copy") {
                    console.log("copied")
                    if (mouseSelectorList[mouseSelectorId] == "point")
                        mapCopied = currentMap.copyMapAndMoveToTopLeftCorner(bpos.x, bpos.y, bpos.x, bpos.y)
                    else if (mouseSelectorList[mouseSelectorId] == "rect")
                        mapCopied = currentMap.copyMapAndMoveToTopLeftCorner(this.clickSelectionfrom.x, this.clickSelectionfrom.y, bpos.x, bpos.y)
                }
                if (mouseSelectorList[mouseSelectorId] == "rect" && (mode == "delete" || mode == "replace"))
                    currentMap.removeBuildingFromRect(this.clickSelectionfrom.x, this.clickSelectionfrom.y, bpos.x, bpos.y)
                for (var z in selection) {
                    let select = selection[z]
                    if (mode == "add") {
                        currentMap.addBuilding(select.x, select.y, buildingTypeSeleced.id1, buildingTypeSeleced.id2, buildingTypeSeleced.r)    
                    }
                    else if (mode == "replace") {
                        if (mouseSelectorList[mouseSelectorId] != "rect")
                            currentMap.removeBuildingFromPos(select.x, select.y)
                        currentMap.addBuilding(select.x, select.y, buildingTypeSeleced.id1, buildingTypeSeleced.id2, buildingTypeSeleced.r)
                    }
                    else if (mode == "delete" && mouseSelectorList[mouseSelectorId] != "rect") {
                        currentMap.removeBuildingFromPos(select.x, select.y)
                    }
                }
                this.clickSelectionfrom = undefined
            }
            return (true)
        }
    }

    displayMap = () => {
        if (!this.offscreenFloor)
            return
        let ctx = this.offscreenFloor.ctx
        //background map
        var start = this.getPixelFromPos(0, 0)
        var end = this.getPixelFromPos(this.width, this.height)
        this.offscreenFloor.drawFillRect(start.x, start.y, end.x - start.x, end.y - start.y, "#314736")
        //horizontal/vertical line
        ctx.beginPath()
        ctx.strokeStyle = "black"
        ctx.lineWidth = 0.5
        if (0.05 * this.camera.zoom > 1) {
            for (var x = 0; x < 151; x += 1) {
                for (var y = 0; y < 151; y += 1) {
                    let a = this.getPixelFromPos(x, 0)
                    let b = this.getPixelFromPos(x, this.height)
                    ctx.moveTo(a.x, a.y); 
                    ctx.lineTo(b.x, b.y);
                    a = this.getPixelFromPos(0, y)
                    b = this.getPixelFromPos(this.width, y)
                    ctx.moveTo(a.x, a.y); 
                    ctx.lineTo(b.x, b.y); 
                }
            }
        }
        ctx.stroke()
        if (currentMap) {
            let buildings = currentMap.buildings
            for (var b in buildings) {
                let bu = buildings[b]
                this.drawBuilding(bu.x, bu.y, bu)
            }   
        }
        if (this.clickSelectionfrom) {
            let pos = myControllersManager.mousePos
            let mousepos = this.getPosFromPixel(pos.x, pos.y)
            if (mousepos.x >= -1 && mousepos.y >= -1 && mousepos.x < 151 && mousepos.y < 151) {
                let start = this.getPixelFromPos(this.clickSelectionfrom.x, this.clickSelectionfrom.y)
                let end = this.getPixelFromPos(Math.floor(mousepos.x + 1), Math.floor(mousepos.y + 1))
                if (end.x < start.x) {
                    let tmp = end.x
                    end.x = start.x
                    start.x = tmp
                }
                if (end.y < start.y) {
                    let tmp = end.y
                    end.y = start.y
                    start.y = tmp
                }
                this.offscreenFloor.drawFillRect(start.x, start.y, end.x - start.x, end.y - start.y, "#ffffff33")
            }
        }

        setTimeout(()=>{this.offscreenFloor.needRedraw = 1}, 20)
    }
}

let guiMainMenuSelector = undefined


let currentMap = new MapCode()
let mapCopied = undefined

let gameUI

InputFromRange = (min, max, text, defaultValue) => {
    let value = window.prompt(text, defaultValue)
    if (isNaN(value) || value < min || value > max)
        value = defaultValue
    return (Number(value))
}

mainMenuGui = (gameUI) => {
    gameUI.addTextZone("Devast.io Map Editor ++", 60, 9999, "black", "serif")
    gameUI.addTextZone("unofficial, fan-made, ugly but it work, v0.1", 10, 9999, "black", "serif")
    gameUI.addButton("Load/Save Map", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "save"}, undefined, "serif")
    gameUI.addButton("load map from Text Code", 20, '#000000', "#ffffff", "#000000", () => {currentMap = new MapCode().createFromText(window.prompt("Enter the map codee", "!b=..."))}, undefined, "serif")
    //gameUI.addButton("load saved map", 20, '#000000', "#ffffff", "#000000", () => {currentMap = new MapCode(); currentMap.LoadFromLocalStorage()}, undefined, "serif")
    gameUI.addButton("new empty map", 20, '#000000', "#ffffff", "#000000", () => {currentMap = new MapCode()}, undefined, "serif")
    if (!currentMap)
        return
    //gameUI.addButton("save map", 20, '#000000', "#ffffff", "#000000", () => {currentMap.saveToLocalStorage()}, undefined, "serif")
    gameUI.addButton("copy map to clipboard", 20, '#000000', "#ffffff", "#000000", () => {navigator.clipboard.writeText(buildingsListToTxt(currentMap.buildings), window.alert("map copied"))}, undefined, "serif")
    gameUI.addButton("1. Move Map", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "moveMap"}, undefined, "serif")
    gameUI.addButton("2. Replace in Map", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "replace"}, undefined, "serif")
    gameUI.addButton("3. Draw with mouse", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "mouse"}, undefined, "serif")
    gameUI.addButton("4. Generate from houses", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "house"}, undefined, "serif")
}

//REPLACE MAP

let replaceMapInput = {
    Aid1 : 0,
    Aid2 : undefined,
    Bid1 : -1,
    Bid2 : undefined
}

applyReplaceMap = () => {
    currentMap.replaceMap(replaceMapInput.Aid1, replaceMapInput.Aid2, replaceMapInput.Bid1, replaceMapInput.Bid2)
}

replaceMenuGui = () => {
    gameUI.addTextZone("replace a building type by another type\nfrom building type... : ", 25, 9999, "black", "serif")
    gameUI.addButton("Id1 : " + replaceMapInput.Aid1, 15, '#000000', "#ffffff", "#000000", () => {replaceMapInput.Aid1 = InputFromRange(0, 9999, "enter building id1", replaceMapInput.Aid1)}, undefined, "serif")
    let aid2txt = replaceMapInput.Aid2 == undefined ? "None" : replaceMapInput.Aid2
    gameUI.addButton("Id2 : " + aid2txt, 15, '#000000', "#ffffff", "#000000", () => {replaceMapInput.Aid2 = InputFromRange(-9999, 9999, "enter building id1 (negative value if no second id)", replaceMapInput.Aid1); replaceMapInput.Aid2 = (replaceMapInput.Aid2 < 0) ? undefined : replaceMapInput.Aid2}, undefined, "serif")
    gameUI.addTextZone("...to building type : ", 25, 9999, "black", "serif")
    let bid1txt = replaceMapInput.Bid1 == -1 ? "just delete" : "Id1 : " + replaceMapInput.Bid1
    gameUI.addButton(bid1txt, 15, '#000000', "#ffffff", "#000000", () => {replaceMapInput.Bid1 = InputFromRange(-9999, 9999, "enter building id1 (negative value for no replacement)", replaceMapInput.Bid1)}, undefined, "serif")
    if (replaceMapInput.Bid1 != -1) {
        let bid2txt = replaceMapInput.Bid2 == undefined ? "None" : replaceMapInput.Bid2
        gameUI.addButton(bid2txt, 15, '#000000', "#ffffff", "#000000", () => {replaceMapInput.Bid2 = InputFromRange(-9999, 9999, "enter building id2 (negative value if no second id)", replaceMapInput.Bid2); replaceMapInput.Bid2 = (replaceMapInput.Bid2 < 0) ? undefined : replaceMapInput.Bid2}, undefined, "serif")
    }
    gameUI.addButton("REPLACE !!", 20, '#000000', "#ffffff", "#000000", () => {applyReplaceMap()}, undefined, "serif")
    gameUI.addButton("Return", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = undefined}, undefined, "serif")
}

//SAVE

loadSaveMenu = () => {
    gameUI.addButton("Return", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = undefined}, undefined, "serif")
    gameUI.addTextZone("local Storage Save", 25, 9999, "black", "serif")
    for (var i = 0; i < 10; i++) {
        let saveName = "save:" + i
        let uiElmList = [
            {
                type : "txt",
                txt : saveName,
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif"
            },{
                type : "button",
                callback : () => {currentMap.saveToLocalStorage(saveName)},
                callback_data : undefined,
                txt : "Save",
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            }
        ]
        if (localStorage.getItem(saveName)) {
            uiElmList.push({
                type : "button",
                callback : () => {currentMap.LoadFromLocalStorage(saveName)},
                callback_data : undefined,
                txt : "Load",
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            })
            uiElmList.push({
                type : "button",
                callback : () => {localStorage.removeItem(saveName)},
                callback_data : undefined,
                txt : "Delete",
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            })
        }
        gameUI.addHorizontalElem(uiElmList)
    }
}



//MOVING MAP

let moveMapInput = {
    x : 0,
    y : 0,
    corner : undefined
}

setToCorner = (modx, mody) => {
    let corners = currentMap.getMinMaxCorner()
    if (modx == "min")
        moveMapInput.x = - corners.minX
    if (modx == "max")
        moveMapInput.x = 149 - corners.maxX
    if (mody == "min")
        moveMapInput.y = - corners.minY
    if (mody == "max")
        moveMapInput.y = 149 - corners.maxY
}

applyMove = () => {
    currentMap.moveMap(moveMapInput.x, moveMapInput.y)
    moveMapInput = {
        x : 0,
        y : 0,
        corner : undefined
    }
}


moveMapMenu = () => {
    gameUI.addTextZone("add X/Y offset to all building\nentities moved outside the map limits (0 -> 150) are removed", 25, 9999, "black", "serif")
    gameUI.addButton("X : " + moveMapInput.x, 20, '#000000', "#ffffff", "#000000", () => {moveMapInput.x = InputFromRange(-149, 149,"X = ", moveMapInput.x)}, undefined, "serif")
    gameUI.addButton("Y : " + moveMapInput.y, 20, '#000000', "#ffffff", "#000000", () => {moveMapInput.y = InputFromRange(-149, 149,"Y = ", moveMapInput.y)}, undefined, "serif")
    gameUI.addButton("Top + Left", 15, '#000000', "#ffffff", "#000000", () => {setToCorner("min", "min")}, undefined, "serif")
    gameUI.addButton("Top + Right", 15, '#000000', "#ffffff", "#000000", () => {setToCorner("max", "min")}, undefined, "serif")
    gameUI.addButton("Bot + Left", 15, '#000000', "#ffffff", "#000000", () => {setToCorner("min", "max")}, undefined, "serif")
    gameUI.addButton("Bot + Right", 15, '#000000', "#ffffff", "#000000", () => {setToCorner("max", "max")}, undefined, "serif")
    gameUI.addButton("MOVE !!", 20, '#000000', "#ffffff", "#000000", () => {applyMove()}, undefined, "serif")
    gameUI.addButton("Return", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = undefined}, undefined, "serif")
}

//Draw with mouse

let mouseDrawModeList = ["view" ,"add", "delete", "replace", "copy", "past"]
let mouseDrawModeId = 0
let mouseSelectorList = ["point", "rect"]
let mouseSelectorId = 0
let buildingTypeSeleced = {
    id1 : 0,
    id2 : undefined,
    r : 0
}

mouseDrawMap_MainMenu = () => {
    gameUI.addTextZone("Mouse Drawing", 25, 9999, "black", "serif")
    gameUI.addButton("Return", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = undefined}, undefined, "serif")
    
    let pos = myMapDisplay.getPosFromPixel(myMousePos.x, myMousePos.y)
    pos = {
        x : Math.floor(pos.x),
        y : Math.floor(pos.y)
    }
    gameUI.addTextZone("pos : [" + pos.x + ":" + pos.y + "]", 25, 9999, "black", "serif")
    let mode = mouseDrawModeList[mouseDrawModeId]
    gameUI.addButton("mode : " + mode, 20, '#000000', "#ffffff", "#000000", () => {mouseDrawModeId = (mouseDrawModeId + 1) % mouseDrawModeList.length}, undefined, "serif")
    if (mode == "view") {
        for (var z in currentMap.buildings) {
            let b = currentMap.buildings[z]
            if (b.x == pos.x && b.y == pos.y)
                gameUI.addTextZone("-id1 : " + b.id1 + "\nid2 : " + b.id2 + "\nX : " + b.x + "\nY : " + b.y + "\nrot : " + b.r , 15, 9999, "black", "serif")
        }
    }
    else {
        let selectMode = mouseSelectorList[mouseSelectorId]
        gameUI.addButton("selector : " + selectMode, 20, '#000000', "#ffffff", "#000000", () => {mouseSelectorId = (mouseSelectorId + 1) % mouseSelectorList.length}, undefined, "serif")
        if (mode == "add" || mode == "replace" || mode == "delete") {
            let txtid1 = buildingTypeSeleced.id1 == undefined ? "None" : buildingTypeSeleced.id1
            gameUI.addButton("id1 : " + txtid1, 20, '#000000', "#ffffff", "#000000", () => {buildingTypeSeleced.id1 = InputFromRange(-9999, 9999,"id1 = ", buildingTypeSeleced.id1); buildingTypeSeleced.id1 = buildingTypeSeleced.id1 < 0 ? undefined : buildingTypeSeleced.id1}, undefined, "serif")
            if (buildingTypeSeleced.id1 != undefined) {
                let txtid2 =  buildingTypeSeleced.id2 == undefined ? "None" : buildingTypeSeleced.id2
                gameUI.addButton("id2 : " + txtid2, 20, '#000000', "#ffffff", "#000000", () => {buildingTypeSeleced.id2 = InputFromRange(-9999, 9999,"id2 = ", buildingTypeSeleced.id2); buildingTypeSeleced.id2 = buildingTypeSeleced.id2 < 0 ? undefined : buildingTypeSeleced.id2}, undefined, "serif")
            }
            if (buildingTypeSeleced.id1 != undefined)
                gameUI.addButton("rot : " + buildingTypeSeleced.r, 20, '#000000', "#ffffff", "#000000", () => {buildingTypeSeleced.rot = InputFromRange(0, 3,"rotation [0-3] = ", buildingTypeSeleced.rot); buildingTypeSeleced.rot = Math.max(0, Math.min(buildingTypeSeleced.rot, 3))}, undefined, "serif")
        }
        if ((mode == "copy" || mode == "past") && mapCopied)
            gameUI.addTextZone(mapCopied.buildings.length + " buildings copied", 25, 9999, "black", "serif")
    }
}


//Generate House

let houseToGenList = []
let maxTryGenHouse = 100
let maxHouseToGen = 10

let exclusionZone = []
let minDistBetweenHouse = 0
let placeHousesEveryX = 1
let placeHousesEveryY = 1

addHouseGen = () => {
    let house = new House(window.prompt("enter house map code", "!b=..."), 1, "h" + houseToGenList.length)
    houseToGenList.unshift(house)
}

addExcluZone = () => {
    let exzone = new ExclusionZone(50, 50, 100, 100)
    exclusionZone.push(exzone)
}

houseGeneratorMenu = () => {
    gameUI.addTextZone("Place randomly houses/buildings on the map from a list", 25, 9999, "black", "serif")
    gameUI.addButton("Return", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = undefined}, undefined, "serif")
    gameUI.addButton("advanced generation settings", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "houseAdvanced"}, undefined, "serif")
    gameUI.addButton("max nb of try : " + maxTryGenHouse, 15, '#000000', "#ffffff", "#000000", () => {maxTryGenHouse = InputFromRange(1, 999999, "enter the maximal numbers of tentativ to place a houses", maxTryGenHouse)}, undefined, "serif")
    gameUI.addButton("max nb of houses : " + maxHouseToGen, 15, '#000000', "#ffffff", "#000000", () => {maxHouseToGen = InputFromRange(1, 999999, "enter the maximal numbers of houses to generate", maxHouseToGen)}, undefined, "serif")
    if (houseToGenList.length > 0)
        gameUI.addButton("GENERATE !!", 15, '#000000', "#ffffff", "#000000", () => {generateMapFromHouse(houseToGenList, maxTryGenHouse, maxHouseToGen, minDistBetweenHouse)}, undefined, "serif")
    gameUI.addButton("add new house", 15, '#000000', "#ffffff", "#000000", () => {addHouseGen()}, undefined, "serif")
    for (var z in houseToGenList) {
        let h = houseToGenList[z]
        let uiElmList = [
            {
                type : "txt",
                txt : "-" + h.name +"-",
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif"
            },
            {
                type : "button",
                callback : () => {h.maxPlace = InputFromRange(1, 9999999, "enter the maximal numbers of tentativ to place this houses", h.maxPlace)},
                callback_data : undefined,
                txt : "max amount : " + h.maxPlace,
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            },
            {
                type : "button",
                callback : () => {h.dead = true;houseToGenList = houseToGenList.filter((h) => {return h.dead != true})},
                callback_data : undefined,
                txt : "delete",
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            }
        ]
        gameUI.addHorizontalElem(uiElmList)
    }
}

houseGenAdvancedMenu = () => {
    gameUI.addButton("Return", 20, '#000000', "#ffffff", "#000000", () => {guiMainMenuSelector = "house"}, undefined, "serif")
    gameUI.addButton("minimal distance between houses : " + minDistBetweenHouse, 15, '#000000', "#ffffff", "#000000", () => {minDistBetweenHouse = InputFromRange(0, 147, "the minimal amount of blocks between 2 houses", minDistBetweenHouse)}, undefined, "serif")
    gameUI.addButton("X step between house : " + placeHousesEveryX, 15, '#000000', "#ffffff", "#000000", () => {placeHousesEveryX = InputFromRange(1, 75, "X step between each house placement", placeHousesEveryX)}, undefined, "serif")
    gameUI.addButton("Y step between house : " + placeHousesEveryY, 15, '#000000', "#ffffff", "#000000", () => {placeHousesEveryY = InputFromRange(1, 75, "X step between each house placement", placeHousesEveryY)}, undefined, "serif")
    gameUI.addButton("add exclusion zone", 20, '#000000', "#ffffff", "#000000", () => {addExcluZone()}, undefined, "serif")
    for (var z in exclusionZone) {
        let exclu = exclusionZone[z]
        let uiElmList = [
            {
                type : "txt",
                txt : "-",
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif"
            },
            {
                type : "button",
                callback : () => {exclu.ax = InputFromRange(0, 149, "from X", exclu.ax)},
                callback_data : undefined,
                txt : "startX : " + exclu.ax,
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            },
            {
                type : "button",
                callback : () => {exclu.ay = InputFromRange(0, 149, "from Y", exclu.ay)},
                callback_data : undefined,
                txt : "startY : " + exclu.ay,
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            },
            {
                type : "button",
                callback : () => {exclu.bx = InputFromRange(0, 149, "to X", exclu.bx)},
                callback_data : undefined,
                txt : "endX : " + exclu.bx,
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            },
            {
                type : "button",
                callback : () => {exclu.by = InputFromRange(0, 149, "to Y", exclu.by)},
                callback_data : undefined,
                txt : "endY : " + exclu.by,
                txt_color : "black",
                max_letters : 9999,
                letter_size : 15,
                txt_font : "serif",
                fillColor : "#ffffff"
            }
        ]
        gameUI.addHorizontalElem(uiElmList)
    }
    
}

//MAIN
myGuidisplayFunction = (offscreen) => {

    if (mouseDrawModeList[mouseDrawModeId] == "copy")
        mouseSelectorId = 1
    if (mouseDrawModeList[mouseDrawModeId] == "past")
        mouseSelectorId = 0

    myGUI = new UIManager(myControllersManager)
    gameUI = myGUI.createUI(offscreen, 0, 0, 25, 1, "#ffffff00", "black", 5)
    if (guiMainMenuSelector == undefined)
        mainMenuGui(gameUI)
    else if (guiMainMenuSelector == "moveMap")
        moveMapMenu()
    else if (guiMainMenuSelector == "replace")
        replaceMenuGui()
    else if (guiMainMenuSelector == "mouse")
        mouseDrawMap_MainMenu()
    else if (guiMainMenuSelector == "save")
        loadSaveMenu()
    else if (guiMainMenuSelector == "house")
        houseGeneratorMenu()
    else if (guiMainMenuSelector == "houseAdvanced")
        houseGenAdvancedMenu()

    gameUI.drawUI()
    offscreen.timeOutdraw = setTimeout(()=>{offscreen.needRedraw = 1}, 20)
}
console.log("hey it works !!")

background = (offscreen) => {
    ctx = offscreen.ctx
    ctx.fillStyle = "white"
    ctx.rect(0, 0, offscreen.canvas.width, offscreen.canvas.height);
    ctx.fill();
    //offscreen.timeOutdraw = setTimeout(()=>{offscreen.needRedraw = 1}, 1000)
}

let myMousePos = {x : 0, y : 0}
MOVE_CAMERA_SPEED = 2.5
let myGUI = undefined

myControlFunction = (event) =>  {
    if (myGUI && myGUI.CheckInput(event))
        return
    if (event.type == "mousemove") {
        myMousePos = {
            x : event.x,
            y : event.y
        }
    }
    if (event.type == "click") {
        mySounds.playSound("click", false, false)
        if (myMapDisplay.clickOnMap(event.x, event.y))
            return
    }
    if (event.type == "keydown") {
        for (var z in myControllersManager.keyDown) {
            var keyPressed = myControllersManager.keyDown[z]
            if (keyPressed == false)
                continue
            switch (z) {
                case ("KeyW"):
                    myMapDisplay.camera.y -= MOVE_CAMERA_SPEED 
                    myMapDisplay.offscreenFloor.needRedraw = true
                    break
                case ("KeyS"):
                    myMapDisplay.camera.y += MOVE_CAMERA_SPEED 
                    myMapDisplay.offscreenFloor.needRedraw = true
                    break
                case ("KeyA"):
                    myMapDisplay.camera.x -= MOVE_CAMERA_SPEED 
                    myMapDisplay.offscreenFloor.needRedraw = true
                    break
                case ("KeyD"):
                    myMapDisplay.camera.x += MOVE_CAMERA_SPEED 
                    myMapDisplay.offscreenFloor.needRedraw = true
                    break
                case ("NumpadAdd"):
                    myMapDisplay.camera.zoom *= 1.05
                    myMapDisplay.offscreenFloor.needRedraw = true
                    break
                case ("NumpadSubtract"):
                    myMapDisplay.camera.zoom *= 0.95
                    myMapDisplay.offscreenFloor.needRedraw = true
                    break
            }
        }
    }
    if (event.type == "wheel") {
        if (event.deltaY > 0) {
            myMapDisplay.camera.zoom *= 1.05
            myMapDisplay.offscreenFloor.needRedraw = true
        }
        else if (event.deltaY < 0) {
            myMapDisplay.camera.zoom *= 0.95
            myMapDisplay.offscreenFloor.needRedraw = true
        }
    }
}


var myMapDisplay = undefined
var myControllersManager = undefined

window.onload = () => {
    myScreen = new MyScreen() //display on the main canvas
    myScreen.addLayerCanvas("back", 0, background)

    myMapDisplay = new MapDisplay(undefined)
    myMapDisplay.offscreenFloor = myScreen.addLayerCanvas("mapDisplay", 1, myMapDisplay.displayMap),
    
    
    guiOffScreen = myScreen.addLayerCanvas("gui", 2, myGuidisplayFunction)   //the offscreen of the GUI
    myControllersManager = new ControllersManager() //mouse/keyboard event
    myControllersManager.onControllerEventFunction = myControlFunction 
    mySounds = new SoundManager()
 //manage all the GUI, interracting with display and controllers manager
    

}

