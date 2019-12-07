var windDirectioin = function (degree) {
    // console.log(degree);
    var direction = "";
    if (degree > 22.5 && degree <= 67.5) { //东北风
        direction = "东北";
    }
    else if (degree > 67.5 && degree <= 112.5) { //东风
        direction = "东";
    }
    else if (degree > 112.5 && degree <= 157.5) { //东南风
        direction = "东南";
    }
    else if (degree > 157.5 && degree <= 202.5) { //南风
        direction = "南";
    }
    else if (degree > 202.5 && degree <= 247.5) {//西南风
        direction = "西南";
    }
    else if (degree > 247.5 && degree <= 292.5) { //西风
        direction = "西";
    }
    else if (degree > 292.5 && degree <= 337.5) { //西北风
        direction = "西北";
    }
    else if (degree > 337.5 || degree <= 22.5) { //北风
        direction = "北";
    }
    return direction;
}