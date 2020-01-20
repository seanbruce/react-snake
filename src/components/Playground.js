import React, { useMemo, useCallback } from 'react';

import classes from './Playground.module.css';
import Block from './playground/Block';
import { size } from '../config';
const [x, y] = size;

const Playground = ({ path, food }) => {
	const blocks = useMemo(() => {
		const temp = [];
		for (let yAxis = 0; yAxis < y; yAxis++) {
			for (let xAxis = 0; xAxis < x; xAxis++) {
				const onPath = path.find(
					point => point.x === xAxis && point.y === yAxis
				);
				const isFood = food ? food.x === xAxis && food.y === yAxis : false;
				temp.push(
					<Block
						key={`x:${xAxis}y:${yAxis}`}
						onPath={onPath ? true : false}
						food={isFood}
					/>
				);
			}
		}
		return temp;
	}, [path, food]);

	const measureHeight = useCallback(elm => {
		const { width } = elm.getBoundingClientRect();
		elm.style.height = `${width}px`;
	}, []);

	return (
		<div ref={measureHeight} className={classes.playground}>
			{blocks}
		</div>
	);
};

export default Playground;
