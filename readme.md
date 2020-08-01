# WSJS

A javascript-based 3D game development engine.

## Repository Contents

*WSJS* is the repository for the core code of the javascript 3D game development engine WSJS.  Running
a game requires a WSJS project, which is a directory inside the WSJS directory that contains the
games code and assets.

*WSJS_Demo* is a repository for a demonstration project; you can use this to learn about the engine or
as a starting point for creating your own game.

*WSServer* is a repository for java based game server, communicating by websockets.  It also contains a
light http server as a convenient way to run a local copy of a WSJS project.  See the project readme for
more information.

## Installation

To install, clone this (WSJS) repository into a directory.  For this example we will say the directory is WSJS.
Next, clone any of the WSJS_Demo_* projects into a folder inside the WSJS folder, for this example, the folder
will be named demo.

To start the demonstration project, start a webserver whose root is pointed at the WSJS directory
and navigate to this URL: WSJS/demo/html/index.html

## Notes

You can have as many projects as you want attached to a single instance of WSJS, each with it's own HTML
entry point.
