
class myGUI {
    constructor(id, guiClass, parent) {
        this.uiContainer = document.createElement('div');
        if (guiClass)
            this.uiContainer.className = guiClass
        this.uiContainer.id = id;
        parent.appendChild(this.uiContainer);
    }

    modifyCSS(name, value) {
        this.uiContainer.style[name] = value
    }

    addElement(elementType, id, param, eventsOnElement) {
        const element = document.createElement(elementType);
        element.id = id;
        for (var z in param)
            element[z] = param[z]
        for (var z in eventsOnElement) {
            let e = eventsOnElement[z]
            element.addEventListener(e.eventType, e.functionOnEvent)
        }
        this.uiContainer.appendChild(element);
        return element
    }

    deleteGUI() {
        this.uiContainer.remove()
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
        this.canvas = document.getElementById("fullscreenCanvas")//document.createElement("canvas")
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px"
        this.canvas.style.zIndex = 0
        //this.canvas.id = 
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
        this.id2 = (isNaN(id2) || (id2) < 0) ? undefined : Number(id2)
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
        dx = Number(dx)
        dy = Number(dy)
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
            let newb = undefined
            if (Aid1 == bu.id1) {
                if (!((Aid2 || bu.id2) && Aid2 != bu.id2))
                    newb = new Building(bu.x, bu.y, Bid1, Bid2, bu.r)
                if (Bid1 == undefined)
                    continue
            }
            if (!newb)
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
        localStorage.setItem("mapsave:" + name, str)
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
        houses[z].maxPlace = (isNaN(houses[z].maxPlace) || houses[z].maxPlace < 0) ? 0 : houses[z].maxPlace
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
    }
    currentMap = generatedMap
    console.log("end of generation")
}
let textToDisplayOn_DrawWithmouse_ViewMenu = ""

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
        let mode = currentDrawMode
        let pos = this.getPosFromPixel(x, y)
        let bpos = {x : Math.floor(pos.x), y : Math.floor(pos.y)}
        if (bpos.x < 0 || bpos.y < 0 || bpos.x > 149 || bpos.y > 149) {
            this.clickSelectionfrom = undefined
            return (false)
        }
        if (guiMainMenuSelector == "drawWithMouseMenuGUI") {
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
            if ((mode == "add" || mode == "replace") && !getBuildingTypeFromGUI())
                console.log("unvalid building input")
            else if (hasSelected) {
                if (mode == "view") {   
                    textToDisplayOn_DrawWithmouse_ViewMenu = [
                        "x:" + bpos.x + ", y:" + bpos.y,
                    ]
                    let buildings_view = []
                    for (var z in currentMap.buildings) {
                        let b = currentMap.buildings[z]
                        if (b.x == bpos.x && b.y == bpos.y)
                            buildings_view.push(b)
                    }
                    textToDisplayOn_DrawWithmouse_ViewMenu.push("nb of building : " + buildings_view.length)
                    for (var z in buildings_view) {
                        let b = buildings_view[z]
                        let txt = "-id1:" + b.id1
                        if (b.id2)
                            txt += ", id2:" + b.id2
                        txt += ", r:" + b.r
                        textToDisplayOn_DrawWithmouse_ViewMenu.push(txt)
                    }
                    changeMenuSelector("drawWithMouseMenuGUI")
                }
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
                let blocksFrom = {...this.clickSelectionfrom}
                let blockTo = {...mousepos}
                if (blocksFrom.x > blockTo.x) 
                    blocksFrom.x += 1
                if (blocksFrom.y > blockTo.y) 
                    blocksFrom.y += 1
                let start = this.getPixelFromPos(blocksFrom.x, blocksFrom.y)
                let end = this.getPixelFromPos(blockTo.x, blockTo.y)
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

let guiMainMenuSelector = "mainMenu"


let currentMap = new MapCode()
let mapCopied = undefined

let  mainGUI = undefined

textToDisplayOn_DrawWithmouse_ViewMenu = []

function changeMenuSelector(name) {
    guiMainMenuSelector = name
    if (mainGUI)
        mainGUI.deleteGUI()
    mainGUI = new myGUI("mainGUI", "mainGUI", document.body)
    if (name === "mainMenu")
        mainMenuGUI()
    else if (name === "loadSaveMap")
        saveMenuGUI()
    else if (name === "moveMapMenu")
        moveMapMenu()
    else if (name === "replaceInMapMenu")
        replaceMenuGui()
    else if (name === "drawWithMouseMenuGUI")
        drawWithMouseMenuGUI()
    else if (name === "generateFromBuildingList")
        houseGeneratorMenu()
    else
        return (console.log("no menu found", name))
}

function mainMenuGUI() {
    mainGUI.addElement("h0", "title", {textContent : "DEVAST MAP EDITOR ++", className : "title"}, undefined)
    mainGUI.addElement("h7", "title", {textContent : "unofficial, fan-made, ugly but it work, v1.0"}, undefined)
    //Load Save Map button
    mainGUI.addElement("button", "LoadSaveMapBtn", {textContent : "💾 Save/Load map", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("loadSaveMap")}
    }])
    //load map from text code
    mainGUI.addElement("button", "LoadfromTextCodeBtn", {textContent : "📖 Load map from text", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {currentMap = new MapCode().createFromText(window.prompt("Enter the map codee", "!b=..."))}
    }])
    // new empty map
    mainGUI.addElement("button", "newEmptyMapbtn", {textContent : "✨ new empty map", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {currentMap = new MapCode()}
    }])
    //copy to clipboard
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "📋 Copy to clipboard", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {navigator.clipboard.writeText(buildingsListToTxt(currentMap.buildings), window.alert("map copied"))}
    }])

    mainGUI.addElement("h7", undefined, {textContent : "---"}, undefined)

    //move Map Menu
    mainGUI.addElement("button", "moveMapMenudBtn", {textContent : "Move map ← ↑ → ↓", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("moveMapMenu")}
    }])

    //replace in map Menu
    mainGUI.addElement("button", "replaceInMapMenuBtn", {textContent : "Replace in map 🔄", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("replaceInMapMenu")}
    }])

    //draw with mouse menu
    mainGUI.addElement("button", "replaceInMapMenuBtn", {textContent : "Draw with mouse 🖱️", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("drawWithMouseMenuGUI")}
    }])

    //generate from building list
    mainGUI.addElement("button", "generateFromBuildingList", {textContent : "Generate from Building List 🏗️", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("generateFromBuildingList")}
    }])
}


