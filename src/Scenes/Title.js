class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    init() {

        // variables and settings
        this.ACCELERATION = 2000;
        this.MAX_VELOCITY = 500;
        this.DRAG = 2000;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -800;
        this.PARTICLE_VELOCITY = 100;
        this.SCALE = 0.5;
        this.ZOOM_SCALE = 1.25;
    }

    preload() {
        
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {

        this.transition = false;

        // map setup
        this.map = this.add.tilemap("tiled-title", 64, 64, 80, 22);
        this.tileset = this.map.addTilesetImage("tilesheet_complete", "tilemap_tiles");
        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
        this.physics.world.TILE_BIAS = 24;

        // layers setup
        this.map.createLayer("Background", this.tileset, -200, -200).setScrollFactor(0.5);
        this.map.createLayer("Landscape", this.tileset, -100, -100).setScrollFactor(0.75);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.spikeLayer = this.map.createLayer("Spikes", this.tileset, 0, 0);
        this.map.createLayer("Aesthetic", this.tileset, 0, 0);
        this.doorLayer = this.map.createLayer("Door", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({collision: true});
        this.spikeLayer.setCollisionByProperty({collision: true});
        this.doorLayer.setCollisionByProperty({collision: true});

        this.animatedTiles.init(this.map);


        // coin setup (just for visuals)
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 58
        });
        this.coinGroup = this.add.group(this.coins);
        this.coinGroup.playAnimation("coin_anim");

        // player sprite setup
        my.sprite.player = this.physics.add.sprite(510, 550, "characters_sheet", "playerRed_stand.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setScale(1.5);
        my.sprite.player.setMaxVelocity(this.MAX_VELOCITY, -this.JUMP_VELOCITY*3);
        

        // add colliders for level elements
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // vfx setup
        my.vfx.jump = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_02.png'],
            scale: {start: 0.03, end: 0.5},
            maxAliveParticles: 1,
            lifespan: 350,
            alpha: {start: 1, end: 0.1},
            duration: 10,
        });
        my.vfx.jump.stop();

        // camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, roundPixels, lerpX, lerpY)
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(1);
        this.cameras.main.fadeIn(1000);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=> {
            this.scene.start("levelOneScene");
        });

        this.add.text(my.sprite.player.x, my.sprite.player.y - 200, "Spikes are Ouch", {fontSize: '64px'}).setOrigin(0.5);
        this.add.text(my.sprite.player.x, my.sprite.player.y - 140, "CMPM 120 Game", {fontSize: '32px'}).setOrigin(0.5);
        this.add.text(my.sprite.player.x, my.sprite.player.y + 130, "Marcus Ochoa", {fontSize: '48px'}).setOrigin(0.5);
        this.add.text(my.sprite.player.x, my.sprite.player.y + 270, "Move: Arrow Keys  Interact: Z", {fontSize: '36px'}).setOrigin(0.5);
        this.add.text(my.sprite.player.x, my.sprite.player.y + 320, "Press [SPACE] to start", {fontSize: '30px'}).setOrigin(0.5);
    }

    update() {

        // trigger to move to next scene
        if (this.spaceKey.isDown && !this.transition) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setParticleSpeed(0, this.PARTICLE_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y+30);
            my.vfx.jump.start();
            this.sound.play("jump_sound");
            this.cameras.main.fadeOut(2000);
            this.transition = true;
        }
    }
}
