let checkpoint = 0
let meaningful_gesture = 0
let pause2 = 0
let speaking = false
let start_of_silence = 0
let locked = false
input.onGesture(Gesture.TiltLeft, function () {
    checkpoint = input.runningTime()
    meaningful_gesture += 1
})
input.onGesture(Gesture.Shake, function () {
    checkpoint = input.runningTime()
    meaningful_gesture += 1
})
// tilt right, shake, and tilt left as extra checks for gestures
input.onGesture(Gesture.TiltRight, function () {
    checkpoint = input.runningTime()
    meaningful_gesture += 1
})
// press logo to start your speech
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    input.setAccelerometerRange(AcceleratorRange.OneG)
    pause2 = 0
    meaningful_gesture = 0
    basic.showString("start")
    // user has five seconds before pause and gestures scores are being recorded so they can adjust
    basic.pause(5000)
    // start timer for gestures
    checkpoint = input.runningTime()
    speaking = true
    // start with no quiet environment detected
    start_of_silence = 0
    // locked is only true when user stops moving to end the program
    locked = false
})
basic.forever(function () {
    // true while the user has pressed the logo and has not frozen for ten seconds
    if (speaking) {
        // If a quiet environment is detected and was not previously, start a timer on the user's pause in speech
        if (start_of_silence == 0 && locked == false && input.soundLevel() < 25) {
            start_of_silence = input.runningTime()
        }
        // if user has paused for 0.7 seconds, add to their pause score and reset start of silence so other pauses can be detected.
        if (input.runningTime() - start_of_silence >= 700 && start_of_silence > 0 && locked == false) {
            pause2 += 1
            start_of_silence = 0
            basic.pause(1000)
        }
        // If the acceleration is 1400g or higher, add to meaningful gesture score. Calibrated based on gestures of three public speakers.
        if (input.acceleration(Dimension.Strength) > 1400 && locked == false) {
            meaningful_gesture += 1
            checkpoint = input.runningTime()
        }
        // If the user does not move the accelerometer for ten or more seconds, play a sound to indicate the reporting of gesture and pause scores
        if (input.runningTime() - checkpoint > 10000) {
            // ensure that no other if statements are entered
            locked = true
            music.play(music.stringPlayable("C D C D C - - - ", 120), music.PlaybackMode.UntilDone)
            basic.showString("gestures")
            basic.showNumber(meaningful_gesture)
            basic.showNumber(meaningful_gesture)
            basic.showNumber(meaningful_gesture)
            basic.showString("pauses")
            basic.showNumber(pause2)
            basic.showNumber(pause2)
            basic.showNumber(pause2)
            basic.showLeds(`
                . . . . .
                . # . # .
                . . . . .
                # . . . #
                . # # # .
                `)
            // End program until user presses logo again
            speaking = false
        }
    }
})