//SAVE MAP MENU

let locallySavedMap = []

function loadAllSavedMap() {
    locallySavedMap = []
    for (var z in localStorage) {
        if (z.startsWith("mapsave:")) {
            locallySavedMap.push({
                name : z.replace("mapsave:", ""),
            })
        }
    }
}

function saveMenuGUI() {
    mainGUI.addElement("h0", "title", {textContent : "Map Locally saved", className : "title"}, undefined)
    mainGUI.addElement("h7", "textDescription", {textContent : "save or load map (on your browser local storage)"}, undefined)

    //return button
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "🔙 return", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("mainMenu")}
    }])

    //save current map
    const saveCurrentMapContainer = new myGUI("saveCurrentMapContainer", "secondary-container", mainGUI.uiContainer)
    saveCurrentMapContainer.addElement("input", "saveCurrentMapTxt", {type : "text"}, undefined)
    saveCurrentMapContainer.addElement("button", "saveCurrentMapBtn", {textContent : "save as", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {currentMap.saveToLocalStorage(document.getElementById("saveCurrentMapTxt").value);changeMenuSelector("loadSaveMap")}
    }])

    loadAllSavedMap()
    for (var z in locallySavedMap) {
        let map = locallySavedMap[z]
        const savedMapContainer = new myGUI("savedMapContainer:" + map.name, "secondary-container", mainGUI.uiContainer)
        savedMapContainer.addElement("button", "loadSavedMap:" + map.name, {textContent : "load", className : "mainButton"}, [{
            eventType : "click",
            functionOnEvent : () => {currentMap.LoadFromLocalStorage("mapsave:" + map.name)}
        }])
        savedMapContainer.addElement("button", "deleteSavedMap:" + map.name, {textContent : "delete", className : "mainButton"}, [{
            eventType : "click",
            functionOnEvent : () => {localStorage.removeItem("mapsave:" + map.name);changeMenuSelector("loadSaveMap")}
        }])
        savedMapContainer.addElement("label", "savedmapLabel:map.name", {className : "labelType1" ,textContent : map.name, for : "deleteSavedMap:" + map.name}, undefined)
    }


}


