class BackgroundEffect {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Настройки по умолчанию
        const isMobile = window.innerWidth < 768; // Определяем, является ли устройство мобильным
        this.options = {
            maxDots: 70,
            dotMinSize: isMobile ? 8.0 : 5.0, // Большие точки для мобильных устройств
            dotMaxSize: isMobile ? 12.0 : 10.0, // Большие точки для мобильных устройств
            spawnMargin: 200.0,
            lineDistanceThreshold: 300.0,
            lineAlphaFactor: 120.0,
            colorPoint: 'rgba(207, 19, 19, 0.8)',
            maxSpeed: 1.5,
            dotScale: window.devicePixelRatio || 0.3, // Масштабирование точек
            ...options
        };

        // Инициализация данных
        this.positions = [];
        this.sizes = [];
        this.velocities = [];
        this.rng = () => Math.random();

        // Установка размеров холста
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Запуск анимации
        this.init();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth * this.options.dotScale;
        this.canvas.height = window.innerHeight * this.options.dotScale;
    }

    init() {
        for (let i = 0; i < this.options.maxDots; i++) {
            this.spawnNew();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    update() {
        // Добавление новых точек, если их меньше максимального количества
        if (this.positions.length < this.options.maxDots) {
            this.spawnNew();
        }

        // Обновление позиций точек
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i].x += this.velocities[i].x;
            this.positions[i].y += this.velocities[i].y;
        }

        // Удаление точек, вышедших за пределы экрана
        this.positions = this.positions.filter((pos, index) => {
            if (this.isOutOfBounds(pos)) {
                this.sizes.splice(index, 1);
                this.velocities.splice(index, 1);
                return false;
            }
            return true;
        });
    }

    draw() {
        const { ctx } = this;

        // Очистка холста
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем точки
        for (let i = 0; i < this.positions.length; i++) {
            const pos = this.positions[i];
            const size = this.sizes[i];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.options.colorPoint;
            ctx.fill();
            ctx.closePath();
        }

        // Рисуем линии между точками
        for (let i = 0; i < this.positions.length; i++) {
            for (let j = i + 1; j < this.positions.length; j++) {
                const distance = this.distance(this.positions[i], this.positions[j]);
                if (distance < this.options.lineDistanceThreshold) {
                    const alpha = Math.min(distance / this.options.lineAlphaFactor, 1);
                    ctx.strokeStyle = `rgba(40, 51, 73, ${1 - alpha})`; // Цвет линий
                    ctx.lineWidth = 4/this.options.dotScale   ; // Толщина линий
                    ctx.beginPath();
                    ctx.moveTo(this.positions[i].x, this.positions[i].y);
                    ctx.lineTo(this.positions[j].x, this.positions[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    spawnNew(pos = null) {
        if (!pos) {
            pos = this.newRandomPosition();
        }

        const size = (this.rng() * (this.options.dotMaxSize - this.options.dotMinSize) + this.options.dotMinSize) / this.options.dotScale;
        const angle = this.rng() * Math.PI * 2;
        const speed = this.rng() * this.options.maxSpeed;
        const vel = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        this.positions.push(pos);
        this.sizes.push(size);
        this.velocities.push(vel);
    }

    newRandomPosition() {
        const side = Math.floor(this.rng() * 4);
        const margin = this.options.spawnMargin;
        const width = this.canvas.width;
        const height = this.canvas.height;

        switch (side) {
            case 0: // Верх
                return { x: this.rng() * (width + margin * 2) - margin, y: -margin };
            case 1: // Низ
                return { x: this.rng() * (width + margin * 2) - margin, y: height + margin };
            case 2: // Лево
                return { x: -margin, y: this.rng() * (height + margin * 2) - margin };
            case 3: // Право
                return { x: width + margin, y: this.rng() * (height + margin * 2) - margin };
        }
    }

    isOutOfBounds(pos) {
        const margin = this.options.spawnMargin;
        return (
            pos.x < -margin ||
            pos.y < -margin ||
            pos.x > this.canvas.width + margin ||
            pos.y > this.canvas.height + margin
        );
    }

    distance(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }
}

// Инициализация эффекта фона
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1'; // Чтобы фон рисовался последним
    canvas.style.pointerEvents = 'none'; // Отключаем взаимодействие с мышью
    document.body.appendChild(canvas);

    new BackgroundEffect(canvas, {
        maxDots: 70,
        dotMinSize: 5.0,
        dotMaxSize: 50.0,
        spawnMargin: 200.0,
        lineDistanceThreshold: 300.0,
        lineAlphaFactor: 520.0,
        colorPoint: 'rgba(40, 51, 73, 1)',
        maxSpeed: 1
    });
});