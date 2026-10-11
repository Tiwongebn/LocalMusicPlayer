import { useEffect, useState } from "react";

import api from "../services/api";
import SongRow from "../components/SongRow";

function Library() {

    const [songs, setSongs] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        try {

            const response =
                await api.get("/Songs");

            setSongs(response.data);

        } catch (error) {

            console.error(
                "Failed to load songs:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    const filteredSongs =
        songs.filter(song => {

            const searchText =
                search.toLowerCase();

            return (
                song.title
                    ?.toLowerCase()
                    .includes(searchText) ||

                song.artist
                    ?.toLowerCase()
                    .includes(searchText) ||

                song.album
                    ?.toLowerCase()
                    .includes(searchText)
            );
        });

    if (loading) {
        return (
            <div className="page">
                Loading library...
            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header">

                <div>
                    <h1>
                        My Music
                    </h1>

                    <p>
                        {songs.length} songs
                    </p>
                </div>

                <input
                    type="search"
                    placeholder="Search your music..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

            </div>

            {filteredSongs.length === 0 ? (

                <div className="empty-library">
                    No songs found.
                </div>

            ) : (

                <div className="song-list">

                    <div className="song-header">

                        <span>#</span>

                        <span>Title</span>

                        <span>Album</span>

                        <span>Duration</span>

                    </div>

                    {filteredSongs.map(
                        (song, index) => (

                            <SongRow
                                key={song.id}
                                song={song}
                                songs={filteredSongs}
                                index={index}
                            />

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default Library;