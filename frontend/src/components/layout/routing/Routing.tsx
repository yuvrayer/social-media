import { Navigate, Route, Routes } from "react-router-dom";
import Profile from "../../posts/profile/Profile";
import Feed from "../../posts/feed/Feed";
import NotFound from "../not-found/NotFound";
import EditPost from "../../posts/edit/EditPost";
import User from "../../posts/user/User";
import Search from "../../posts/search/Search";
import FollowRequest from "../../posts/followRequest/FollowRequest";

export default function Routing(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/profile" />} />
            {/* <Route path="/" element={<Profile />} /> */}
            <Route path="/followRequests" element={<FollowRequest />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/edit/:id/" element={<EditPost />} />
            <Route path="/user" element={<User />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
