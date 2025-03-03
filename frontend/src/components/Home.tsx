import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Home = ()=>{
    const navigate = useNavigate();

    const handleProfile = () => {
        const token = localStorage.getItem('token') || '';
        if(!token){
            navigate('/');
        }
        else{
            const obj : {id : number} = jwtDecode(token);
            const id = obj.id;
            navigate(`/profile/${id}`);
        }
    }

    return(
        <><button onClick={()=>{
            handleProfile();
        }}>Profile</button></>
    )
}

export default Home