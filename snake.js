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
            view.addCounter();
            // "съесть" текущий
            this.python.eatenRuby.push(0); //номер текущего элемента
            // выставить новый
            this.ruby.coords = this.generateNewRuby(this.python.coords);
        }
        view.render(this.python.coords, this.ruby.coords);
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
        this.field.height = fieldSize.height;
        this.field.width = fieldSize.width;
        view.render(this.python.coords, this.ruby.coords);
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

    /** Элемент с полем */
    field: null,

    /** Имя класса ячейки */
    cellClassName: 'cell',

    /** Имя класса рубина */
    rubyClassName: 'ruby',

    /** Имя класса змейки */
    pythonClassName: 'python',

    /** Счетчик очков */
    counter: 0,

    /** Элемент счетчика очков */
    counterElem: null,

    /**
     * Инициализация представления
     * @param {Node} field                                 поле
     * @param {{height: number, width: number}} fieldSize  размеры поля
     * @param {Node} counter                               элемент счетчика очков
     */
    init: function (field, fieldSize, counter) {
        this.field = field;
        this.counterElem = counter;
        // Создаем поле
        for (var h = 0; h < fieldSize.height; h++) {
            var line = document.createElement('div');
            line.id = 'line' + h;
            line.classList.add('line');
            for (var w = 0; w < fieldSize.width; w++) {
                var cell = document.createElement('div');
                cell.id = this.coordsToId(h, w);
                cell.classList.add(this.cellClassName);
                line.appendChild(cell);
            }
            this.field.appendChild(line);
        }

    },

    /**
     * Отрисовать змейку и рубин на поле
     * @param {[[number]]} pythonCoords координаты змейки
     * @param {[number]} rubyCoords     координаты рубина
     */
    render: function (pythonCoords, rubyCoords) {
        var cells = this.field.getElementsByClassName(this.cellClassName);
        // Очищаем все ячейки
        for (var i = 0; i < cells.length; i++) {
            cells[i].classList.remove(this.rubyClassName, this.pythonClassName);
        }
        // Отрисовываем рубин
        document.getElementById(this.coordsToId(rubyCoords[0], rubyCoords[1])).classList.add(this.rubyClassName);

        // Отрисовываем змейку
        for (var i = 0; i < pythonCoords.length; i++) {
            document.getElementById(this.coordsToId(pythonCoords[i][0], pythonCoords[i][1])).classList.add(this.pythonClassName);
        }

    },

    /**
     * Увеличить счетчик очков
     */
    addCounter: function () {
        this.counter++;
        this.counterElem.innerHTML = this.counter;
    },

    gameover: function () {
        // Отобразить текст, что игра закончилась
        alert('Конец игры');
    },

    /**
     * Преобразовать координаты в Id ячейки
     * @param {number} line   номер строки
     * @param {number} column номер столбца
     */
    coordsToId: function (line, column) {
        return 'cell' + line + '-' + column;
    }
};

var controller = {
    timer: '',

    /**
     * Инициализация контроллера
     * @param {Node} field поле
     */
    init: function (field) {
        this.timer = setInterval(this.moveTimer, 200);
        document.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 37:
                    model.left();
                    return;
                case 39:
                    model.rigth();
                    return;
            }
        });
        var handleCoord = function(x) {
          x < document.documentElement.clientWidth / 2 ? model.left() : model.rigth();
        };
        // document.addEventListener('touchstart', function(event) {
        //   handleCoord(event.touches[0].clientX);
        // });
        document.addEventListener('click', function(event) {
          handleCoord(event.clientX);
        });

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
    var field = document.getElementById('field');
    var fieldSize = {height: 15, width: 15};
    view.init(field, fieldSize, document.getElementById('counter'));
    model.init(fieldSize);
    controller.init(field);
}
