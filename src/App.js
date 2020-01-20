import React, { useEffect, useCallback, useReducer, useRef } from 'react';
import './App.css';

import Layout from './components/Layout';
import Playground from './components/Playground';
import Score from './components/Score';
import Control from './components/Control';
import { size } from './config';
import { useInterval } from './utils/customHooks';
import { getRandomIntInclusive } from './utils/utils';

const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	UP: 2,
	DOWN: 3
};

const ACTIONS = {
	MOVE: 'MOVE',
	TURN: 'TURN',
	START: 'START',
	PLACE_FOOD: 'PLACE_FOOD',
	PAUSE: 'PAUSE',
	RESET: 'RESET'
};

const mapDifficultyToSpeed = {
	1: 200,
	2: 170,
	3: 120,
	4: 100,
	5: 90
};

const move = () => ({ type: ACTIONS.MOVE });
const turn = direction => ({ type: ACTIONS.TURN, payload: { direction } });
const start = () => ({ type: ACTIONS.START });
const placeFood = () => ({ type: ACTIONS.PLACE_FOOD });
const pause = () => ({ type: ACTIONS.PAUSE });
const reset = () => ({ type: ACTIONS.RESET });

const generateStartPath = () => {
	const direction = getRandomIntInclusive(0, 3);
	const head = {
		x: getRandomIntInclusive(0, size[0] - 1),
		y: getRandomIntInclusive(0, size[1] - 1)
	};
	const path = [head];
	const partialState = {
		currentDirection: direction,
		path: path
	};
	switch (direction) {
		case DIRECTION.UP:
			path.push({ x: head.x, y: head.y + 1 });
			path.push({ x: head.x, y: head.y + 2 });
			return partialState;
		case DIRECTION.DOWN:
			path.push({ x: head.x, y: head.y - 1 });
			path.push({ x: head.x, y: head.y - 2 });
			return partialState;
		case DIRECTION.LEFT:
			path.push({ x: head.x + 1, y: head.y });
			path.push({ x: head.x + 2, y: head.y });
			return partialState;
		case DIRECTION.RIGHT:
			path.push({ x: head.x - 1, y: head.y });
			path.push({ x: head.x - 2, y: head.y });
			return partialState;
		default:
			return partialState;
	}
};

const getNextDifficulty = (difficulty, map = {}) => {
	const length = Object.values(map).length;
	return difficulty + 1 > length ? length : difficulty + 1;
};

const isNewFoodPositionInvalid = (food, path) => {
	return path.some(point => point.x === food.x && point.y === food.y);
};

const isSwallow = (head, food) => {
	return food ? food.x === head.x && food.y === head.y : false;
};

const getNewHead = (head, direction) => {
	const { x, y } = head;
	let nextX;
	let nextY;
	switch (direction) {
		case DIRECTION.UP:
			nextX = x;
			nextY = y - 1;
			return { x: nextX, y: nextY < 0 ? size[1] - 1 : nextY };
		case DIRECTION.DOWN:
			nextX = x;
			nextY = y + 1;
			return { x: nextX, y: nextY > size[1] - 1 ? 0 : nextY };
		case DIRECTION.LEFT:
			nextX = x - 1;
			nextY = y;
			return { x: nextX < 0 ? size[0] - 1 : nextX, y: nextY };
		case DIRECTION.RIGHT:
			nextX = x + 1;
			nextY = y;
			return { x: nextX > size[0] - 1 ? 0 : nextX, y: nextY };
		default:
			return { x, y };
	}
};

const isDigested = (tail, foodInStomach) => {
	const firstFood = foodInStomach.length > 0 ? foodInStomach[0] : null;
	return firstFood ? firstFood.x === tail.x && firstFood.y === tail.y : false;
};

const isHitBody = path => {
	const head = path[0];
	return path.slice(1).some(point => point.x === head.x && point.y === head.y);
};

const getNextPath = (path, direction, foodInStomach) => {
	const oldPath = path;
	const newPath = [];
	const oldHead = path[0];
	const oldTail = path[path.length - 1];
	const newHead = getNewHead(oldHead, direction);
	for (let index = 0; index < oldPath.length; index++) {
		if (index === 0) {
			newPath.push(newHead);
		} else {
			newPath.push(oldPath[index - 1]);
		}
	}
	const newPartialState = {
		path: newPath,
		foodInStomach: foodInStomach
	};
	if (isDigested(oldTail, foodInStomach)) {
		newPath.push(foodInStomach[0]);
		newPartialState.foodInStomach = foodInStomach.slice(1);
	}
	if (isHitBody(newPath)) {
		newPartialState.isGameOver = true;
		newPartialState.speed = null;
		newPartialState.foodSpeed = null;
	}
	return newPartialState;
};

