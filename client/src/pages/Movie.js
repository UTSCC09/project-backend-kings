import React, {useContext} from 'react'
import MovieComponent from '../components/MovieComponent'
import { useLocation } from "react-router";
import { AuthContext } from '../context/auth'
import { useNavigate } from "react-router-dom";



export default function Movie() {
    const context = useContext(AuthContext);
    const location = useLocation();
    let path = location.pathname.split("/")[2];
    path = path.replaceAll("%20", " ");
    const navigate = useNavigate();

    const purchase = (movieId, title) =>{
        context.user? navigate("/movietimeslots", {
            state:{
                movieId,
                title
            }
        }) : navigate("/login")
    }

    return(<MovieComponent onPurchasePage={false}  movieName={path} navigateNext={purchase}></MovieComponent>)
}
