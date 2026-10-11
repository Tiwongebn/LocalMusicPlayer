import { usePlayer } from "../context/PlayerContext";

function SongRow({ song, songs, index }) {
    const {
        currentSong,
        playSong
    } = usePlayer();

    const isCurrent =
        currentSong?.id === song.id;

    const formatDuration = (seconds) => {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes = Math.floor(
            seconds / 60
        );

        const remainingSeconds =
            Math.floor(seconds % 60);

        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div
            className={
                isCurrent
                    ? "song-row current"
                    : "song-row"
            }
            onDoubleClick={() =>
                playSong(song, songs)
            }
        >

            <div className="song-number">
                {isCurrent ? "▶" : index + 1}
            </div>

            <div className="song-title">
                <strong>
                    {song.title}
                </strong>

                <span>
                    {song.artist}
                </span>
            </div>

            <div className="song-album">
                {song.album}
            </div>

            <div className="song-duration">
                {formatDuration(
                    song.duration
                )}
            </div>

        </div>
    );
}

export default SongRow;