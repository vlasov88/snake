var model = {
    python: {
        dir: 1,
        coords: [
            // [0, 9],
            // [0, 8],
            // [0, 7],
            // [0, 6],
            // [0, 5],
            // [0, 4],
            // [0, 3],
            [0, 2],
            [0, 1],
            [0, 0]
        ],
        eatenRuby: []
    },
    ruby: {
        coords: [10, 10]
    },
    field: {
        width: 60,
        height: 10
    },
    move: function () {
        //console.log("move");
        var headCoord = this.python.coords[0].slice();
        if (this.python.dir === 0) {
            //вверх
            headCoord[0] = headCoord[0] === 0 ? this.field.height - 1 : headCoord[0] - 1;
        } else if (this.python.dir === 1) {
            //вправо
            headCoord[1] = headCoord[1] === this.field.width - 1 ? 0 : headCoord[1] + 1;
        } else if (this.python.dir === 2) {
            //вниз
            headCoord[0] = headCoord[0] === this.field.height - 1 ? 0 : headCoord[0] + 1;
        } else if (this.python.dir === 3) {
            //влево
            headCoord[1] = headCoord[1] === 0 ? this.field.width - 1 : headCoord[1] - 1;
        }
        // запомним хвост на случай добавления нового элемента
        var tail = this.python.coords[this.python.coords.length - 1].slice();
        //остальные элементы сместить
        for (var i = this.python.coords.length - 2; i >= 0; i--) {
            //console.log(("Copy " + i) + " (" + this.python.coords[i] +") to " + (i+1) + " (" + this.python.coords[i + 1] + ")") ;
            this.python.coords[i + 1] = this.python.coords[i].slice();
        }
        this.python.coords[0] = headCoord;

        // передвинуть съеденные рубины (в обратном порядке чтобы легко удалять)
        //console.log("===========Съеденных: " + this.python.eatenRuby.length);
        for (var i = this.python.eatenRuby.length - 1; i >= 0; i--) {
            //console.log("Съеденный: " + i);
            //console.log("Длина: " + this.python.coords.length);
            if (this.python.eatenRuby[i] === this.python.coords.length) {
                // из съеденного получаем новый элемент питона
                this.python.coords.push(tail);
                this.python.eatenRuby.splice(i, 1);
            } else {
                this.python.eatenRuby[i]++;
            }
        }

        // проверим что не врезались (координаты не сопали)
        for (var i = 0; i < this.python.coords.length - 2; i++) {
            for (var j = i + 1; j < this.python.coords.length - 1; j++) {
                if (this.python.coords[i][0] === this.python.coords[j][0] && this.python.coords[i][1] === this.python.coords[j][1]) {
                    this.gameover();
                }
            }
        }

        // проверим что съели новый рубин
        if (headCoord[0] === this.ruby.coords[0] && headCoord[1] === this.ruby.coords[1]) {
            // "съесть" текущий
            this.python.eatenRuby.push(0); //номер текущего элемента
            // выставить новый
            this.ruby.coords = this.generateNewRuby(this.python.coords);
        }
        view.render(this.python, this.ruby, this.field.text);
    },
    generateNewRuby: function (pythonCoords) {
        var w, h;
        do {
            w = Math.floor(Math.random() * this.field.width);
            h = Math.floor(Math.random() * this.field.height);
        } while (this.checkRuby(w, h, pythonCoords));
        return [h, w];
    },
    checkRuby: function (w, h, pythonCoords) {
        //проверяет что координаты рубина не пересекаются с питоном
        for (var i = 0; i < pythonCoords.length; i++) {
            if (pythonCoords[i][0] === h && pythonCoords[i][1] === w) {
                return true;
            }
        }
        return false;
    },
    /**
     * Инициализировать модель
     * @param {{height: number, width: number}} fieldSize  размеры поля
     */
    init: function (fieldSize) {
        // TODO здесь теперь не текст а размер

        this.field.text = text;
        this.field.height = text.split('\n').length - 1; //Последнюю строку пока не берем, т.к. возможно не полная.
        view.render(this.python, this.ruby, this.field.text);
    },
    left: function () {
        this.python.dir--;
        if (this.python.dir === -1) {
            this.python.dir = 3;
        }
    },
    rigth: function () {
        this.python.dir++;
        if (this.python.dir === 4) {
            this.python.dir = 0;
        }
    },
    gameover: function () {
        controller.gameover();
        view.gameover();
    }

};


