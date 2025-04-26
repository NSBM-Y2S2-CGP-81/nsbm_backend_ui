import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { AiOutlineUser } from "react-icons/ai";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar({ name = "NSBM Super App - Club & Society's MIC Interface" }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 p-5">
      <div
        className="pt-5 pb-5 flex flex-row gap-5 items-center justify-between w-full px-4
          bg-white/10 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl
          border border-white/20 shadow-lg shadow-white/10"
      >
        <div className="pl-10">
          <Image
            src="/assets/images/logo.png"
            width={30}
            height={30}
            alt="Logo"
            className="filter brightness-125 drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
          />
        </div>

        <div className="flex-1 text-center">
          <h1 className="text-white text-lg font-semibold">{name}</h1>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="pr-10">
              <Button
                variant="outline"
                size="default"
                className="border-white/30 bg-white/10
                          backdrop-blur-lg hover:bg-white/20
                          transition duration-300 ease-in-out"
              >
                <AiOutlineUser
                  size={30}
                  className="text-white/80 hover:text-white"
                />
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
