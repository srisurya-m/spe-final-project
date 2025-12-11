import { signOut } from "firebase/auth";
import { userNotExist } from "../redux/reducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { userReducerInitialState } from "../types/reducerTypes";

const QuickSettings = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      await signOut(auth);
      dispatch(userNotExist());
      toast.success("Logged Out Successfully!");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="logout-box">
      {user?.role === "admin" || user?.role === "distributor" ? (
        <Link to={"/dashboard"} className="link-button">My Dashboard</Link>
      ) : (
        <Link to={"/profile"} className="link-button">My Profile</Link>
      )}
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default QuickSettings;
