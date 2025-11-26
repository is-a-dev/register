// src/pages/home.tsx
import Main from "@/components/main/Main";
import Project from "@/components/main/Project-input";

export default function Home() {
	return (
		<Main title="My Home" className="cont__flex">
			<div>
				<p>
					Esta es mi aplicación personal la iré actualizando y subiendo mis
					proyectos a medida que avance.
				</p>
				<p>Pienso tener 3 secciones</p>
				<ul>
					<li>
						una de presentación donde habrán insignias de los lenguajes que sé
					</li>
					<li>Otra sobre los proyectos</li>
					<li>Otra sobre contacto</li>
				</ul>
				<p>
					Lamento si no parece completo, ando refactorizando desde mi página
					anterior <a href="fuis18.github.com">Old Page</a> y{" "}
					<a href="fuis18-next.vercel.com">old Page</a>
				</p>
				<p>
					Estado metido últimamente en hacer mi dotfiles para Archlinux,
					visualmente ya lo acabe, falta Nvchad y que se conecte a mis audifonos
					cuando lo conecto por bluetooth
				</p>
				<p>
					Comprendo si hay dificultades si hablas ingles, también podre un intl,
					solo que la universidad y el trabajo no me dejan
				</p>
				<p>
					Aunque no es un trabajo de la industria, es de mesero, tengo
					compañeros muy bueno, pero la pasión de la programación nunca la
					dejaré
				</p>
				<p>
					Otra página que hice para una amiga que si la complete, jeje{" "}
					<a href="healthy-life-a.vercel.app/">Healhy</a>, comprendo que parece
					de comercio, pero solo le ayude para una feria para la universidad, no
					hay ninguna empresa en sí
				</p>
				<p>Si me lo permiten, le pondré mucho esfuerzo a esta página :D</p>
				<a href="/about">About</a>
			</div>
		</Main>
	);
}
