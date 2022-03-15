const { createCanvas } = require('canvas');

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const generateGradient = (width, height, color1, color2, angle) => {
    // console.log(width, height, color1, color2, angle);

    if (!width || !height || !color1 || !color2 || !angle) {
        return console.log(
            'Error: Parameters missing: width(px) height(px) color1(hex) color2(hex) angle(º)'
        );
    }

    // Sets parameters
    const size = [width, height];
    const colors = [color1, color2];

    // Degrees to radians
    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    // Returns coordinates of two lines that define the gradient line
    function gradientLineXY(width, height, angle) {
        var sin_angle = Math.sin(toRadians(angle));
        var cos_angle = Math.cos(toRadians(angle));
        var lineLength = Math.abs(
            width * sin_angle + Math.abs(height * cos_angle)
        );
        var xy_center = [width / 2, height / 2];
        return [
            xy_center[0] - cos_angle * 0.51 * lineLength,
            xy_center[1] - sin_angle * 0.51 * lineLength,
            xy_center[0] + cos_angle * 0.51 * lineLength,
            xy_center[1] + sin_angle * 0.51 * lineLength
        ];
    }

    var canvas = createCanvas(...size, 'png');

    var ctx = canvas.getContext('2d');

    // x0, y0, x1, y1
    const grd = ctx.createLinearGradient(...gradientLineXY(...size, angle));

    grd.addColorStop(0, colors[0]);
    grd.addColorStop(1, colors[1]);

    ctx.fillStyle = grd;

    ctx.fillRect(0, 0, ...size);

    var buf = canvas.toBuffer();
    return buf;
    //fs.writeFileSync(colors[0] + '_' + colors[1] + '_' + angle + '.png', buf);
};

module.exports = { getRandomColor, generateGradient, getRandomInt };