//Move Map Menu

let moveMapInput = {
    x : 0,
    y : 0,
}

function updateMoveeMapInputXYLabelValue(value) {
    if (value.x) {
        let x = value.x
        moveMapInput.x = x
        const xLabel = document.getElementById("moveMapInputXlabel")
        if (xLabel)
            xLabel.textContent = "move X : " + moveMapInput.x
        const xRange = document.getElementById("moveMapInputX")
        if (xRange)
            xRange.value = x
    }
    if (value.y) {
        let y = value.y
        moveMapInput.y = y
        const yLabel = document.getElementById("moveMapInputYlabel")
        if (yLabel)
            yLabel.textContent = "move Y : " + moveMapInput.y
        const yRange = document.getElementById("moveMapInputY")
        if (yRange)
            yRange.value = y
    }
}

function moveMapMenu () {
    mainGUI.addElement("h0", "title", {textContent : "Move Map", className : "title"}, undefined)
    mainGUI.addElement("h7", "textDescription", {textContent : "Relocate all entities on the map in the x and y directions."}, undefined)
    mainGUI.addElement("h7", "textDescription", {textContent : "Entities moved outside the map limite [0;149] are deleted"}, undefined)

    //apply the move button
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "↔ Perform Movement ↕", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {applyMove()}
    }])
    //moving X axis input
    mainGUI.addElement("label", "moveMapInputXlabel", {textContent : "move X : " + moveMapInput.x, for : "moveMapInputX"}, undefined)
    mainGUI.addElement("input", "moveMapInputX", {type : "range", min : "-149", max : "149", value : moveMapInput.x}, [{
        eventType : "input",
        functionOnEvent : (e) => {updateMoveeMapInputXYLabelValue({x : e.target.value})}
    }])

    //moving Y axis input
    mainGUI.addElement("label", "moveMapInputYlabel", {textContent : "move Y : " + moveMapInput.y, for : "moveMapInputY"}, undefined)
    mainGUI.addElement("input", "moveMapInputY", {type : "range", min : "-149", max : "149", value : moveMapInput.y}, [{
        eventType : "input",
        functionOnEvent : (e) => {updateMoveeMapInputXYLabelValue({y : e.target.value})}
    }])

    const moveMapTopBotLeftRightGUI = new myGUI("movemapGUI", "mainGUI", mainGUI.uiContainer)
    moveMapTopBotLeftRightGUI.modifyCSS("position", "sticky")
    moveMapTopBotLeftRightGUI.addElement("button", "topLeftButton", {textContent : "top left ← ↑", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {setToCorner("min", "min");updateMoveeMapInputXYLabelValue({x : moveMapInput.x, y : moveMapInput.y})}
    }])
    moveMapTopBotLeftRightGUI.addElement("button", "topRightButton", {textContent : "top right ↑ →", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {setToCorner("max", "min");updateMoveeMapInputXYLabelValue({x : moveMapInput.x, y : moveMapInput.y})}
    }])
    moveMapTopBotLeftRightGUI.addElement("button", "botLeftButton", {textContent : "bot left ← ↓", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {setToCorner("min", "max");updateMoveeMapInputXYLabelValue({x : moveMapInput.x, y : moveMapInput.y})}
    }])
    moveMapTopBotLeftRightGUI.addElement("button", "bottButton", {textContent : "bot right ↓ →", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {setToCorner("max", "max");updateMoveeMapInputXYLabelValue({x : moveMapInput.x, y : moveMapInput.y})}
    }])

    //return button
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "🔙 return", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("mainMenu")}
    }])
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
    }
    changeMenuSelector("moveMapMenu")
}

//REPLACE MAP

let replaceMapInput = {
    Aid1 : 0,
    Aid2 : undefined,
    Bid1 : -1,
    Bid2 : undefined
}

applyReplaceMap = () => {
    let Aid1 = document.getElementById("buildingReplaceFromAid1").value
    let Aid2 = document.getElementById("buildingReplaceFromAid2").value
    let Bid1 = document.getElementById("buildingReplaceToBid1").value
    let Bid2 = document.getElementById("buildingReplaceToBid2").value

    if (Aid1 == "" || isNaN(Aid1))
        return console.log("ApplyReplaceMap invalide input", Aid1, Aid2, Bid1, Bid2)
    if (Bid1 == "" || isNaN(Bid1))
        Bid1 = undefined
    Aid2 = (Aid2 == "" || isNaN(Aid2)) ? undefined : Aid2
    Bid2 = (Bid2 == "" || isNaN(Bid2)) ? undefined : Bid2
    currentMap.replaceMap(Aid1, Aid2, Bid1, Bid2)
}

