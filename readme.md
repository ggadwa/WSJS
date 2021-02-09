# WSJS

A javascript-based 3D game development engine, which can be run from any webhost or locally on your machine using
the included java webhost/multiplayer server.  This multiplayer server can also be run on any webhost that can run
java applications.

## Repository Contents

*WSJS* is the repository for the core code of the javascript 3D game development engine WSJS.  It includes a
java web/multiplayer server.  Running a game requires a WSJS project, which is a directory that contains the game assets.

*WSJS_Demo* is a repository for a FPS (think DOOM) demonstration project; you can use this to learn about the engine or
as a starting point for creating your own game.

*WSJS_Demo_Kart* is a repository for a kart-based (think Mario Kart) demonstration project.

*WSJS_Demo_Platformer* is a repository for a platform-based (think Super Mario World) demonstration project.

## Running Locally (Development)

Clone this (WSJS) repository into a directory.  For this example we will say the directory is WSJS.  Create a folder
named "projects" in the WSJS directory.  Next, clone any of the demo projects into a folder within the projects folder,
for this example we will use the WSJS_Demo project, and clone it into a folder named demo.  The directory
structure should resemble:

WSJS
  src
  target
  ...
  projects
    demo
	  effects
	  entities
	  ...
    
Start the WSJS project through your IDE.

You can now hit the project in a webbrowser by navigating to: localhost/projects/demo/html/index.html

## Running Locally (Just playing)

TODO -- will require a native-wrapped app

## Running on WebHost

You can also run it directly on a regular http server.  You will not have multiplayer games but this works great for
single player games and no special software is required.

Clone this (WSJS) repository into a directory on your local machine, for this example we will say the directory is WSJS.
One your webhost (for this example, the root directory of your webhost) move over the contents of WSJS/src/main/resources/public
into your webhost.  Create a projects folder on the root of your webhost.  Next, clone any of the demo projects into a
folder on your local machine and copy that directory into the projects folder.  The directory structure on your webhost
should resemble:

public_html (your webhost root)
  code
  developer
  shaders
  projects
    demo
	  effects
	  entities
	  ...
    
Now on any browser just navigate the .../projects/demo/html/index.html file.

## Creating your own Projects

Each project is self-contained in it's own directory.  It's probably easiest to start with a project and then tweak it
to your needs.

TODO - needs docs

## Notes

You can have as many projects as you want attached to a single instance of WSJS, each with it's own HTML
entry point.
