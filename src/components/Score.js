import React from 'react';

import classes from './Score.module.css';

const Score = ({
	score = 0,
	onGameStart,
	isGameStart = false,
	onGamePause,
	difficulty = 1
}) => {
	return (
		<div className={classes.score}>
			<span className={classes.scoreText}>得分: {score}</span>
			<span className={classes.scoreText}>难度: {difficulty}</span>
			<button
				className={`${classes.scoreButton} ${isGameStart ? classes.pause : ''}`}
				type="button"
				onClick={isGameStart ? onGamePause : onGameStart}
			>
				{isGameStart ? '暂停游戏' : '开始游戏'}
			</button>
		</div>
	);
};

export default Score;
