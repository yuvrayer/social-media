import { useContext } from 'react'
import Followers from '../../follows/followers/Followers'
import Following from '../../follows/following/Following'
import Footer from '../footer/Footer'
import Header from '../header/Header'
import Routing from '../routing/Routing'
import './Layout.css'
import { AuthContext } from '../../auth/auth/Auth'
import RoutingNotSigned from '../routing/RoutingNotSigned'

export default function Layout() {

    const { jwt } = useContext(AuthContext)!
    const isLoggedIn: boolean = !!jwt

    return (
        <div className='Layout'>

            {isLoggedIn && <>
                <header>
                <Header />                
                </header>                
                <aside>
                    <Following />
                </aside>
                <aside>
                    <Followers />
                </aside>
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