replaceMenuGui = () => {
    mainGUI.addElement("h0", "title", {textContent : "Replace In Map", className : "title"}, undefined)
    mainGUI.addElement("h7", "textDescription", {textContent : "replace a building type by another type"}, undefined)

    //box where "replace from" and "by" are placed
    const secondaryContainer = new myGUI("buildingReplaceFrom", "secondary-container", mainGUI.uiContainer)

    //the building type input to replace
    const buildingReplaceFrom = new myGUI("buildingReplaceFrom", "childui", secondaryContainer.uiContainer)
    buildingReplaceFrom.modifyCSS("position", "sticky")
    buildingReplaceFrom.modifyCSS("className","childui")

    buildingReplaceFrom.addElement("h6", "textDescription", {textContent : "replace : "}, undefined)
    //aid1
    buildingReplaceFrom.addElement("label", "buildingReplaceFromAid1label", {textContent : "id1", for : "buildingReplaceFromAid1"}, undefined)
    buildingReplaceFrom.addElement("input", "buildingReplaceFromAid1", {type : "text", size : "3"}, undefined)
    //aid2
    buildingReplaceFrom.addElement("label", "buildingReplaceFromAid2label", {textContent : "id2", for : "buildingReplaceFromAid2"}, undefined)
    buildingReplaceFrom.addElement("input", "buildingReplaceFromAid2", {type : "text", size : "3"}, undefined)

    //replacing by...
    const buildingReplaceTo = new myGUI("buildingReplaceTo", "childui", secondaryContainer.uiContainer)
    buildingReplaceTo.modifyCSS("position", "sticky")
    buildingReplaceTo.modifyCSS("className","childui")

    buildingReplaceTo.addElement("h6", "textDescription", {textContent : "by : "}, undefined)
    //bid1
    buildingReplaceTo.addElement("label", "buildingReplaceToBid1label", {textContent : "id1", for : "buildingReplaceToAid1"}, undefined)
    buildingReplaceTo.addElement("input", "buildingReplaceToBid1", {type : "text", size : "3"}, undefined)
    //bid2
    buildingReplaceTo.addElement("label", "buildingReplaceToBid2label", {textContent : "id2", for : "buildingReplaceToAid2"}, undefined)
    buildingReplaceTo.addElement("input", "buildingReplaceToBid2", {type : "text", size : "3"}, undefined)

    //apply replacement
    mainGUI.addElement("button", "applyReplacement", {textContent : "🔄 Apply replacement", className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {applyReplaceMap()}
    }])

    //return button
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "🔙 return", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("mainMenu")}
    }])
}


//DRAW WITH MOUSE MENU

let mouseDrawModeList = ["view" ,"add", "delete", "replace", "copy", "past"]
let currentDrawMode = "view"
let mouseSelectorList = ["point", "rect"]
let mouseSelectorId = 0
let buildingTypeSeleced = {
    id1 : 0,
    id2 : "",
    r : 0
}

function getBuildingTypeFromGUI () {
    let id1 = document.getElementById("guiId1_txtinput")
    let id2 = document.getElementById("guiId2_txtinput")
    let idr = document.getElementById("guiIdR_txtinput")

    if (!id1 || !id2 || !idr)
        return false
    id1 = id1.value
    id2 = id2.value
    idr = idr.value
    if (isNaN(id1))
        return false
    if (isNaN(idr))
        idr = 0
    buildingTypeSeleced = {
        id1 : id1,
        id2 : id2,
        r : idr
    }
    return true
}

