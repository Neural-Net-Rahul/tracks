import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [isVerified, setIsVerified] = useState<string | Boolean>('checking');
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getData = async (id:number) => {
    // get data to show

  }
  
  const verifyUser = async(id: number, token:string)=>{
    try{
      const response = await axios.post('http://localhost:3000/api/users/verify',{id,token});
      if(response.status === 200){
        setIsVerified(true);
        getData(id);
      }
    }
    catch(e){
      navigate('/');
      console.log('Error',e);
    }
  }

  useEffect(()=>{
    const token = localStorage.getItem('token') || '';
    if(token){
      verifyUser(Number(userId),token);
    }
    else{
      navigate('/');
    }
  },[])

  async function createTrack(){
    try{
      const token =  localStorage.getItem('token') || '';
      if(!token){
        navigate('/')
      }
      const response = await axios.post('http://localhost:3000/api/users/create',{token});
      navigate(`/create/${response.data.trackId}`);
    }
    catch(e:any){
      if(e.status == 401){
        alert('User is not verified');
        navigate('/')
        return;
      }
      alert('Problem in creating track');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {isVerified === "checking" ? (
        <div>Fetching Profile</div>
      ) : isVerified === true ? (
        <div>
          Profile
          <button onClick={()=>{
            createTrack();
          }}>Create</button>
        </div>
      ) : (
        <div>Please Login</div>
      )}
    </div>
  );

};

export default Profile;