var view = {
    pythonView: {
        horz: '═',
        vert: '║',
        tango: {
            forward: '╔',
            backward: '╝'
        },
        waltz: {
            forward: '╗',
            backward: '╚'
        },
        getPythonChar: function (python, i) {
            // Функция возвращает представление конкретного элемента питона
            var char = this.horz;
            if (i === 0) {
                // Первый элемент, сравнить только со вторым
                char = python.coords[0][0] === python.coords[1][0] ? this.horz : this.vert;
            } else if (i === python.coords.length - 1) {
                // Последний элемент, сравнить только с предыдущим
                char = python.coords[i - 1][0] === python.coords[i][0] ? this.horz : this.vert;
            } else {
                // Средний элемент, надо учитывать и предыдущий и следующий
                if (python.coords[i - 1][0] === python.coords[i + 1][0]) {
                    char = this.horz;
                } else if (python.coords[i - 1][1] === python.coords[i + 1][1]) {
                    char = this.vert;
                } else {
                    // Это угловой элемент. Определим диагональ между предыдущим и следующим.  Правая - "танго", левая - "вальс".
                    // Определим какой элемент находится ниже, а какой выше.
                    var upper;
                    var lower;
                    if (python.coords[i - 1][0] < python.coords[i + 1][0]) {
                        upper = i - 1;
                        lower = i + 1;
                    } else {
                        upper = i + 1;
                        lower = i - 1;
                    }
                    // Если различие больше чем на 1, то это проход через край и надо интерпретировать наоборот.
                    if (python.coords[lower][0] - python.coords[upper][0] !== 1) {
                        upper = upper + lower;
                        lower = upper - lower;
                        upper = upper - lower;
                    }
                    // Определим верхний правее или левее (правее - "танго", левее - "вальс").
                    var diagonale = python.coords[upper][1] < python.coords[lower][1] ? 'waltz' : 'tango';
                    // Если различие больше чем на 1, то это проход через край и надо интерпретировать наоборот.
                    if (Math.abs(python.coords[upper][1] - python.coords[lower][1]) !== 1) {
                        if (diagonale === 'waltz') {
                            diagonale = 'tango';
                        } else {
                            diagonale = 'waltz';
                        }
                    }
                    var dance = diagonale === 'waltz' ? this.waltz : this.tango;
                    // Определим движение танца - "вперед" или "назад".
                    // Если верхний элемент с текущим на горизонтали, то это "вперед"
                    char = python.coords[upper][0] === python.coords[i][0] ? dance.forward : dance.backward;
                }
            }
            if (python.eatenRuby.indexOf(i) !== -1) {
                // Обозначим элемент со съеденным рубином
                return '<span style="color: #ff0000">' + char + '</span>';
            } else {
                return '<span style="color: #00ff00">' + char + '</span>';
            }
        }
    },

    /** Элемент с полем */
    field,

    /**
     * Инициализация представления
     * @param {{height: number, width: number}} fieldSize  размеры поля
     */
    init: function (fieldSize) {
        this.field = document.getElementById('field');
        // Создаем поле
        for (var h = 0; h < fieldSize.height; h++) {
            var line = document.createElement('div');
            line.id = 'line' + h;
            line.classList.add('line');
            for (var w = 0; w < fieldSize.width; w++) {
                var cell = document.createElement('div');
                cell.id = 'cell' + h + '-' + w;
                cell.classList.add('cell');
                line.appendChild(cell);
            }
            this.field.appendChild(line);
        }

    },

    matrixToText: function (matrix) {
        // console.log(typeof matrix);
        for (var i = 0; i < matrix.length; i++) {
            matrix[i] = matrix[i].join('');
        }
        // console.log(typeof matrix);
        return matrix.join('\n');
    },
    textToMatrix: function (text) {
        var matrix = text.split('\n');
        for (var i = 0; i < matrix.length; i++) {
            matrix[i] = matrix[i].split('');
        }
        return matrix;
    },
    /**
     *
     * @param python
     * @param ruby
     * @param text
     */
    render: function (python, ruby, text) {
        //TODO инициализировать сразу поле во view, не нужно передавать модели. Т.к. это фактически "скин"
        // Разобьем текст на двумерный массив символов
        textMatrix = this.textToMatrix(text);
        // обозначить python
        for (var i = 0; i < python.coords.length; i++) {
            textMatrix[python.coords[i][0]][python.coords[i][1]] = this.pythonView.getPythonChar(python, i);
        }
        // обозначить ruby
        textMatrix[ruby.coords[0]][ruby.coords[1]] = '<span style="color: #ff0000">' + ruby.char + '</span>';
        // найти pre и установить новый текст
        document.getElementById('textField').innerHTML = this.matrixToText(textMatrix);
    },
    gameover: function () {
        // Отобразить текст, что игра закончилась
        alert('Конец игры');
    }
};

var controller = {
    timer: '',
    init: function () {
        this.timer = setInterval(this.moveTimer, 200);
    },
    moveTimer: function () {
        model.move();
    },
    gameover: function () {
        clearTimeout(this.timer);
    }
};

window.onload = init;

function init() {
    var fieldSize = {height: 15, width: 15};
    view.init(fieldSize);
    model.init(fieldSize);
    controller.init();
}

function left() {
    model.left();
}

function rigth() {
    model.rigth();
}


// replaceCharAt: function(text, position, char) {
//     return text.substr(0, position) + char + text.substr(position + 1);
// },


// //textMatrix: [],
// markAtCoord: function(text, coord, char) {
//     return replaceCharAt(text, findPosition(text, coord), char);
// },

//     findPosition: function(text, coord) {
//     var position = 0;
//     // разделим на массив строк
//     var strings = text.split("\n");
//     for (var i = 0; i < coord[0]; i++) {
//         position = position + strings[i].length + 1; // +1 символ перевода строки
//     }
//     position = position + coord[1];
//     return position;
// },
