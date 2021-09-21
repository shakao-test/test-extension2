namespace SpriteKind {
    export const Water = SpriteKind.create()
    export const Fire = SpriteKind.create()
    export const Burnt = SpriteKind.create()
}

let spreadOptions: number[] = []

let windSpeed = 5
let tinder = 4
let dryGrass = 5
let spreadTimeBase = 2000
let hoseDirection = 270
let facing = 0
let changeRate = 7
let burnedColor = 2
let healthyColor = 3

let statusbar = statusbars.create(82, 4, StatusBarKind.Health)
statusbar.top = 12
statusbar.left = 4
statusbar.max = tiles.tilemapRows() * tiles.tilemapColumns()
statusbar.value = tiles.tilemapRows() * tiles.tilemapColumns()
statusbar.setColor(healthyColor, burnedColor)
let statusLabel = textsprite.create("Healthy Forest", 0, 1)
statusLabel.setFlag(SpriteFlag.RelativeToCamera, true)
statusLabel.top = 2
statusLabel.left = 4
let fireLabel = textsprite.create("Fires:")
fireLabel.right = 145
fireLabel.top = 2
fireLabel.setMaxFontHeight(4)
fireLabel.setFlag(SpriteFlag.RelativeToCamera, true)

let hudBG = sprites.create(img`
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    `, SpriteKind.Player)
hudBG.bottom = 120
hudBG.z = 2000
let statusbar2 = statusbars.create(8, 8, StatusBarKind.Magic)
statusbar2.setLabel("Fire Danger:")
statusbar2.setColor(7, 2)
statusbar2.positionDirection(CollisionDirection.Bottom)
statusbar2.z = 2001
statusLabel.setFlag(SpriteFlag.Invisible, true)
statusbar.setFlag(SpriteFlag.Invisible, true)
fireLabel.setFlag(SpriteFlag.Invisible, true)
info.showScore(false)
statusbar2.setFlag(SpriteFlag.Invisible, true)
hudBG.setFlag(SpriteFlag.Invisible, true)

namespace animation {
    /*
     * Loops the passed frames on the sprite at the given interval whenever
     * the specified rule is true for that sprite.
     *
     * If more than one rule applies, the most specific rule will be used.
     * If multiple rules are equally specific, the currently executing rule
     * is favored (or one is chosen at random).
     *
     * @param sprite    the sprite to animate
     * @param frames    the images that make up that animation
     * @param frame     Interval the amount of time to spend on each frame in milliseconds
     * @param rule      the rule that decides when this animation will play
     */
    //% blockId=arcade_character_loop_frames2
    //% block="animate $sprite loop frames $frames interval (ms) $frameInterval when $rule"
    //% sprite.defl=mySprite
    //% frames.defl=Fire Plane Right
    //% sprite.shadow=variables_get
    //% frames.shadow=animation_editor
    //% frameInterval.shadow=timePicker
    //% rule.shadow=arcade_character_make_rule
    //% weight=100
    //% blockGap=8
    //% help=github:arcade-character-animations/docs/loop-character-animation
    export function loopFrames2(sprite: Sprite, frames: Image[], frameInterval: number, rule: number) {
        characterAnimations.loopFrames(sprite, frames, frameInterval, rule);
    }
}


namespace game {

    /*
     * Set the strength of your wind.
     * Higher numbers spread fire faster.
     */
    //% block="set strength of wind to $num"
    //% num.defl=3
    export function set_strength_of_wind(num: number) {
        windSpeed = num
    }

    /*
     * Set the health of your trees.
     * Lower numbers spread fire faster.
     */
    //% block="set health of trees to $num"
    //% num.defl=7
    export function set_health_of_trees(num: number) {
        tinder = num
    }

    /*
     * Set how dry your grass is.
     * Higher numbers spread fire faster.
     */
    //% block="set dryness of grass to $num"
    //% num.defl=3
    export function set_dryness_of_grass(num: number) {
        dryGrass = num
    }
}

//% color="#09282d" icon="\uf1e5"
//% block="HUD"
namespace hud {

    /*
     * Show or hide the current number of burning fires.
     */
    //% block="show fire HUD $answer"
    //% answer.shadow="toggleYesNo"
    //% answer.defl=true
    export function fire_hud(answer: boolean) {

        if (answer) {
            fireLabel.setFlag(SpriteFlag.Invisible, false)
            info.showScore(true)
        } else {
            fireLabel.setFlag(SpriteFlag.Invisible, true)
            info.showScore(false)
        }

    }

    /*
     * Show or hide how much of the forest has burned.
     */
    //% block="show forest HUD $answer"
    //% answer.shadow="toggleYesNo"
    //% answer.defl=true
    export function forest_hud(answer: boolean) {

        if (answer) {
            statusLabel.setFlag(SpriteFlag.Invisible, false)
            statusbar.setFlag(SpriteFlag.Invisible, false)

        } else {
            statusLabel.setFlag(SpriteFlag.Invisible, true)
            statusbar.setFlag(SpriteFlag.Invisible, true)
        }

    }


    /*
     * Show or hide the fire danger level.
     */
    //% block="show danger level HUD $answer"
    //% answer.shadow="toggleYesNo"
    //% answer.defl=true
    export function danger_hud(answer: boolean) {

        if (answer) {
            hudBG.setFlag(SpriteFlag.Invisible, false)
            statusbar2.setFlag(SpriteFlag.Invisible, false)

        } else {
            hudBG.setFlag(SpriteFlag.Invisible, true)
            statusbar2.setFlag(SpriteFlag.Invisible, true)
        }

    }



