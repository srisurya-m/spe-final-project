import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { userExist } from "../redux/reducer/userReducer";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const[pincode,setPincode]=useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async () => {

    try {
      const trimmedUsername = name.trim(); // to remove additional white spaces
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/user/new`,
        {
          name: trimmedUsername,
          email,
          phoneNumber: phoneno,
          pincode
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setEmail("");
        setPhoneno("");
        setPincode("");
        const userData = response.data.user;
        dispatch(userExist(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
      } else {
        toast.error(response.data.message);
        setName("");
        setEmail("");
        setPhoneno("");
        setPincode("");
      }
    } catch (error) {
      toast.error("INTERNAL SERVER ERROR");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      console.log(user.photoURL);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/user/new`,
        {
          email: user.email,
          photo: user.photoURL,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setEmail("");
        setPhoneno("");
        const userData = response.data.user;
        dispatch(userExist(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
      } else {
        toast.error(response.data.message);
        setName("");
        setEmail("");
        setPhoneno("");
      }
    } catch (error) {
      toast.error("Please SignUp");
    }
  };

  return (
    <div className="signin-container">
  <div className="signin-box">
    <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
      <div className="form-group">
        <label htmlFor="username">Name</label>
        <input
          type="text"
          id="username"
          required
          placeholder="Enter Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Id</label>
        <input
          type="email"
          id="email"
          placeholder="Enter email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneno">Phone no</label>
        <input
          type="tel"
          id="phoneno"
          minLength={10}
          maxLength={10}
          required
          placeholder="Enter phone no"
          value={phoneno}
          onChange={(e) => {
            setPhoneno(e.target.value);
          }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pincode">Pincode</label>
        <input
          type="tel"
          id="pincode"
          minLength={6}
          maxLength={6}
          required
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value);
          }}
        />
      </div>

      

      <button type="submit" className="btn-signup">
        Sign Up
      </button>
    </form>

    <div className="divider">or</div>
    <button onClick={handleGoogleSignIn} className="btn-google">
      <span className="google-icon">G</span> Login with Google
    </button>
  </div>
</div>

  );
};

export default Login;
