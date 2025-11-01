# Voice Birder

This is a mobile web application, designed to work on a phone but will also work on the web.

It uses the Picovoice API.

I want to be able to record a list of what birds I see, similar to the ebird app but I want to be able to do it with my voice.

Features:
* "Start List" in app to start a new list.
* Wake word (using Porcupine) "Record" to then start listening for an intent with Rhino.
* Code to create a Rhino context YAML file by fetching all likely birds for my area (hard code to Melbourne, Australia to start) and placing them into a slot. I can optionally say a number of birds before the bird name.
* Use the intent to add to a list of birds, or increment existing.
* Pressing "Complete List" should stop listening for wake word, and create a downloadable file in eBird Checklist Format.
* This all needs to run offline/client-side.
* Use React with typescript and local storage.