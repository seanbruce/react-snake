import React from 'react';

import classes from './Control.module.css';

const Control = ({ onTurnUp, onTurnDown, onTurnLeft, onTurnRight }) => {
	return (
		<div className={classes.control}>
			<div
				className={`${classes.button} ${classes.left}`}
				onClick={onTurnLeft}
			></div>
			<div
				className={`${classes.button} ${classes.right}`}
				onClick={onTurnRight}
			></div>
			<div
				className={`${classes.button} ${classes.up}`}
				onClick={onTurnUp}
			></div>
			<div
				className={`${classes.button} ${classes.down}`}
				onClick={onTurnDown}
			></div>
		</div>
	);
};

export default Control;