function drawWithMouseMenuGUI () {
    mainGUI.addElement("h0", "title", {textContent : "Draw with mouse", className : "title"}, undefined)
    mainGUI.addElement("h7", "textDescription", {textContent : "Edit your map"}, undefined)
    if (currentDrawMode == "copy")
        mouseSelectorId = mouseSelectorList.indexOf("rect")
    if (currentDrawMode == "past" || currentDrawMode == "view")
        mouseSelectorId = mouseSelectorList.indexOf("point")

    //SELECT MODE FOR DRAWING
    //create a select element
    const select_element = document.createElement("select")
    select_element.id = "mouseMode_select"
    for (var z in mouseDrawModeList) {  //add option (line) for each mode
        const newOption = document.createElement('option');
        newOption.value = mouseDrawModeList[z]
        newOption.textContent = mouseDrawModeList[z]
        if (mouseDrawModeList[z] == currentDrawMode)
            newOption.selected = true
        select_element.appendChild(newOption)
    }
    mainGUI.uiContainer.appendChild(select_element)
    select_element.addEventListener('change', () => {
        currentDrawMode = select_element.value
        changeMenuSelector("drawWithMouseMenuGUI")
    });

    if (currentDrawMode == "view") {
        for (var z in textToDisplayOn_DrawWithmouse_ViewMenu) {
            mainGUI.addElement("h7", "textDescription", {textContent : textToDisplayOn_DrawWithmouse_ViewMenu[z]}, undefined)
        }
    }
    let mouseSelectorMode = mouseSelectorList[mouseSelectorId]
    //mouse selector mode button
    let butonTxt = mouseSelectorMode == "point" ? "mouse selector • point" : "mouse selector □ rectangle"
    mainGUI.addElement("button", "selectorModeButton", {textContent : butonTxt, className : "mainButton"}, [{
        eventType : "click",
        functionOnEvent : () => {
            mouseSelectorId = (mouseSelectorId + 1) % mouseSelectorList.length;
            mouseSelectorMode = mouseSelectorList[mouseSelectorId];
            changeMenuSelector("drawWithMouseMenuGUI")}
    }])

    //the building type 
    if (currentDrawMode == "add" || currentDrawMode == "replace") {
        const buildingTypeGui = new myGUI("buildingTypeGui", "secondary-container", mainGUI.uiContainer)
        //id1
        const guiId1 = new myGUI("bguiId1", "childui", buildingTypeGui.uiContainer)
        guiId1.modifyCSS("position", "sticky")
        guiId1.modifyCSS("className","childui")
        guiId1.addElement("label", "guiId1_txtinput_label", {textContent : "id1", for : "guiId1_txtinput"}, undefined)
        guiId1.addElement("input", "guiId1_txtinput", {type : "text", size : "3", value : buildingTypeSeleced.id1}, undefined)
        //bid2
        const guiId2 = new myGUI("bguiId2", "childui", buildingTypeGui.uiContainer)
        guiId2.modifyCSS("position", "sticky")
        guiId2.modifyCSS("className","childui")
        guiId2.addElement("label", "guiId2_txtinput_label", {textContent : "id2", for : "guiId2_txtinput"}, undefined)
        guiId2.addElement("input", "guiId2_txtinput", {type : "text", size : "3", value : buildingTypeSeleced.id2}, undefined)
        //rotation
        const guiIdR = new myGUI("bguiIdR", "childui", buildingTypeGui.uiContainer)
        guiIdR.modifyCSS("position", "sticky")
        guiIdR.modifyCSS("className","childui")
        guiIdR.addElement("label", "guiIdR_txtinput_label", {textContent : "rot", for : "guiIdR_txtinput"}, undefined)
        guiIdR.addElement("input", "guiIdR_txtinput", {type : "text", size : "3", value : buildingTypeSeleced.r}, undefined)
    }



    //return button
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "🔙 return", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("mainMenu")}
    }])
}

//GENRATE FROM HOUSE LIST

let houseToGenList = []
let maxTryGenHouse = 1000
let maxHouseToGen = 50

let exclusionZone = []
let minDistBetweenHouse = 0
let placeHousesEveryX = 1
let placeHousesEveryY = 1

addHouseGen = (name) => {
    name = (!name) ? "house" + houseToGenList.length : name
    let house = new House(window.prompt("enter house map code", "!b=..."), 1, name)
    houseToGenList.unshift(house)
}

addExcluZone = (ax, ay, bx, by) => {
    let exzone = new ExclusionZone(ax, ay, bx, by)
    exclusionZone.push(exzone)
}

