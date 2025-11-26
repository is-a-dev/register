// src/lib/utils.ts
export function cn(...classes: (string | boolean | undefined | null)[]) {
	return classes.filter(Boolean).join(" ");
}
