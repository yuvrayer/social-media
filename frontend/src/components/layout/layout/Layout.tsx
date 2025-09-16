import { useContext } from 'react'
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

export default function Layout() {

    const { jwt } = useContext(AuthContext)!
    const isLoggedIn: boolean = !!jwt

    const isGameOpen = useAppSelector(state => state.games.isGameOpen);
    const dispatch = useAppDispatch()
    function toggleChange() {
        dispatch(setIsGameOpen(!isGameOpen))
    }

    return (
        <div className={isGameOpen ? `LayoutGame` : `Layout`}>

            {isGameOpen && <div></div>}
            {isLoggedIn && <>
                <header>
                    <Header />
                </header>
                {!isGameOpen &&
                    <>
                        <aside>
                            <Following />
                        </aside>
                        <aside>
                            <Followers />
                        </aside>
                    </>
                }
                {isGameOpen &&
                    <i className="bi bi-arrow-right-circle" onClick={toggleChange}></i>
                }
                <main>
                    <Routing />
                </main>
                <footer>
                    <Footer />
                </footer>
            </>}

            {!isLoggedIn && <>
                <RoutingNotSigned />
            </>}

        </div>
    )
}