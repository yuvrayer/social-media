import { useContext, useState } from 'react'
import Followers from '../../follows/followers/Followers'
import Following from '../../follows/following/Following'
import Footer from '../footer/Footer'
import Header from '../header/Header'
import Routing from '../routing/Routing'
import './Layout.css'
import { AuthContext } from '../../auth/auth/Auth'
import RoutingNotSigned from '../routing/RoutingNotSigned'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { setIsGameOpen } from '../../../redux/games'
import FollowersModal from '../../follows/followersModel/FollowersModal'
import FollowingModal from '../../follows/followingModal/FollowingModal'

export default function Layout() {

    const { jwt } = useContext(AuthContext)!
    const isLoggedIn: boolean = !!jwt

    const isGameOpen = useAppSelector(state => state.games.isGameOpen);
    const dispatch = useAppDispatch()
    function toggleChange() {
        dispatch(setIsGameOpen(!isGameOpen))
    }

    const [showFollowersPopup, setShowFollowersPopup] = useState(false)
    const [showFollowingPopup, setShowFollowingPopup] = useState(false)

    return (
        <div className={`LayoutWrapper ${isGameOpen ? 'game-open' : ''}`}>
            <div className="LayoutContent">
                {showFollowersPopup && <FollowersModal onClose={() => setShowFollowersPopup(false)} />}
                {showFollowingPopup && <FollowingModal onClose={() => setShowFollowingPopup(false)} />}
                {isLoggedIn && <>
                    <header>
                        <Header />
                    </header>
                    {!isGameOpen &&
                        <>
                            <aside>
                                <>
                                    <i
                                        className={`arrow bi bi-arrow-left-circle`}
                                        onClick={toggleChange}
                                    />
                                    <Following startPopUp={() => setShowFollowingPopup(true)} />
                                </>
                            </aside>
                            <aside>
                                <Followers startPopUp={() => setShowFollowersPopup(true)} />
                            </aside>
                        </>
                    }

                    {isGameOpen &&
                        <i
                            className={`arrow bi bi-arrow-left-circle`}
                            onClick={toggleChange}
                        />}

                    <main>
                        <Routing />
                    </main>
                    {!isGameOpen && <footer>
                        <Footer />
                    </footer>}
                </>}

                {!isLoggedIn && <>
                    <RoutingNotSigned />
                </>}

            </div>
        </div>
    )
}