import React from 'react';

import classes from './Block.module.css';
import { size } from '../../config';
const [x, y] = size;

const Block = ({ onPath = false, food = false }) => {
	let backgroundColor;
	if (food) {
		backgroundColor = 'lightcoral';
	} else if (onPath) {
		backgroundColor = 'lightgreen';
	} else {
		backgroundColor = '';
	}
	return (
		<div
			className={classes.block}
			style={{
				width: `${100 / x}%`,
				height: `${100 / y}%`,
				backgroundColor: backgroundColor
			}}
		></div>
	);
};

export default Block;
