import { useState, useEffect } from "react";

const addZeros = (n: number): string => {
	return n.toString().length < 2 ? `0${n}` : n.toString();
};

export default function Time() {
	const [time, setTime] = useState<Date | null>(null);

	useEffect(() => {
		setTime(new Date());

		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	if (!time) return null;

	return (
		<div className="time" aria-hidden="true">
			<div className="hora">{addZeros(time.getHours())}</div>
			<div>:</div>
			<div className="min">{addZeros(time.getMinutes())}</div>
		</div>
	);
}
