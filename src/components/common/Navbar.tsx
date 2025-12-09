import Link from "next/link";
const Navbar = () => {
    return (
        <div className="flex flex-row justify-between h-24 px-[3vw]  items-center w-full">
            <h1>Navbar</h1>

            <div className="flex flex-row gap-[2vw] text-[2vw] satoshiBold">
                <Link href="/register" className="text-[#B56225]">Register</Link>
                <Link href="/login" className="text-[#B56225]">Login</Link>
            </div>
        </div>
    )
}
export default Navbar;