houseGeneratorMenu = () => {
    mainGUI.addElement("h0", "title", {textContent : "Generate From Building List", className : "title"}, undefined)

    //Generate button
    if (houseToGenList.length > 0)
        mainGUI.addElement("button", "GenerateHouseMap", {textContent : "🏗️ Generate", className : "mainButton"}, [{
            eventType : "click",
            functionOnEvent : () => {generateMapFromHouse(houseToGenList, maxTryGenHouse, maxHouseToGen, minDistBetweenHouse)}
        }])
    
    mainGUI.addElement("h5", undefined, {textContent : "Settings"})
    //nb max of try input
    mainGUI.addElement("label", "maxTryGenHouseInputlabel", {textContent : "number of placement attempts", for : "maxTryGenHouseInput"}, undefined)
    mainGUI.addElement("input", "maxTryGenHouseInput", {type : "text", lenght : 6, value : maxTryGenHouse}, [{
        eventType : "input",
        functionOnEvent : (e) => {maxTryGenHouse = e.target.value}
    }])

    //nb max of building
    mainGUI.addElement("label", "maxHouseToGenInputlabel", {textContent : "max number of successfull placement", for : "maxHouseToGenInput"}, undefined)
    mainGUI.addElement("input", "maxHouseToGenInput", {type : "text", lenght : 6, value : maxHouseToGen}, [{
        eventType : "input",
        functionOnEvent : (e) => {maxHouseToGen = e.target.value}
    }])

    //minimal distance between house
    mainGUI.addElement("label", "minDistBetweenHouselabel", {textContent : "minimal distance between house : " + minDistBetweenHouse, for : "minDistBetweenHouseInput"}, undefined)
    mainGUI.addElement("input", "minDistBetweenHouseInput", {type : "range", min : "0", max : "147", value : minDistBetweenHouse}, [{
        eventType : "input",
        functionOnEvent : (e) => {
            minDistBetweenHouse = e.target.value
            const label = document.getElementById("minDistBetweenHouselabel")
            label.textContent = "minimal distance between house : " + minDistBetweenHouse
            const inputrange = document.getElementById("minDistBetweenHouseInput")
            inputrange.value = minDistBetweenHouse
        }
    }])

    //place house X and Y step
    mainGUI.addElement("label", "placeHousesEveryXlabel", {textContent : "place house every X block : " + placeHousesEveryX, for : "placeHousesEveryXInput"}, undefined)
    mainGUI.addElement("input", "placeHousesEveryXInput", {type : "range", min : "1", max : "149", value : placeHousesEveryX}, [{
        eventType : "input",
        functionOnEvent : (e) => {
            placeHousesEveryX = e.target.value
            const label = document.getElementById("placeHousesEveryXlabel")
            label.textContent = "place house every X block : " + placeHousesEveryX
            const inputrange = document.getElementById("placeHousesEveryXInput")
            inputrange.value = placeHousesEveryX
        }
    }])
    mainGUI.addElement("label", "placeHousesEveryYlabel", {textContent : "place house every Y block : " + placeHousesEveryY, for : "placeHousesEveryYInput"}, undefined)
    mainGUI.addElement("input", "placeHousesEveryYInput", {type : "range", min : "1", max : "149", value : placeHousesEveryY}, [{
        eventType : "input",
        functionOnEvent : (e) => {
            placeHousesEveryY = e.target.value
            const label = document.getElementById("placeHousesEveryYlabel")
            label.textContent = "place house every Y block : " + placeHousesEveryY
            const inputrange = document.getElementById("placeHousesEveryYInput")
            inputrange.value = placeHousesEveryY
        }
    }])

    mainGUI.addElement("h5", undefined, {textContent : "Building List"})
    //add building to the list
    const addBuildingContainer = new myGUI("addBuildingContainer", "secondary-container", mainGUI.uiContainer)

    addBuildingContainer.addElement("input", "addBuildingNameInput", {type : "text", placeholder : "building name"}, undefined)
    addBuildingContainer.addElement("button", "addExclusionZoneButton", {textContent : "add", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {addHouseGen(document.getElementById("addBuildingNameInput").value);changeMenuSelector("generateFromBuildingList")}
    }])
    
    //building list
    for (var z in houseToGenList) {
        let b = houseToGenList[z]
        const buildingToGenerateContainer = new myGUI("buildingToGenerateContainer:" + z, "containerHorizontal", mainGUI.uiContainer)
        buildingToGenerateContainer.uiContainer.style.gap = "1%"
        buildingToGenerateContainer.addElement("label", "savedmapLabel:" + z, {className : "labelType1" ,textContent : (!b.name) ? "-noName" : "-" + b.name + " ", for : "remove:" + z}, undefined)
        buildingToGenerateContainer.addElement("button", "remove:" + z, {textContent : "remove", className : "secondary-button"}, [{
            eventType : "click",
            functionOnEvent : () => {
                b.dead = true;
                houseToGenList = houseToGenList.filter((h) => {return h.dead != true})
                changeMenuSelector("generateFromBuildingList")
            }
        }])
        buildingToGenerateContainer.addElement("label", "savedmapLabel:" + z, {className : "labelType1" ,textContent : "max placement : ", for : "houseMaxPlacementInput" + z}, undefined)
        buildingToGenerateContainer.addElement("input", "houseMaxPlacementInput" + z, {type : "text", value : b.maxPlace}, [{
            eventType : "input",
            functionOnEvent : (e) => {b.maxPlace = e.target.value}
        }]
        )
    
    }

    //Exclusion zone
    //add exclusion zone
    mainGUI.addElement("h5", undefined, {textContent : "Exclusion Zones"})
    const exclusionZoneInputContainer = new myGUI("exclusionZoneInputContainer", "containerHorizontal", mainGUI.uiContainer)
    exclusionZoneInputContainer.addElement("label", undefined, {textContent : "from XY : ", for : "ExcluZoneInputAX"})
    exclusionZoneInputContainer.addElement("input", "ExcluZoneInputAX", {type : "text"}, undefined)
    exclusionZoneInputContainer.addElement("input", "ExcluZoneInputAY", {type : "text"}, undefined)
    exclusionZoneInputContainer.addElement("label", undefined, {textContent : "to XY : ", for : "ExcluZoneInputBX"})
    exclusionZoneInputContainer.addElement("input", "ExcluZoneInputBX", {type : "text"}, undefined)
    exclusionZoneInputContainer.addElement("input", "ExcluZoneInputBY", {type : "text"}, undefined)
    exclusionZoneInputContainer.addElement("button", "AddExclusionZoneButton", {className : "secondary-button", textContent : "add"}, [{
        eventType : "click",
        functionOnEvent : () => {
            let ax = document.getElementById("ExcluZoneInputAX").value
            let ay = document.getElementById("ExcluZoneInputAY").value
            let bx = document.getElementById("ExcluZoneInputBX").value
            let by = document.getElementById("ExcluZoneInputBY").value
            addExcluZone(ax, ay, bx, by)
            changeMenuSelector("generateFromBuildingList")
        }
    }])
    //exclusion zone list
    if (exclusionZone.length > 0)
        mainGUI.addElement("h6", undefined, {textContent : "dont place building in these zone : "})
    for (var z in exclusionZone) {
        let zone = exclusionZone[z]
        const excluZoneContainer = new myGUI("exclusionZoneInputContainer", "containerHorizontal", mainGUI.uiContainer)
        let text = "-from [" + zone.ax + ":" + zone.ay + "] to [" + zone.bx + ":" + zone.by + "]"
        excluZoneContainer.addElement("label", undefined, {className : "labelType1" ,textContent : text, for : "removeExcluZone:" + z}, undefined)
        excluZoneContainer.addElement("button", "removeExcluZone:" + z, {textContent : "remove", className : "secondary-button"}, [{
            eventType : "click",
            functionOnEvent : () => {
                zone.dead = true;
                exclusionZone = exclusionZone.filter((h) => {return h.dead != true})
                changeMenuSelector("generateFromBuildingList")
            }
        }])
    }

    //return button
    mainGUI.addElement("button", "copyToClipoardBtn", {textContent : "🔙 return", className : "secondary-button"}, [{
        eventType : "click",
        functionOnEvent : () => {changeMenuSelector("mainMenu")}
    }])
}

/*

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




*/
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

myControlFunction = (event) =>  {

    const guiElementToIgnore = document.getElementById('mainGUI');
    if (guiElementToIgnore && event.target.closest('#mainGUI'))
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
    
    myControllersManager = new ControllersManager() //mouse/keyboard event
    myControllersManager.onControllerEventFunction = myControlFunction 
    mySounds = new SoundManager()
 //manage all the GUI, interracting with display and controllers manager
    
    changeMenuSelector("mainMenu");
}

