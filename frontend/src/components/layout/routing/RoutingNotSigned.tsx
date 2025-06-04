import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../../auth/login/Login";
import Signup from "../../auth/signup/Signup";

export default function RoutingNotSigned(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login"/>} />
            {/* <Route path="/" element={<Profile />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Login />} />
        </Routes>
    )   
}
