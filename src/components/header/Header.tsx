import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "../ui/navigation-menu";
import Home from "./Home";
import Mode from "./Mode";
import Time from "./Time";

const Header = () => {
	return (
		<NavigationMenu className="header" role="banner">
			<NavigationMenuList className="flex-wrap">
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink asChild>
						<Home></Home>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem className="mx-[5px]">
					<Time></Time>
				</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuList className="flex-wrap">
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink asChild>
						<a href="/news">News</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem className="mx-[5px]">
					<NavigationMenuLink>
						<Mode></Mode>
					</NavigationMenuLink>
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
