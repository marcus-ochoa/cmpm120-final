class Player extends Phaser.Physics.Arcade.Sprite {
    
    constructor(scene, x, y, texture, frame) {

        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.cursors = cursors;

        this.walkingVfx = scene.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_05.png'],
            scale: {start: 0.03, end: 0.3},
            lifespan: 350,
            gravityY: -800,
            frequency: 100,
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

        this.jumpVfx = scene.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_02.png'],
            scale: {start: 0.03, end: 0.5},
            maxAliveParticles: 1,
            lifespan: 350,
            alpha: {start: 1, end: 0.1},
            duration: 10,
        });
        this.jumpVfx.stop();

        this.sound = scene.sound;

        return this;

        
    }

    init() {

        this.ACCELERATION = 2000;
        this.MAX_VELOCITY = 500;
        this.DRAG = 2000;
        this.JUMP_VELOCITY = -800;
        this.PARTICLE_VELOCITY = 100;
        this.SCALE = 0.5;
        this.ZOOM_SCALE = 1.25;

        this.setCollideWorldBounds(true);
        this.setScale(1.5);
        this.setMaxVelocity(this.MAX_VELOCITY, -this.JUMP_VELOCITY*3);

    }

    exit() {

        this.visible = false;
        this.walkingVfx.stop();
        
    }

    death() {
        this.visible = false;
        this.deathVfx.setPosition(this.x, this.y-50);
        this.deathVfx.start();
        this.visible = false;
        this.walkingVfx.stop();     
    }

    update() {

        if(this.cursors.left.isDown) {

            this.setAccelerationX(-this.ACCELERATION);

            this.setFlip(true, false);
            this.anims.play('walk', true);

            this.walkingVfx.startFollow(this, this.displayHeight/2, this.displayHeight/2-30, false);
            this.walkingVfx.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (this.body.blocked.down) {

                this.walkingVfx.start();

            }

        } else if(this.cursors.right.isDown) {
            this.setAccelerationX(this.ACCELERATION);
            
            this.resetFlip();
            this.anims.play('walk', true);

            this.walkingVfx.startFollow(this, this.displayHeight/2-70, this.displayHeight/2-30, false);

            this.walkingVfx.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            if (this.body.blocked.down) {

                this.walkingVfx.start();
            }

        } else {
            this.setAccelerationX(0);
            this.setDragX(this.DRAG);
            this.anims.play('idle');
            this.walkingVfx.stop();
        }

        if(!this.body.blocked.down) {
            this.anims.play('jump');
            
        }
        if(this.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpVfx.setParticleSpeed(0, this.PARTICLE_VELOCITY);
            this.jumpVfx.setPosition(this.x, this.y+30);
            this.jumpVfx.start();
            this.sound.play("jump_sound");
        }
    }
}