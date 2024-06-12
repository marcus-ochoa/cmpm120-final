class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }


    preload() {
        
    }

    create() {

        this.transition = false;
        this.centerX = 350;
        this.centerY = 500;

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        

        // camera setup
        this.cameras.main.fadeIn(1000);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=> {
             this.scene.start("titleScene");
        });

        // credits text
        this.add.text(this.centerX, this.centerY - 300, "Credits", {fontSize: '64px'}).setOrigin(0.5);
        this.add.text(this.centerX, this.centerY - 160, "Kenney Assets (Sound, Art)", {fontSize: '32px'}).setOrigin(0.5);
        this.add.text(this.centerX, this.centerY - 100, "Marcus Ochoa", {fontSize: '32px'}).setOrigin(0.5);
        this.add.text(this.centerX, this.centerY - 40, "CMPM 120", {fontSize: '32px'}).setOrigin(0.5);
        this.add.text(this.centerX, this.centerY + 100, "[SPACE] to continue", {fontSize: '32px'}).setOrigin(0.5); 
    }

    update() {

        // trigger to return to title

        if (this.spaceKey.isDown && !this.transition) {
            this.cameras.main.fadeOut(2000);
            this.transition = true;
        }
    }

    
}