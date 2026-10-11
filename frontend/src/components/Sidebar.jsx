import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo">
                <h2>Local Music</h2>
            </div>

            <nav>

                <NavLink to="/">
                    🏠 Home
                </NavLink>

                <NavLink to="/songs">
                    🎵 Songs
                </NavLink>

                <NavLink to="/albums">
                    💿 Albums
                </NavLink>

                <NavLink to="/artists">
                    👤 Artists
                </NavLink>

                <NavLink to="/settings">
                    ⚙️ Settings
                </NavLink>

            </nav>

        </aside>
    );
}

export default Sidebar;