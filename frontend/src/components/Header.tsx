import { useSelector } from "react-redux";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { userReducerInitialState } from "../types/reducerTypes";
import { useEffect, useRef, useState } from "react";
import QuickSettings from "./QuickSettings";

const Header = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target as Node)
    ) {
      setShowLogout(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  return (
    <div className="navbar">
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div className="buttons">
        <button className="Homebutton" onClick={() => navigate("/")}>
          Home
        </button>
        <button className="Servicebutton" onClick={() => navigate("/services")}>
          Services
        </button>
        {user ? (
          <>
            <div ref={profileRef} style={{ position: "relative" }}>
              <img
                className="user-photo"
                src={`${user.photo}`}
                alt="user photo"
                onClick={() => setShowLogout((prev) => !prev)}
              />
              {showLogout && <QuickSettings />}
            </div>
          </>
        ) : (
          <>
            <button className="Loginbutton" onClick={() => navigate("/login")}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