    /*
    * Set the color for remaining live forest
    */
    //% block="set color of healthy forest meter to $color"
    //% color.shadow="colorindexpicker"
    //% color.defl=2
    export function forest_hud_healthy(color: number) {
        healthyColor = color
        statusbar.setColor(healthyColor, burnedColor)
    }

    /*
    * Set the color for burned forest
    */
    //% block="set color of burned forest meter to $color"
    //% color.shadow="colorindexpicker"
    //% color.defl=3
    export function forest_hud_burned(color: number) {
        burnedColor = color
        statusbar.setColor(healthyColor, burnedColor)
    }


    /*
     * Set the label for the forest HUD
     */
    //% block="set forest HUD label to $name"
    //% name.defl="Healthy Forest"
    export function forest_hud_label(name: string) {
        statusLabel.setText(name)
    }


    /*
     * Set the label for the fire-counting HUD
     */
    //% block="set fire HUD label to $name"
    //% name.defl="Fires:"
    export function fire_hud_label(name: string) {
        fireLabel.setText(name)
    }


    /*
     * Set the label for the fire danger HUD
     */
    //% block="set danger HUD label to $name"
    //% name.defl="Fire Danger Levels"
    export function danger_hud_label(name: string) {
        statusbar2.setLabel(name)
    }


}

namespace sprites {

    /*
     * Set the number of "lives" for your sprite.
     */
    //% block="set strength of $thisSprite=variables_get(mySprite) to $num"
    //% num.defl=10
    export function set_flame_strength(thisSprite: Sprite, num: number) {
        sprites.setDataNumber(thisSprite, "life", num)
        sprites.setDataNumber(thisSprite, "spreadTime", spreadTimeBase + 1000)
    }

    /*
     * Add or remove "lives" from your sprite.
     */
    //% block="change strength of $thisSprite=variables_get(mySprite) by $num"
    //% num.defl=-1
    export function change_flame_strength_by(thisSprite: Sprite, num: number) {
        sprites.changeDataNumberBy(thisSprite, "life", num)
        for (let value of sprites.allOfKind(SpriteKind.Fire)) {
            if (sprites.readDataNumber(value, "life") <= 0) {
                effects.clearParticles(value)
                value.destroy()
            }
        }
    }

    /*
     * Choose a sprite to "spray" an image (in sprite form.)
     */
    //% block="spray from $thisSprite=variables_get(mySprite) using $img=screen_image_picker"
    //% img.defl=water
    export function spray(thisSprite: Sprite, img: Image) {

        if (controller.up.isPressed()) {
            if (controller.left.isPressed()) {
                facing = 225
            } else if (controller.right.isPressed()) {
                facing = 315
            } else if (controller.down.isPressed()) {

            } else {
                facing = 270
            }
        } else if (controller.left.isPressed()) {
            if (controller.right.isPressed()) {

            } else if (controller.down.isPressed()) {
                facing = 135
            } else {
                facing = 180
            }
        } else if (controller.right.isPressed()) {
            if (controller.down.isPressed()) {
                facing = 45
            } else {
                facing = 0
            }
        } else if (controller.down.isPressed()) {
            facing = 90
        }

        if (Math.abs(facing - hoseDirection) < 180) {
            if (facing < hoseDirection) {
                hoseDirection += 0 - changeRate
            } else {
                hoseDirection += changeRate
            }
        } else {
            if (facing < hoseDirection) {
                hoseDirection += changeRate
            } else {
                hoseDirection += 0 - changeRate
            }
            if (hoseDirection < 0) {
                hoseDirection += 360
            } else if (hoseDirection > 360) {
                hoseDirection += -360
            }
            hoseDirection = hoseDirection % 360
        }
        let waterProj = sprites.createProjectileFromSprite(img, thisSprite, 150 * Math.cos(spriteutils.degreesToRadians(hoseDirection)), 150 * Math.sin(spriteutils.degreesToRadians(hoseDirection)))
        waterProj.setKind(SpriteKind.Water)
    }

    /*
     * Spread current fires according to wind speed, 
     * dryness of grass, and health of trees.
     */
    //% block="random spread $myImage=screen_image_picker"
    export function random_spread(myImage: Image) {

        for (let value of sprites.allOfKind(SpriteKind.Fire)) {
            if (sprites.readDataNumber(value, "life") <= 0) {
                effects.clearParticles(value)
                value.destroy()
            }

            let list2 = [-32, -16, 0, 16, 32, 16, -16]
            if (game.runtime() > sprites.readDataNumber(value, "spreadTime")) {
                sprites.setDataNumber(value, "spreadTime", game.runtime() + randint(spreadTimeBase, spreadTimeBase + 1000))
                let newFire = sprites.create(myImage, SpriteKind.Fire)
                newFire.setPosition(value.x + list2._pickRandom(), value.y)
                sprites.setDataNumber(newFire, "spreadTime", game.runtime() + randint(spreadTimeBase, spreadTimeBase + 1000))
                if (Math.percentChance(50)) {
                    newFire.y += list2._pickRandom()
                }
                if (tiles.tileIsWall(tiles.locationOfSprite(newFire))) {
                    newFire.setPosition(value.x, value.y)
                }
            }
        }
    }

}