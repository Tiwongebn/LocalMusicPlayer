import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

const PlayerContext = createContext(null);

const API_URL = "http://localhost:5078/api";

export function PlayerProvider({ children }) {
    const audioRef = useRef(null);

    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const [isPlaying, setIsPlaying] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [volume, setVolume] = useState(1);

    const [shuffle, setShuffle] = useState(false);

    const [repeat, setRepeat] = useState("off");

    const currentSong =
        currentIndex >= 0 &&
        currentIndex < queue.length
            ? queue[currentIndex]
            : null;

    /*
     * Load a song whenever currentSong changes.
     */
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio || !currentSong) {
            return;
        }

        audio.src =
            `${API_URL}/Songs/${currentSong.id}/stream`;

        audio.load();

        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
    }, [currentSong]);

    /*
     * Play.
     */
    const play = async () => {
        const audio = audioRef.current;

        if (!audio || !currentSong) {
            return;
        }

        try {
            await audio.play();

            setIsPlaying(true);
        } catch (error) {
            console.error(
                "Unable to play audio:",
                error
            );
        }
    };

    /*
     * Pause.
     */
    const pause = () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.pause();

        setIsPlaying(false);
    };

    /*
     * Toggle playback.
     */
    const togglePlay = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    /*
     * Play a specific song.
     */
    const playSong = (song, songs = []) => {
        if (songs.length > 0) {
            setQueue(songs);

            const index = songs.findIndex(
                item => item.id === song.id
            );

            setCurrentIndex(
                index >= 0 ? index : 0
            );

            return;
        }

        setQueue([song]);
        setCurrentIndex(0);
    };

    /*
     * Next song.
     */
    const next = () => {
        if (queue.length === 0) {
            return;
        }

        if (shuffle) {
            let nextIndex;

            do {
                nextIndex = Math.floor(
                    Math.random() * queue.length
                );
            } while (
                queue.length > 1 &&
                nextIndex === currentIndex
            );

            setCurrentIndex(nextIndex);

            return;
        }

        if (currentIndex < queue.length - 1) {
            setCurrentIndex(currentIndex + 1);

            return;
        }

        if (repeat === "all") {
            setCurrentIndex(0);

            return;
        }

        setIsPlaying(false);
    };

    /*
     * Previous song.
     */
    const previous = () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        /*
         * If the song has already played for more than
         * three seconds, restart it instead.
         */
        if (audio.currentTime > 3) {
            audio.currentTime = 0;

            return;
        }

        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);

            return;
        }

        if (repeat === "all" && queue.length > 0) {
            setCurrentIndex(queue.length - 1);
        }
    };

    /*
     * What happens when a song finishes.
     */
    const handleSongEnded = () => {
        if (repeat === "one") {
            const audio = audioRef.current;

            if (!audio) {
                return;
            }

            audio.currentTime = 0;

            audio.play();

            setIsPlaying(true);

            return;
        }

        next();
    };

    /*
     * Seek.
     */
    const seek = (time) => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.currentTime = time;

        setCurrentTime(time);
    };

    /*
     * Volume.
     */
    const changeVolume = (value) => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.volume = value;

        setVolume(value);
    };

    /*
     * Toggle shuffle.
     */
    const toggleShuffle = () => {
        setShuffle(
            previousValue => !previousValue
        );
    };

    /*
     * Cycle repeat:
     *
     * off → all → one → off
     */
    const cycleRepeat = () => {
        setRepeat(previous => {
            if (previous === "off") {
                return "all";
            }

            if (previous === "all") {
                return "one";
            }

            return "off";
        });
    };

    /*
     * Audio event listeners.
     */
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            if (repeat === "one") {
                audio.currentTime = 0;
                audio.play();
                return;
            }

            next();
        };

        audio.addEventListener(
            "timeupdate",
            handleTimeUpdate
        );

        audio.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata
        );

        audio.addEventListener(
            "ended",
            handleEnded
        );

        return () => {
            audio.removeEventListener(
                "timeupdate",
                handleTimeUpdate
            );

            audio.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );

            audio.removeEventListener(
                "ended",
                handleEnded
            );
        };
    }, [repeat, next]);

    return (
        <PlayerContext.Provider
            value={{
                queue,
                currentSong,
                currentIndex,

                isPlaying,

                currentTime,
                duration,

                volume,

                shuffle,
                repeat,

                play,
                pause,
                togglePlay,

                playSong,
                next,
                previous,

                seek,
                changeVolume,

                toggleShuffle,
                cycleRepeat
            }}
        >
            {children}

            <audio
                ref={audioRef}
                preload="metadata"
            />
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error(
            "usePlayer must be used inside PlayerProvider"
        );
    }

    return context;
}