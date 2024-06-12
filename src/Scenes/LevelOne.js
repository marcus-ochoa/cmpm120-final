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
        this.win = false;
        this.switch = false;
        this.hasKey = false;
        this.transition = false;
        this.coins_taken = 0;

        // map setup
        this.map = this.add.tilemap("tiled-level-1", 64, 64, 80, 22);
        this.tileset = this.map.addTilesetImage("tilesheet_complete", "tilemap_tiles");
        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
        this.physics.world.TILE_BIAS = 24;

        // layers setup
        this.map.createLayer("Background", this.tileset, -200, -200).setScrollFactor(0.5).setAlpha(0.5);
        this.map.createLayer("Landscape", this.tileset, -100, -100).setScrollFactor(0.75);
        this.map.createLayer("Aesthetic", this.tileset, 0, 0);
        
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.spikeLayer = this.map.createLayer("Spikes", this.tileset, 0, 0);
        this.doorLayer = this.map.createLayer("Door", this.tileset, 0, 0);
        this.blockLayer = this.map.createLayer("Blocks", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({collision: true});
        this.spikeLayer.setCollisionByProperty({collision: true});
        this.doorLayer.setCollisionByProperty({collision: true});
        this.blockLayer.setCollisionByProperty({collision: true});

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.zKey = this.input.keyboard.addKey('Z');

        // player sprite setup
        my.sprite.player = new Player(this, 100, 500, "characters_sheet", "playerRed_stand.png");
        this.physics.world.enable(my.sprite.player, Phaser.Physics.Arcade.DYNAMIC_BODY);
        my.sprite.player.init();

        this.animatedTiles.init(this.map);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        
        // SWITCH SETUP
        this.physics.add.collider(my.sprite.player, this.blockLayer);

        this.switches = this.map.createFromObjects("Switches", {
            name: "switch",
            key: "tilemap_sheet",
            frame: 229
        });

        this.physics.world.enable(this.switches, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.add.overlap(my.sprite.player, this.switches, (obj1, obj2) => {

            console.log("overlapping");

            if(Phaser.Input.Keyboard.JustDown(this.zKey)) {
                
                if (!this.switch) {

                    this.blockLayer.setCollisionByProperty({collision: true}, false);
                    this.blockLayer.setAlpha(0.2);
                }
                else {

                    this.blockLayer.setCollisionByProperty({collision: true});
                    this.blockLayer.setAlpha(1);
                }

                for (let tile of this.switches) {
                    
                    tile.toggleFlipX();
                }

                this.sound.play("switch_sound");
                this.switch = !this.switch;
            }
            
        });


        // END STATES
        this.physics.add.collider(my.sprite.player, this.spikeLayer, () => {

            if(!this.gameover) {
                this.death("Get Spiked!", "playerRed_dead.png");
            }
        });

        this.physics.add.collider(my.sprite.player, this.doorLayer, () => {

            if(!this.gameover && this.hasKey) {
                this.completed();
            }

            if(!this.gameover && (!this.hasKey)) {
                this.death("Forgot the key!", "playerRed_hit.png");
            }
        });


        // ENEMY SETUP
        this.enemy_list = [
            [400, 500, 200],
            [1000, 500, 200],
        ];

        this.enemies = new Phaser.GameObjects.Group(this, Enemy);
        this.enemies.runChildUpdate = true;

        for (let enemy_info of this.enemy_list) {

            let enemy = new Enemy(this, enemy_info[0], enemy_info[1], "enemy_sheet", "enemyWalking_1.png", enemy_info[2]);
            this.physics.world.enable(enemy, Phaser.Physics.Arcade.DYNAMIC_BODY);
            enemy.init();
            this.enemies.add(enemy);
            this.physics.add.collider(enemy, this.groundLayer);
        }

        this.physics.add.collider(my.sprite.player, this.enemies, (obj1, obj2) => {
            
            if (!this.gameover) {

                if (obj2.body.touching.left || obj2.body.touching.right) {
                    this.death("Get Enemied!", "playerRed_dead.png");
                    obj2.velocity = 0;
                    this.physics.world.update();
                }
                else {
                    this.enemies = this.enemies.remove(obj2);
                    obj2.death();
                }
            }   
        });

        
        // PLATFORM SETUP
        this.platforms = [];

        for (let objLayer of this.map.getObjectLayerNames().filter(layer => layer.includes("platform"))) {

            let partImages = this.map.createFromObjects(objLayer, {
                name: "platform",
                key: "tilemap_sheet",
                frame: 8,
                classType: Phaser.Physics.Arcade.Image
            });

            this.physics.world.enable(partImages, Phaser.Physics.Arcade.DYNAMIC_BODY);
            this.physics.add.collider(my.sprite.player, partImages);

            console.log("getting obj layer: " + objLayer);
            
            let distance = 0;
            let vertical = false;

            for (let prop of this.map.getObjectLayer(objLayer).properties) {

                if (prop.name == "distance") {
                    distance = prop.value;
                }

                if (prop.name == "vertical") {
                    vertical = prop.value;
                }
            }

            this.platforms.push(new Platform(this, partImages, distance, vertical));
        }

        
        // COIN OBJECT SETUP
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 58
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);
        this.coinGroup.playAnimation("coin_anim");

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.sound.play("coin_sound");
            this.coins_taken++;
            obj2.destroy();
        });


        // KEY OBJECT SETUP
        this.keys = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 101
        });
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);
        this.keyGroup = this.add.group(this.keys);
        this.keyGroup.playAnimation("key_anim");
        
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            this.sound.play("key_sound");
            obj2.destroy();
            this.hasKey = true;
        });
        
        // CAMERA SETUP
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, roundPixels, lerpX, lerpY)
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.fadeIn(1000);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=> {
            if (this.win) {
                this.scene.start("levelTwoScene");
            } 
            else {
                this.scene.restart();
            }
        });
    }

    // ENDSTATE FUNCTIONS

    death(death_message, death_sprite) {
        
        my.sprite.player.death();
        this.add.text(my.sprite.player.x, my.sprite.player.y - 180, death_message, {fontSize: '64px'}).setOrigin(0.5);
        this.add.sprite(my.sprite.player.x, my.sprite.player.y, "characters_sheet", death_sprite).setScale(1.5);
        this.sound.play("fail_sound");
        this.endgame();
    }

    completed() {

        my.sprite.player.exit();
        this.add.text(my.sprite.player.x, my.sprite.player.y - 250, this.coins_taken + "/5 Coins", {fontSize: '28px'}).setOrigin(0.5);
        this.add.text(my.sprite.player.x, my.sprite.player.y - 200, "Wow you made it!", {fontSize: '56px'}).setOrigin(0.5);
        this.win = true;
        this.endgame();
    }

    endgame() {

        this.add.text(my.sprite.player.x, my.sprite.player.y - 100, "(Press [SPACE] to continue)", {fontSize: '32px'}).setOrigin(0.5);
        this.cameras.main.stopFollow();
        this.cameras.main.zoomTo(this.ZOOM_SCALE, 1000);
        this.cameras.main.pan(my.sprite.player.x, my.sprite.player.y, 1000);
        this.gameover = true;
        this.physics.world.pause();
    }

    // UPDATE FUNCTION

    update() {

        // normal update updates all enemies and platforms along with player
        
        if (!this.gameover) {

            my.sprite.player.update();

            for (let platform of this.platforms) {

                platform.update();
            }

            this.enemies.preUpdate();
        }

        else {

            // on endstate, wait for trigger to next level

            if (this.spaceKey.isDown && !this.transition) {

                this.cameras.main.fadeOut(600);
                this.transition = true;
            }
        }
    }
}