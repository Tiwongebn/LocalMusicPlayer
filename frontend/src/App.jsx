import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import {
    PlayerProvider
} from "./context/PlayerContext";

import Sidebar from "./components/Sidebar";
import PlayerBar from "./components/PlayerBar";
import Library from "./pages/Library";
import Settings from "./pages/Settings";

function App() {

    return (
        <BrowserRouter>

            <PlayerProvider>

                <div className="app">

                    <Sidebar />

                    <main className="main-content">

                        <Routes>

                            <Route
                                path="/"
                                element={<Library />}
                            />

                            <Route
                                path="/songs"
                                element={<Library />}
                            />

                            <Route
                                path="/settings"
                                element={<Settings />}
                            />

                        </Routes>

                    </main>

                    <PlayerBar />

                </div>

            </PlayerProvider>

        </BrowserRouter>
    );
}

export default App;