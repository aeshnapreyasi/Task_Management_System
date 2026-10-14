import {useEffect, useState} from 'react';
import {Navigate, Outlet} from 'react-router-dom';

const DirectAccessGarud =() => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try{  
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if(response.status === 401){
          if(!cancelled) setUser(null);
          return;
        }
        const result = await response.json();

        if(!response.ok){
          throw new Error(result.message || "Could not load your account.");
        }} catch(requestError) {
          if(!cancelled){
            setError(requestError.message || "Could not connect to the server.");
          }
        } finally {
          if(!cancelled) setLoading(false);
        }
      } 
      loadCurrentUser();

      return () => {
        cancelled  = true;
      };
    }, []);

    if(loading) return <p> Check your login.. </p>;
    if(error) return <p role='alert'>{error}</p>;
    if(!user) return <Navigate to = "/login" replace />;

    return <Outlet context={user} />;
  };

  
export default DirectAccessGarud;