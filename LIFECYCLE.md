Clicking "Start Voice Commands" should:
* reset all speech related state
* start porcupine listening for wakeword
* Change the button text/action to "Stop Listening"
* Show "Say Record to start" label.

When a wake word is received it should:
* start rhino listening for intent
* Show "Listening for bird" label

If a wake word is received while rhino is listening, it should reset rhino (stop and start it)

When Rhino returns an intent, it should:
* be processed (i.e. added to the list) exactly once
* Return to a state equivalent to having just clicked "Start Voice Commands" (i.e. listening for new wake word, show original label, tec...)

Clicking "Stop Listening" should reset all speech related state.