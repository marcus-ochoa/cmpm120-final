class Platform extends Phaser.GameObjects.Image {
    
    constructor(scene, partsArray, distance, vertical) {

        console.log("constructing platform");

        super(scene, 0, 0, "tilemap_sheet", 8);
        scene.add.existing(this);

        // SETUP MOVEMENT RANGE

        this.vertical = vertical;
        this.forward = true;

        if (vertical) {
            this.start = partsArray[0].y;
        } else {
            this.start = partsArray[0].x;
        }
        
        this.end = this.start + distance;

        this.platformVelocity = 70;

        if (distance < 0) {

            this.platformVelocity *= -1;
            this.end = this.start;
            this.start = this.start + distance;
            this.forward = false;
        }

        for (let sprite of partsArray) {
            
            sprite.setImmovable(true);
            sprite.body.allowGravity = false;
        }

        this.partsArray = partsArray;

        if (vertical) {
            
            for (let platform of this.partsArray) {

                console.log(this.platformVelocity);
                
                platform.setVelocityY(this.platformVelocity);
            }
        }

        else {
            
            for (let platform of this.partsArray) {
                
                platform.setVelocityX(this.platformVelocity);
            }
        }

        return this;
    }

    // MOVEMENT UPDATE: moves back and forth within given range

    update() {

        if (this.vertical) {

            if (this.forward && this.partsArray[0].y >= this.end) {

                this.platformVelocity *= -1;
    
                for (let platform of this.partsArray) {
                    platform.setVelocityY(this.platformVelocity);
                }

                this.forward = false;
            }

            else if (!this.forward && this.partsArray[0].y <= this.start) {

                this.platformVelocity *= -1;
    
                for (let platform of this.partsArray) {
                    platform.setVelocityY(this.platformVelocity);
                }

                this.forward = true;
            }
        } 
        
        else {

            if (this.forward && this.partsArray[0].x >= this.end) {

                this.platformVelocity *= -1;
    
                for (let platform of this.partsArray) {
                    platform.setVelocityX(this.platformVelocity);
                }

                this.forward = false;
            }

            else if (!this.forward && this.partsArray[0].x <= this.start) {

                this.platformVelocity *= -1;
    
                for (let platform of this.partsArray) {
                    platform.setVelocityX(this.platformVelocity);
                }

                this.forward = true;
            }
        }
    }
}