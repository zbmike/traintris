# TrainTris

## Background and Overview

Tetris is a favorite game of my family in my childhood. I always want to know how it works
and its core logic. Now that I have a chance to implement it, I want to add potentials to 
integrate some trending technology to it. In this project I consider Machine Learning,
which an AI can be trained with how the user play the game.

## Functionality and MVPs

In this app, players can
* play the classic Tetris game
* know what the next Tetromino is
* know the score they get
* play the game with increasing difficulty, as their score goes up

In addition, the game will 
* be ready to get and store the training data for AI
* when there are enough training data, AI can play the game

## Wireframes
<img src="./readme/wireframe.jpg" alt="Wireframe">

## Architecture and Technology
```
+-- dist
+-- src
|   +-- game.js
|   +-- tetrimino.js
|   +-- ai.js
+-- Index.html
+-- .gitignore
+-- node_modules
+-- package.json
+-- package.lock.json
+-- postcss.config.js
+-- README.md
+-- webpack.common.js
+-- webpack.dev.js
+-- webpack.prod.js
```
* CanvasHTML and Brain.js or TensorFlow.js

## Implementation Timeline
* First day and Second(if necessary) to implement Tetris game
* Rest of the time to research method to train Tetris AI

## Bonus
* Successful implementation of AI will be a bonus in this game