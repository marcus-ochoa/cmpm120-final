class LevelOne extends Phaser.Scene {
    constructor() {
        super("levelOneScene");
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

        this.gameover = false;
        this.hasKey = false;
        this.coins_taken = 0;

        // map setup
        this.map = this.add.tilemap("tiled-level-1", 64, 64, 80, 22);
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

        // initializing coin group from tiled
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 58
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);
        this.coinGroup.playAnimation("coin_anim");

        // initializing key group from tiled
        this.keys = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 101
        });
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);
        this.keyGroup = this.add.group(this.keys);
        this.keyGroup.playAnimation("key_anim");

        // initializing platform group from tiled
        this.platforms = this.map.createFromObjects("Platforms", {
            name: "platform",
            key: "tilemap_sheet",
            frame: 8,
            classType: Phaser.Physics.Arcade.Image 
        });
        this.physics.world.enable(this.platforms, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.platformGroup = this.add.group(this.platforms);
        this.platformVelocity = 75;
        Phaser.Actions.Call(this.platformGroup.getChildren(), function(sprite) {
            sprite.setImmovable(true);
            sprite.body.allowGravity = false;
            sprite.setVelocityX(this.platformVelocity);
            
        }, this);
        this.platformCounter = 0;

        this.animatedTiles.init(this.map);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // my.vfx.walkingVfx = scene.add.particles(0, 0, "kenny-particles", {
        //     frame: ['circle_05.png'],
        //     scale: {start: 0.03, end: 0.3},
        //     lifespan: 350,
        //     gravityY: -800,
        //     frequency: 100,
        //     alpha: {start: 1, end: 0.1}, 
        // });
        // my.vfx.walkingVfx.stop();

        // my.vfx.deathVfx = scene.add.particles(0, 0, "kenny-particles", {
        //     frame: ['trace_05.png', 'trace_04.png'],
        //     scale: {start: 0.03, end: 0.5},
        //     lifespan: 350,
        //     gravityY: -1000,
        //     alpha: {start: 1, end: 0.1}, 
        // });
        // my.vfx.deathVfx.stop();

        // my.vfx.jumpVfx = scene.add.particles(0, 0, "kenny-particles", {
        //     frame: ['circle_02.png'],
        //     scale: {start: 0.03, end: 0.5},
        //     maxAliveParticles: 1,
        //     lifespan: 350,
        //     alpha: {start: 1, end: 0.1},
        //     duration: 10,
        // });
        // my.vfx.jumpVfx.stop();

        // player sprite setup
        my.sprite.player = new Player(this, 100, 500, "characters_sheet", "playerRed_stand.png");
        this.physics.world.enable(my.sprite.player, Phaser.Physics.Arcade.DYNAMIC_BODY);
        my.sprite.player.init();

        // add colliders for level elements
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.platformGroup);

        // add colliders for objects
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.sound.play("coin_sound");
            this.coins_taken++;
            obj2.destroy();
        });

        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            this.sound.play("key_sound");
            obj2.destroy();
            this.hasKey = true;
        });



        // spike end state
        this.physics.add.collider(my.sprite.player, this.spikeLayer, () => {

            if(!this.gameover) {
                this.cameras.main.stopFollow();
                this.cameras.main.zoomTo(this.ZOOM_SCALE, 1000);
                this.cameras.main.pan(my.sprite.player.x, my.sprite.player.y, 1000);
                my.sprite.player.death();
                this.add.text(my.sprite.player.x, my.sprite.player.y - 100, "Get Spiked!", {fontSize: '64px'}).setOrigin(0.5);
                this.add.text(my.sprite.player.x, my.sprite.player.y + 100, "(Press 'R' to restart)", {fontSize: '32px'}).setOrigin(0.5);
                this.gameover = true;
                this.add.sprite(my.sprite.player.x, my.sprite.player.y, "characters_sheet", "playerRed_dead.png").setScale(1.5);
                this.sound.play("fail_sound");
            }
            
        });

        // door end state
        this.physics.add.collider(my.sprite.player, this.doorLayer, () => {

            if(!this.gameover && this.hasKey) {
                this.cameras.main.stopFollow();
                this.cameras.main.zoomTo(this.ZOOM_SCALE, 1000);
                this.cameras.main.pan(my.sprite.player.x, my.sprite.player.y, 1000);
                my.sprite.player.exit();
                this.add.text(my.sprite.player.x, my.sprite.player.y - 250, this.coins_taken + "/5 Coins", {fontSize: '28px'}).setOrigin(0.5);
                this.add.text(my.sprite.player.x, my.sprite.player.y - 200, "Wow you made it!", {fontSize: '56px'}).setOrigin(0.5);
                this.add.text(my.sprite.player.x, my.sprite.player.y - 125, "(Press 'R' to restart)", {fontSize: '32px'}).setOrigin(0.5);
                this.gameover = true;
                this.cameras.main.stopFollow();
            }

            if(!this.gameover && (!this.hasKey)) {
                this.cameras.main.stopFollow();
                this.cameras.main.zoomTo(this.ZOOM_SCALE, 1000);
                this.cameras.main.pan(my.sprite.player.x, my.sprite.player.y, 1000);
                my.sprite.player.death();
                this.add.text(my.sprite.player.x, my.sprite.player.y - 200, "Forgot the key!", {fontSize: '64px'}).setOrigin(0.5);
                this.add.text(my.sprite.player.x, my.sprite.player.y - 125, "(Press 'R' to restart)", {fontSize: '32px'}).setOrigin(0.5);
                this.gameover = true;
                this.add.sprite(my.sprite.player.x, my.sprite.player.y, "characters_sheet", "playerRed_hit.png").setScale(1.5);
                this.sound.play("fail_sound");
            }
            
        });
        
        // camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, roundPixels, lerpX, lerpY)
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.fadeIn(1000);

    }

    update() {
        
        if (!this.gameover) {

            my.sprite.player.update();

            // moving platforms
            this.platformCounter++;
            if (this.platformCounter > 800) {
                this.platformVelocity *= -1;
                this.platformCounter = 0;
            }
            Phaser.Actions.Call(this.platformGroup.getChildren(), function(sprite) {
                sprite.setVelocityX(this.platformVelocity);
            }, this);
        }

        else {

            my.sprite.player.stop();
            my.sprite.player.enable = false;

            if (this.rKey.isDown) {
                this.scene.restart();
            }
        }
    }
}