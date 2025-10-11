export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/Logo/SpeedUp.png"
            alt="SpeedUp Tutorial Center Logo"
            className={`${props.className || ''}`}
        />
    );
}
