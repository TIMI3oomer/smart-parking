import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate} from "react-router-dom";

const Login = () =>{
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("");
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();;
        try{
            await login(email,password);
            navigate("/dashboard");
        }catch{
            setError("Invalid Email or password");
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error &&<p style={{color:"red"}}>{error}</p>}
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}/>
            <input
            type ="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
        </form>
    );
};
export default Login;