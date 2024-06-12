class Enemy extends Phaser.Physics.Arcade.Sprite {
    
    constructor(scene, x, y, texture, frame, distance) {

        super(scene, x, y, texture, frame);
        scene.add.existing(this);

        this.distance = distance;

        this.forward = true;

        this.start = x;
        this.end = x + distance;

        if (distance < 0) {

            this.forward = false;
            this.end = this.start;
            this.start = this.start + distance;
        }

        this.walkingVfx = scene.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_05.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            gravityY: -800,
            frequency: 200,
            alpha: {start: 1, end: 0.1}, 
        });
        this.walkingVfx.stop();

        this.deathVfx = scene.add.particles(0, 0, "kenny-particles", {
            frame: ['trace_05.png', 'trace_04.png'],
            scale: {start: 0.03, end: 0.5},
            lifespan: 350,
            gravityY: -1000,
            alpha: {start: 1, end: 0.1}, 
        });
        this.deathVfx.stop();

        this.sound = scene.sound;

        return this;
    }

    init() {

        this.ACCELERATION = 2000;
        this.MAX_VELOCITY = 60;
        this.DRAG = 2000;
        this.JUMP_VELOCITY = -800;
        this.PARTICLE_VELOCITY = 100;

        this.setCollideWorldBounds(true);
        this.setScale(1.75);
        this.setMaxVelocity(this.MAX_VELOCITY, -this.JUMP_VELOCITY*3);

    }

    end() {

        this.velocity = 0;
    }

    death() {
        this.visible = false;
        this.deathVfx.setPosition(this.x, this.y-50);
        //this.deathVfx.start();
        this.walkingVfx.stop();
        this.destroy();
    }

    update() {

        if (this.forward && this.x >= this.end) {

            this.forward = false;
        }

        else if (!this.forward && this.x <= this.start) {

            this.forward = true;
        }

        if(this.forward) {

            this.setAccelerationX(this.ACCELERATION);
            
            this.resetFlip();
            this.anims.play('enemy_walk', true);

            this.walkingVfx.startFollow(this, this.displayHeight/2-70, this.displayHeight/2-20, false);

            this.walkingVfx.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            if (this.body.blocked.down) {

                this.walkingVfx.start();
            }


        } else {

            this.setAccelerationX(-this.ACCELERATION);

            this.setFlip(true, false);
            this.anims.play('enemy_walk', true);

            this.walkingVfx.startFollow(this, this.displayHeight/2, this.displayHeight/2-20, false);
            this.walkingVfx.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (this.body.blocked.down) {

                this.walkingVfx.start();
            }
        } 
    }
}