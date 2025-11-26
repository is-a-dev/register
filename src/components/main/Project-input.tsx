import { useState } from "react";
import { Link } from "react-router-dom";

type ProjectProps = {
	id: number;
	title: string;
};

export default function Project({ id, title }: ProjectProps) {
	const [src, setSrc] = useState(`/img/${id}.svg`);
	const [name, setName] = useState("form__div__img-ok");

	return (
		<Link to={`/pages/${id}`} className="form__div">
			<img
				src={src}
				width={80}
				height={80}
				alt={title}
				className={name}
				onError={() => {
					setName("");
					setSrc("/img/err.png");
				}}
			/>
			{title}
		</Link>
	);
}