const initialState = {
	...generateStartPath(),
	score: 0,
	turnable: true,
	isGameOver: false,
	food: null,
	foodInStomach: [],
	speed: null,
	foodSpeed: null,
	difficulty: 1
};
const reducer = (state, action) => {
	let nextState;
	switch (action.type) {
		case ACTIONS.MOVE:
			nextState = {
				...state,
				turnable: true,
				...getNextPath(state.path, state.currentDirection, state.foodInStomach)
			};
			if (isSwallow(nextState.path[0], state.food)) {
				const nextScore = state.score + 1;
				const nextDifficulty = getNextDifficulty(
					state.difficulty,
					mapDifficultyToSpeed
				);
				nextState.foodInStomach = state.foodInStomach.concat({
					x: state.food.x,
					y: state.food.y
				});
				nextState.food = null;
				nextState.score = nextScore;
				if (
					nextScore === 10 ||
					nextScore === 20 ||
					nextScore === 30 ||
					nextScore === 40 ||
					nextScore === 50
				) {
					nextState.difficulty = nextDifficulty;
					nextState.speed = mapDifficultyToSpeed[nextDifficulty];
				}
			}
			return nextState;
		case ACTIONS.TURN:
			const { direction } = action.payload;
			return {
				...state,
				currentDirection: direction,
				turnable: false
			};
		case ACTIONS.PLACE_FOOD:
			nextState = { ...state };
			if (state.food) {
				return nextState;
			} else {
				const food = {};
				do {
					food.x = getRandomIntInclusive(0, size[0] - 1);
					food.y = getRandomIntInclusive(0, size[1] - 1);
				} while (isNewFoodPositionInvalid(food, state.path));
				nextState.food = food;
				return nextState;
			}
		case ACTIONS.START:
			return {
				...state,
				speed: mapDifficultyToSpeed[state.difficulty],
				foodSpeed: 3000
			};
		case ACTIONS.RESET:
			return {
				...generateStartPath(),
				score: 0,
				turnable: true,
				isGameOver: false,
				food: null,
				foodInStomach: [],
				difficulty: 1
			};
		case ACTIONS.PAUSE:
			return {
				...state,
				speed: null,
				foodSpeed: null
			};
		default:
			return state;
	}
};

const App = () => {
	const [gameState, dispatch] = useReducer(reducer, initialState);
	const {
		score,
		path,
		currentDirection,
		turnable,
		food,
		isGameOver,
		speed,
		foodSpeed,
		difficulty
	} = gameState;
	const cachedHandleKeyDown = useRef();
	const _handleKeyDown = useCallback(
		e => {
			if (turnable) {
				switch (e.keyCode) {
					case 38:
						if (currentDirection !== DIRECTION.DOWN) {
							dispatch(turn(DIRECTION.UP));
						}
						break;
					case 40:
						if (currentDirection !== DIRECTION.UP) {
							dispatch(turn(DIRECTION.DOWN));
						}
						break;
					case 37:
						if (currentDirection !== DIRECTION.RIGHT) {
							dispatch(turn(DIRECTION.LEFT));
						}
						break;
					case 39:
						if (currentDirection !== DIRECTION.LEFT) {
							dispatch(turn(DIRECTION.RIGHT));
						}
						break;
					default:
						return;
				}
			}
		},
		[currentDirection, turnable]
	);
	useEffect(() => {
		cachedHandleKeyDown.current = _handleKeyDown;
	});

	useEffect(() => {
		const handleKeyDown = e => {
			cachedHandleKeyDown.current(e);
		};
		window.addEventListener('keydown', handleKeyDown, false);
	}, []);

	const handleMove = useCallback(() => {
		requestAnimationFrame(() => {
			dispatch(move());
		});
	}, []);

	useInterval(handleMove, speed);

	const handlePlaceFood = useCallback(() => {
		requestAnimationFrame(() => {
			dispatch(placeFood());
		});
	}, []);

	useInterval(handlePlaceFood, foodSpeed);

	useEffect(() => {
		if (isGameOver) {
			alert('游戏结束');
		}
	}, [isGameOver]);

	const handleGameStart = useCallback(() => {
		if (isGameOver) {
			dispatch(reset());
		}
		dispatch(start());
	}, [isGameOver]);

	const handleTurnUp = useCallback(() => {
		if (turnable && currentDirection !== DIRECTION.DOWN) {
			dispatch(turn(DIRECTION.UP));
		}
	}, [currentDirection, turnable]);
	const handleTurnDown = useCallback(() => {
		if (turnable && currentDirection !== DIRECTION.UP) {
			dispatch(turn(DIRECTION.DOWN));
		}
	}, [currentDirection, turnable]);
	const handleTurnLeft = useCallback(() => {
		if (turnable && currentDirection !== DIRECTION.RIGHT) {
			dispatch(turn(DIRECTION.LEFT));
		}
	}, [currentDirection, turnable]);
	const handleTurnRight = useCallback(() => {
		if (turnable && currentDirection !== DIRECTION.LEFT) {
			dispatch(turn(DIRECTION.RIGHT));
		}
	}, [currentDirection, turnable]);

	const handlePause = useCallback(() => {
		dispatch(pause());
	}, []);

	return (
		<Layout
			playground={<Playground path={path} food={food} />}
			scorePenal={
				<Score
					score={score}
					difficulty={difficulty}
					onGameStart={handleGameStart}
					onGamePause={handlePause}
					isGameStart={speed !== null}
				/>
			}
			control={
				<Control
					onTurnUp={handleTurnUp}
					onTurnDown={handleTurnDown}
					onTurnLeft={handleTurnLeft}
					onTurnRight={handleTurnRight}
				/>
			}
		/>
	);
};

export default App;
