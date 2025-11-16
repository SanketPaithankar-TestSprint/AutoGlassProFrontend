import logo from "../assets/APAI.png";

const Logo = ({ className = "w-32 h-auto" }) => (
    <img
        src={logo}
        alt="Logo"
        className={className + " bg-transparent"}
        style={{ background: "transparent" }}
        draggable={false}
    />
);

export default Logo;
