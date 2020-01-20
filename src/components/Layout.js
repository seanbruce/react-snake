import React, { useState, useEffect, useCallback } from 'react';

import classes from './Layout.module.css';

const Layout = ({ scorePenal, playground, control }) => {
	const [showControl, setShowControl] = useState(false);
	const toggleShowControl = useCallback(e => {
		if (e.matches) {
			setShowControl(false);
		} else {
			setShowControl(true);
		}
	}, []);
	useEffect(() => {
		const mql = window.matchMedia('(min-width: 600px)');
		setShowControl(mql.matches ? false : true);
		const listener = mql.addListener(toggleShowControl);
		return () => {
			mql.removeListener(listener);
		};
	}, [toggleShowControl]);
	return (
		<div className={classes.layout}>
			{scorePenal}
			{playground}
			{showControl && control}
		</div>
	);
};

export default Layout;
