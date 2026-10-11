import { useEffect, useState } from "react";

import api from "../services/api";

function Settings() {

    const [folders, setFolders] =
        useState([]);

    const [folderPath, setFolderPath] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {

            const response =
                await api.get(
                    "/MusicFolders"
                );

            setFolders(response.data);

        } catch (error) {

            console.error(
                "Failed to load folders:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    const addFolder = async () => {

        if (!folderPath.trim()) {
            return;
        }

        try {

            await api.post(
                "/MusicFolders",
                {
                    folderPath
                }
            );

            setFolderPath("");

            setMessage(
                "Music folder added."
            );

            await loadFolders();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message
                ?? "Failed to add folder."
            );
        }
    };

    const scanFolder = async (id) => {

        try {

            setMessage(
                "Scanning music folder..."
            );

            const response =
                await api.post(
                    `/MusicFolders/${id}/scan`
                );

            setMessage(
                `Scan completed. Imported ${response.data.importedCount} new songs.`
            );

            await loadFolders();

        } catch (error) {

            console.error(error);

            setMessage(
                "Failed to scan folder."
            );
        }
    };

    const removeFolder = async (id) => {

        const confirmed =
            window.confirm(
                "Remove this folder from your library?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/MusicFolders/${id}`
            );

            await loadFolders();

        } catch (error) {

            console.error(error);
        }
    };

    const cleanupLibrary = async () => {

        try {

            const response =
                await api.post(
                    "/MusicFolders/cleanup"
                );

            setMessage(
                `Cleanup complete. Removed ${response.data.removedCount} missing songs.`
            );

        } catch (error) {

            console.error(error);

            setMessage(
                "Cleanup failed."
            );
        }
    };

    if (loading) {
        return (
            <div className="page">
                Loading...
            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <h1>
                        Library Settings
                    </h1>

                    <p>
                        Manage your local music folders.
                    </p>

                </div>

            </div>

            <section className="settings-section">

                <h2>
                    Music folders
                </h2>

                <div className="add-folder">

                    <input
                        type="text"
                        value={folderPath}
                        onChange={(event) =>
                            setFolderPath(
                                event.target.value
                            )
                        }
                        placeholder={
                            "C:\\Users\\YourName\\Music"
                        }
                    />

                    <button
                        onClick={addFolder}
                    >
                        Add Folder
                    </button>

                </div>

                {message && (
                    <p>
                        {message}
                    </p>
                )}

                <div className="folder-list">

                    {folders.length === 0 ? (

                        <p>
                            No music folders configured.
                        </p>

                    ) : (

                        folders.map(folder => (

                            <div
                                key={folder.id}
                                className="folder-item"
                            >

                                <div>

                                    <strong>
                                        {folder.name}
                                    </strong>

                                    <span>
                                        {folder.path}
                                    </span>

                                </div>

                                <div>

                                    <button
                                        onClick={() =>
                                            scanFolder(
                                                folder.id
                                            )
                                        }
                                    >
                                        Scan
                                    </button>

                                    <button
                                        onClick={() =>
                                            removeFolder(
                                                folder.id
                                            )
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </section>

            <section className="settings-section">

                <h2>
                    Library maintenance
                </h2>

                <p>
                    Remove songs from the database
                    when their files no longer exist.
                </p>

                <button
                    onClick={cleanupLibrary}
                >
                    Remove Missing Files
                </button>

            </section>

        </div>
    );
}

export default Settings;