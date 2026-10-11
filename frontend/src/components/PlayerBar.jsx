import { usePlayer } from "../context/PlayerContext";

function PlayerBar() {
    const {
        currentSong,
        isPlaying,

        currentTime,
        duration,

        volume,

        shuffle,
        repeat,

        togglePlay,
        next,
        previous,

        seek,
        changeVolume,

        toggleShuffle,
        cycleRepeat
    } = usePlayer();

    if (!currentSong) {
        return (
            <div className="player-bar empty">
                <span>
                    Nothing playing
                </span>
            </div>
        );
    }

    const formatTime = (seconds) => {
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
        <div className="player-bar">

            <div className="player-song">
                <div className="player-artwork">
                    🎵
                </div>

                <div>
                    <strong>
                        {currentSong.title}
                    </strong>

                    <span>
                        {currentSong.artist}
                    </span>
                </div>
            </div>

            <div className="player-controls">

                <div className="control-buttons">

                    <button
                        onClick={toggleShuffle}
                        className={
                            shuffle
                                ? "active"
                                : ""
                        }
                        title="Shuffle"
                    >
                        🔀
                    </button>

                    <button
                        onClick={previous}
                        title="Previous"
                    >
                        ⏮
                    </button>

                    <button
                        onClick={togglePlay}
                        className="play-button"
                        title={
                            isPlaying
                                ? "Pause"
                                : "Play"
                        }
                    >
                        {isPlaying
                            ? "⏸"
                            : "▶"}
                    </button>

                    <button
                        onClick={next}
                        title="Next"
                    >
                        ⏭
                    </button>

                    <button
                        onClick={cycleRepeat}
                        className={
                            repeat !== "off"
                                ? "active"
                                : ""
                        }
                        title="Repeat"
                    >
                        {repeat === "one"
                            ? "🔂"
                            : "🔁"}
                    </button>

                </div>

                <div className="progress-container">

                    <span>
                        {formatTime(currentTime)}
                    </span>

                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(event) =>
                            seek(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    />

                    <span>
                        {formatTime(duration)}
                    </span>

                </div>

            </div>

            <div className="volume-control">

                <span>
                    🔊
                </span>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(event) =>
                        changeVolume(
                            Number(
                                event.target.value
                            )
                        )
                    }
                />

            </div>

        </div>
    );
}

export default PlayerBar;