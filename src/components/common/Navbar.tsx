import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/logo-orange.png"
import { log } from "console";
const Navbar = () => {
    return (
        <div className="flex flex-row justify-between h-24 px-[3vw]  items-center w-full">
            <div className="flex flex-row items-center gap-[0.5vw]">
                <Image src={logo} alt="logo" className="w-[5vw] h-[5vw] object-contain" />
                <h1 className="satoshiBold tracking-wider text-[#E87E2F] text-[2.5vw]">INKLUZI</h1>
            </div>
            <div className="flex flex-row gap-[2vw] text-[2vw] satoshiBold">
                <Link href="/register" className="text-[#B56225]">Register</Link>
                <Link href="/login" className="text-[#B56225]">Login</Link>
            </div>
        </div>
    )
}
export default Navbar;