import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "./ui/navigation-menu";

const Header = () => {
	return (
		<NavigationMenu className="justify-between h-[46px] px-5 py-1 bg-mainground">
			<NavigationMenuList className="flex-wrap">
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink asChild>
						<a href="/">Home</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem className="mx-[5px]">Hora</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuList className="flex-wrap">
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink asChild>
						<a href="/news">News</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink>Theme Mode</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink>Language</NavigationMenuLink>
					{/* triger */}
				</NavigationMenuItem>
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink asChild>
						<a href="config">Config</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

export default Header;
