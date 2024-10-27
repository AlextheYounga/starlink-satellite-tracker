export function handleTime() {
	// Returns amount of radians in which to rotate scene to orient with sun.
	// UTC Greenwhich Mean happens to be at just about midnight by default, which makes this problem easy.
	// This time is surprisingly accurate.
	
	const now = new Date();
	const secondsInADay = 86400;
	const currentHour = now.getUTCHours();
	const currentMinute = now.getUTCMinutes();
	const currentSecond = now.getUTCSeconds();
	const currentHourSeconds = 3600 * currentHour;
	const currentMinuteSeconds = 60 * currentMinute;
	const timeFraction = (currentHourSeconds + currentMinuteSeconds + currentSecond) / secondsInADay;
	const rotationRadians = timeFraction * Math.PI * 2; // Full rotation in radians

	return rotationRadians
}